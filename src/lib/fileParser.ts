import Papa from 'papaparse';
import type { Transaction } from './subscriptionDetector';

export type SupportedFileType = 'csv' | 'ofx' | 'qfx' | 'txt';

export function detectFileType(fileName: string, content: string): SupportedFileType {
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (extension === 'ofx' || extension === 'qfx') {
    return extension as SupportedFileType;
  }
  
  // Check content for OFX/QFX markers
  if (content.includes('<OFX>') || content.includes('OFXHEADER')) {
    return 'ofx';
  }
  
  if (extension === 'csv') return 'csv';
  if (extension === 'txt') return 'txt';
  
  return 'csv'; // Default
}

// Parse OFX/QFX (Open Financial Exchange) format
export function parseOFX(content: string): Transaction[] {
  const transactions: Transaction[] = [];
  
  // Extract transactions using regex
  const stmtTrnPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  
  while ((match = stmtTrnPattern.exec(content)) !== null) {
    const block = match[1];
    
    // Extract fields
    const getField = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<\r\n]+)`, 'i');
      const fieldMatch = block.match(regex);
      return fieldMatch ? fieldMatch[1].trim() : '';
    };
    
    const trnType = getField('TRNTYPE');
    const datePosted = getField('DTPOSTED');
    const amount = parseFloat(getField('TRNAMT')) || 0;
    const name = getField('NAME') || getField('MEMO') || getField('PAYEE');
    const memo = getField('MEMO');
    
    if (name && amount !== 0) {
      // Parse OFX date format (YYYYMMDD or YYYYMMDDHHMMSS)
      let formattedDate = datePosted;
      if (datePosted.length >= 8) {
        const year = datePosted.slice(0, 4);
        const month = datePosted.slice(4, 6);
        const day = datePosted.slice(6, 8);
        formattedDate = `${month}/${day}/${year}`;
      }
      
      transactions.push({
        date: formattedDate,
        description: memo ? `${name} - ${memo}` : name,
        amount: Math.abs(amount),
        type: amount < 0 ? 'debit' : 'credit',
        rawData: { trnType, name, memo },
      });
    }
  }
  
  // Also try SGML-style OFX (without closing tags)
  if (transactions.length === 0) {
    const lines = content.split('\n');
    let currentTrn: Partial<Transaction> & { rawAmount?: number } = {};
    let inTransaction = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '<STMTTRN>') {
        inTransaction = true;
        currentTrn = {};
        continue;
      }
      
      if (trimmed === '</STMTTRN>' || (inTransaction && trimmed.startsWith('<') && !trimmed.includes('>'))) {
        if (currentTrn.description && currentTrn.rawAmount !== undefined) {
          transactions.push({
            date: currentTrn.date || '',
            description: currentTrn.description,
            amount: Math.abs(currentTrn.rawAmount),
            type: currentTrn.rawAmount < 0 ? 'debit' : 'credit',
            rawData: {},
          });
        }
        if (trimmed === '</STMTTRN>') {
          inTransaction = false;
        }
        continue;
      }
      
      if (inTransaction) {
        if (trimmed.startsWith('<TRNAMT>')) {
          currentTrn.rawAmount = parseFloat(trimmed.replace('<TRNAMT>', ''));
        } else if (trimmed.startsWith('<DTPOSTED>')) {
          const dateStr = trimmed.replace('<DTPOSTED>', '');
          if (dateStr.length >= 8) {
            currentTrn.date = `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}/${dateStr.slice(0, 4)}`;
          }
        } else if (trimmed.startsWith('<NAME>')) {
          currentTrn.description = trimmed.replace('<NAME>', '');
        } else if (trimmed.startsWith('<MEMO>') && !currentTrn.description) {
          currentTrn.description = trimmed.replace('<MEMO>', '');
        }
      }
    }
  }
  
  return transactions;
}

// Smart column detection for CSV parsing
function detectColumns(headers: string[]): { dateCol: number; descCol: number; amountCol: number; debitCol: number; creditCol: number } {
  const normalized = headers.map(h => h.toLowerCase().trim());
  
  let dateCol = -1;
  let descCol = -1;
  let amountCol = -1;
  let debitCol = -1;
  let creditCol = -1;
  
  normalized.forEach((h, i) => {
    if (dateCol === -1 && (h.includes('date') || h.includes('posted') || h === 'trans. date')) {
      dateCol = i;
    }
    if (descCol === -1 && (h.includes('description') || h.includes('merchant') || h.includes('payee') || h.includes('name') || h.includes('memo') || h.includes('narrative') || h.includes('details'))) {
      descCol = i;
    }
    if (amountCol === -1 && (h === 'amount' || (h.includes('amount') && !h.includes('debit') && !h.includes('credit')))) {
      amountCol = i;
    }
    if (debitCol === -1 && (h.includes('debit') || h.includes('withdrawal') || h.includes('money out'))) {
      debitCol = i;
    }
    if (creditCol === -1 && (h.includes('credit') || h.includes('deposit') || h.includes('money in'))) {
      creditCol = i;
    }
  });
  
  if (dateCol === -1) dateCol = 0;
  if (descCol === -1) descCol = normalized.length > 2 ? 1 : 0;
  
  return { dateCol, descCol, amountCol, debitCol, creditCol };
}

// Parse CSV format
export function parseCSV(csvText: string): Transaction[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
  
  if (!result.data || result.data.length === 0) {
    // Try without headers
    const noHeaderResult = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
    });
    
    if (noHeaderResult.data && noHeaderResult.data.length > 1) {
      const rows = noHeaderResult.data as string[][];
      const headers = rows[0];
      const { dateCol, descCol, amountCol, debitCol, creditCol } = detectColumns(headers);
      
      const transactions: Transaction[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;
        
        const description = row[descCol] || row[1] || '';
        let amount = 0;
        let type: 'debit' | 'credit' = 'debit';
        
        if (debitCol >= 0 && row[debitCol]) {
          const num = parseFloat(row[debitCol].replace(/[$,\s()]/g, ''));
          if (!isNaN(num) && num !== 0) {
            amount = Math.abs(num);
            type = 'debit';
          }
        }
        if (amount === 0 && creditCol >= 0 && row[creditCol]) {
          const num = parseFloat(row[creditCol].replace(/[$,\s()]/g, ''));
          if (!isNaN(num) && num !== 0) {
            amount = Math.abs(num);
            type = 'credit';
          }
        }
        if (amount === 0 && amountCol >= 0 && row[amountCol]) {
          const cleaned = row[amountCol].replace(/[$,\s()]/g, '');
          const num = parseFloat(cleaned);
          if (!isNaN(num)) {
            amount = Math.abs(num);
            type = num < 0 || row[amountCol].includes('-') ? 'debit' : 'credit';
          }
        }
        
        // Fallback: find any numeric value
        if (amount === 0) {
          for (let j = 2; j < row.length; j++) {
            const num = parseFloat(row[j]?.replace(/[$,\s()]/g, ''));
            if (!isNaN(num) && num !== 0) {
              amount = Math.abs(num);
              type = num < 0 || row[j].includes('-') ? 'debit' : 'credit';
              break;
            }
          }
        }
        
        if (description && amount > 0) {
          transactions.push({
            date: row[dateCol] || row[0] || '',
            description,
            amount,
            type,
            rawData: {},
          });
        }
      }
      
      return transactions;
    }
    
    return [];
  }
  
  const headers = Object.keys(result.data[0] as Record<string, string>);
  const { dateCol, descCol, amountCol, debitCol, creditCol } = detectColumns(headers);
  
  const transactions: Transaction[] = [];
  
  for (const row of result.data as Record<string, string>[]) {
    if (!row || typeof row !== 'object') continue;
    
    const values = Object.values(row);
    
    // Get description
    let description = '';
    if (descCol >= 0 && values[descCol]) {
      description = values[descCol];
    } else {
      for (const val of values) {
        if (typeof val === 'string' && val.length > description.length && !/^[\d.,\-$\s()]+$/.test(val)) {
          description = val;
        }
      }
    }
    
    let amount = 0;
    let type: 'debit' | 'credit' = 'debit';
    
    if (debitCol >= 0 && values[debitCol]) {
      const num = parseFloat(String(values[debitCol]).replace(/[$,\s()]/g, ''));
      if (!isNaN(num) && num !== 0) {
        amount = Math.abs(num);
        type = 'debit';
      }
    }
    if (amount === 0 && creditCol >= 0 && values[creditCol]) {
      const num = parseFloat(String(values[creditCol]).replace(/[$,\s()]/g, ''));
      if (!isNaN(num) && num !== 0) {
        amount = Math.abs(num);
        type = 'credit';
      }
    }
    if (amount === 0 && amountCol >= 0 && values[amountCol]) {
      const val = String(values[amountCol]);
      const num = parseFloat(val.replace(/[$,\s()]/g, ''));
      if (!isNaN(num)) {
        amount = Math.abs(num);
        type = num < 0 || val.includes('-') || val.includes('(') ? 'debit' : 'credit';
      }
    }
    
    // Fallback
    if (amount === 0) {
      for (const val of values) {
        const str = String(val);
        const num = parseFloat(str.replace(/[$,\s()]/g, ''));
        if (!isNaN(num) && num !== 0 && str.length < 15) {
          amount = Math.abs(num);
          type = num < 0 || str.includes('-') || str.includes('(') ? 'debit' : 'credit';
          break;
        }
      }
    }
    
    if (description && amount > 0) {
      transactions.push({
        date: dateCol >= 0 ? values[dateCol] || '' : '',
        description,
        amount,
        type,
        rawData: row,
      });
    }
  }
  
  return transactions;
}

// Parse plain text (tab or space delimited)
export function parseTXT(content: string): Transaction[] {
  // Try to detect delimiter
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const firstLine = lines[0];
  let delimiter = '\t';
  
  if (!firstLine.includes('\t')) {
    delimiter = ',';
  }
  
  // Use CSV parser with detected delimiter
  return parseCSV(content);
}

// Main parsing function
export function parseFile(fileName: string, content: string): Transaction[] {
  const fileType = detectFileType(fileName, content);
  
  switch (fileType) {
    case 'ofx':
    case 'qfx':
      return parseOFX(content);
    case 'txt':
      return parseTXT(content);
    case 'csv':
    default:
      return parseCSV(content);
  }
}

// Get supported file extensions
export function getSupportedExtensions(): string[] {
  return ['.csv', '.ofx', '.qfx', '.txt'];
}

export function getSupportedExtensionsDisplay(): string {
  return 'CSV, OFX, QFX, TXT';
}
