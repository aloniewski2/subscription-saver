import Papa from 'papaparse';

// Categories for classification
type SubscriptionCategory = 'Entertainment' | 'Music' | 'Productivity' | 'Storage' | 'Fitness' | 'Health' | 'Gaming' | 'News' | 'Reading' | 'Food' | 'Security' | 'Dating' | 'Education' | 'AI' | 'Professional' | 'Design' | 'Development' | 'Web' | 'Business' | 'Marketing' | 'Finance' | 'Home' | 'Bill' | 'Other';

// Known subscription patterns for detection
export const SUBSCRIPTION_PATTERNS = [
  // Streaming
  { name: 'Netflix', patterns: ['netflix', 'nflx'], category: 'Entertainment' as SubscriptionCategory, icon: '🎬', avgCost: 15.49, isSubscription: true },
  { name: 'Spotify', patterns: ['spotify', 'spot'], category: 'Music' as SubscriptionCategory, icon: '🎵', avgCost: 10.99, isSubscription: true },
  { name: 'Apple Music', patterns: ['apple music', 'itunes', 'apple.com/bill', 'apple.com', 'apple services', 'apple one'], category: 'Music' as SubscriptionCategory, icon: '🍎', avgCost: 10.99, isSubscription: true },
  { name: 'Disney+', patterns: ['disney+', 'disney plus', 'disneyplus', 'disney streaming', 'disneystreaming'], category: 'Entertainment' as SubscriptionCategory, icon: '🏰', avgCost: 13.99, isSubscription: true },
  { name: 'HBO Max', patterns: ['hbo', 'hbomax', 'max.com', 'wbd streaming'], category: 'Entertainment' as SubscriptionCategory, icon: '📺', avgCost: 15.99, isSubscription: true },
  { name: 'Hulu', patterns: ['hulu'], category: 'Entertainment' as SubscriptionCategory, icon: '📺', avgCost: 17.99, isSubscription: true },
  { name: 'Amazon Prime', patterns: ['amazon prime', 'prime video', 'amzn prime', 'prime member'], category: 'Entertainment' as SubscriptionCategory, icon: '📦', avgCost: 14.99, isSubscription: true },
  { name: 'YouTube Premium', patterns: ['youtube premium', 'youtube music', 'google youtube', 'ytpremium'], category: 'Entertainment' as SubscriptionCategory, icon: '▶️', avgCost: 13.99, isSubscription: true },
  { name: 'Paramount+', patterns: ['paramount', 'cbs all access'], category: 'Entertainment' as SubscriptionCategory, icon: '⭐', avgCost: 11.99, isSubscription: true },
  { name: 'Peacock', patterns: ['peacock', 'nbcuniversal'], category: 'Entertainment' as SubscriptionCategory, icon: '🦚', avgCost: 5.99, isSubscription: true },
  { name: 'Crunchyroll', patterns: ['crunchyroll'], category: 'Entertainment' as SubscriptionCategory, icon: '🎌', avgCost: 7.99, isSubscription: true },
  { name: 'Apple TV+', patterns: ['apple tv', 'appletv'], category: 'Entertainment' as SubscriptionCategory, icon: '📺', avgCost: 9.99, isSubscription: true },
  { name: 'ESPN+', patterns: ['espn+', 'espn plus'], category: 'Entertainment' as SubscriptionCategory, icon: '🏈', avgCost: 10.99, isSubscription: true },
  
  // Productivity & Software
  { name: 'Microsoft 365', patterns: ['microsoft 365', 'office 365', 'msft', 'microsoft*office', 'ms365'], category: 'Productivity' as SubscriptionCategory, icon: '📎', avgCost: 99.99, isSubscription: true },
  { name: 'Adobe Creative Cloud', patterns: ['adobe', 'creative cloud', 'photoshop', 'acrobat'], category: 'Productivity' as SubscriptionCategory, icon: '🎨', avgCost: 54.99, isSubscription: true },
  { name: 'Notion', patterns: ['notion', 'notion.so'], category: 'Productivity' as SubscriptionCategory, icon: '📝', avgCost: 10.00, isSubscription: true },
  { name: 'Dropbox', patterns: ['dropbox', 'dropbox.com'], category: 'Storage' as SubscriptionCategory, icon: '📁', avgCost: 11.99, isSubscription: true },
  { name: 'Google One', patterns: ['google one', 'google storage', 'google*cloud'], category: 'Storage' as SubscriptionCategory, icon: '☁️', avgCost: 2.99, isSubscription: true },
  { name: 'iCloud', patterns: ['icloud', 'apple icloud', 'icloud storage'], category: 'Storage' as SubscriptionCategory, icon: '☁️', avgCost: 2.99, isSubscription: true },
  { name: 'Slack', patterns: ['slack', 'slack.com'], category: 'Productivity' as SubscriptionCategory, icon: '💬', avgCost: 8.75, isSubscription: true },
  { name: 'Zoom', patterns: ['zoom', 'zoom.us', 'zoomvideo'], category: 'Productivity' as SubscriptionCategory, icon: '📹', avgCost: 14.99, isSubscription: true },
  { name: 'Figma', patterns: ['figma'], category: 'Design' as SubscriptionCategory, icon: '🎨', avgCost: 15.00, isSubscription: true },
  { name: 'GitHub', patterns: ['github', 'gh.io'], category: 'Development' as SubscriptionCategory, icon: '🐙', avgCost: 4.00, isSubscription: true },
  { name: 'Grammarly', patterns: ['grammarly'], category: 'Productivity' as SubscriptionCategory, icon: '✍️', avgCost: 12.00, isSubscription: true },
  
  // Fitness & Health
  { name: 'Peloton', patterns: ['peloton', 'onepeloton'], category: 'Fitness' as SubscriptionCategory, icon: '🚴', avgCost: 44.00, isSubscription: true },
  { name: 'Planet Fitness', patterns: ['planet fitness', 'planetfitness', 'pf black card', 'planet fit'], category: 'Fitness' as SubscriptionCategory, icon: '💪', avgCost: 24.99, isSubscription: true },
  { name: 'LA Fitness', patterns: ['la fitness', 'lafitness'], category: 'Fitness' as SubscriptionCategory, icon: '💪', avgCost: 34.99, isSubscription: true },
  { name: 'Anytime Fitness', patterns: ['anytime fitness', 'anytimefit'], category: 'Fitness' as SubscriptionCategory, icon: '💪', avgCost: 39.99, isSubscription: true },
  { name: 'Equinox', patterns: ['equinox'], category: 'Fitness' as SubscriptionCategory, icon: '💪', avgCost: 200.00, isSubscription: true },
  { name: 'Orange Theory', patterns: ['orange theory', 'orangetheory', 'otf'], category: 'Fitness' as SubscriptionCategory, icon: '🧡', avgCost: 169.00, isSubscription: true },
  { name: 'Headspace', patterns: ['headspace'], category: 'Health' as SubscriptionCategory, icon: '🧘', avgCost: 12.99, isSubscription: true },
  { name: 'Calm', patterns: ['calm', 'calm.com'], category: 'Health' as SubscriptionCategory, icon: '😌', avgCost: 69.99, isSubscription: true },
  { name: 'Strava', patterns: ['strava'], category: 'Fitness' as SubscriptionCategory, icon: '🏃', avgCost: 79.99, isSubscription: true },
  { name: 'Noom', patterns: ['noom'], category: 'Health' as SubscriptionCategory, icon: '🥗', avgCost: 59.00, isSubscription: true },
  
  // Gaming
  { name: 'Xbox Game Pass', patterns: ['xbox', 'game pass', 'microsoft xbox', 'xbox live', 'xboxlive'], category: 'Gaming' as SubscriptionCategory, icon: '🎮', avgCost: 14.99, isSubscription: true },
  { name: 'PlayStation Plus', patterns: ['playstation', 'ps plus', 'sony interactive', 'psn', 'playstation network'], category: 'Gaming' as SubscriptionCategory, icon: '🎮', avgCost: 17.99, isSubscription: true },
  { name: 'Nintendo Online', patterns: ['nintendo', 'nintendo switch'], category: 'Gaming' as SubscriptionCategory, icon: '🎮', avgCost: 3.99, isSubscription: true },
  
  // News & Reading
  { name: 'New York Times', patterns: ['ny times', 'nytimes', 'new york times', 'nyt digital', 'nyt subscription'], category: 'News' as SubscriptionCategory, icon: '📰', avgCost: 17.00, isSubscription: true },
  { name: 'Wall Street Journal', patterns: ['wsj', 'wall street journal', 'dowjones'], category: 'News' as SubscriptionCategory, icon: '📰', avgCost: 38.99, isSubscription: true },
  { name: 'Washington Post', patterns: ['washington post', 'wapo', 'washpost'], category: 'News' as SubscriptionCategory, icon: '📰', avgCost: 10.00, isSubscription: true },
  { name: 'The Athletic', patterns: ['the athletic', 'theathletic'], category: 'News' as SubscriptionCategory, icon: '🏅', avgCost: 7.99, isSubscription: true },
  { name: 'Medium', patterns: ['medium', 'medium.com'], category: 'Reading' as SubscriptionCategory, icon: '📖', avgCost: 5.00, isSubscription: true },
  { name: 'Audible', patterns: ['audible', 'audible.com'], category: 'Reading' as SubscriptionCategory, icon: '🎧', avgCost: 14.95, isSubscription: true },
  
  // Food Subscriptions (actual subscriptions, not one-off orders)
  { name: 'DoorDash DashPass', patterns: ['dashpass'], category: 'Food' as SubscriptionCategory, icon: '🍕', avgCost: 9.99, isSubscription: true },
  { name: 'Uber One', patterns: ['uber one', 'uber pass'], category: 'Food' as SubscriptionCategory, icon: '🚗', avgCost: 9.99, isSubscription: true },
  { name: 'Grubhub+', patterns: ['grubhub+'], category: 'Food' as SubscriptionCategory, icon: '🍱', avgCost: 9.99, isSubscription: true },
  { name: 'Instacart+', patterns: ['instacart+'], category: 'Food' as SubscriptionCategory, icon: '🛒', avgCost: 9.99, isSubscription: true },
  { name: 'HelloFresh', patterns: ['hellofresh', 'hello fresh'], category: 'Food' as SubscriptionCategory, icon: '🥗', avgCost: 59.94, isSubscription: true },
  { name: 'Blue Apron', patterns: ['blue apron', 'blueapron'], category: 'Food' as SubscriptionCategory, icon: '👨‍🍳', avgCost: 59.94, isSubscription: true },
  
  // Security & VPN
  { name: 'NordVPN', patterns: ['nordvpn', 'nord vpn'], category: 'Security' as SubscriptionCategory, icon: '🔒', avgCost: 12.99, isSubscription: true },
  { name: 'ExpressVPN', patterns: ['expressvpn', 'express vpn'], category: 'Security' as SubscriptionCategory, icon: '🔒', avgCost: 12.95, isSubscription: true },
  { name: '1Password', patterns: ['1password', 'agilebits'], category: 'Security' as SubscriptionCategory, icon: '🔐', avgCost: 4.99, isSubscription: true },
  { name: 'LastPass', patterns: ['lastpass', 'last pass'], category: 'Security' as SubscriptionCategory, icon: '🔐', avgCost: 4.00, isSubscription: true },
  { name: 'Norton', patterns: ['norton', 'nortonlifelock', 'norton360'], category: 'Security' as SubscriptionCategory, icon: '🛡️', avgCost: 9.99, isSubscription: true },
  
  // Dating
  { name: 'Tinder', patterns: ['tinder', 'tinder gold', 'tinder plus', 'match group tinder'], category: 'Dating' as SubscriptionCategory, icon: '🔥', avgCost: 14.99, isSubscription: true },
  { name: 'Bumble', patterns: ['bumble', 'bumble boost', 'bumble premium'], category: 'Dating' as SubscriptionCategory, icon: '🐝', avgCost: 16.99, isSubscription: true },
  { name: 'Hinge', patterns: ['hinge', 'hinge app'], category: 'Dating' as SubscriptionCategory, icon: '💕', avgCost: 14.99, isSubscription: true },
  
  // Education
  { name: 'Duolingo', patterns: ['duolingo'], category: 'Education' as SubscriptionCategory, icon: '🦉', avgCost: 83.99, isSubscription: true },
  { name: 'Coursera', patterns: ['coursera'], category: 'Education' as SubscriptionCategory, icon: '🎓', avgCost: 59.00, isSubscription: true },
  { name: 'Skillshare', patterns: ['skillshare'], category: 'Education' as SubscriptionCategory, icon: '✏️', avgCost: 13.99, isSubscription: true },
  { name: 'MasterClass', patterns: ['masterclass'], category: 'Education' as SubscriptionCategory, icon: '🎬', avgCost: 15.00, isSubscription: true },
  
  // AI & Tools
  { name: 'ChatGPT Plus', patterns: ['openai', 'chatgpt', 'chat gpt'], category: 'AI' as SubscriptionCategory, icon: '🤖', avgCost: 20.00, isSubscription: true },
  { name: 'Claude Pro', patterns: ['anthropic', 'claude'], category: 'AI' as SubscriptionCategory, icon: '🤖', avgCost: 20.00, isSubscription: true },
  { name: 'Midjourney', patterns: ['midjourney', 'mid journey'], category: 'AI' as SubscriptionCategory, icon: '🎨', avgCost: 10.00, isSubscription: true },
  { name: 'Perplexity', patterns: ['perplexity'], category: 'AI' as SubscriptionCategory, icon: '🔍', avgCost: 20.00, isSubscription: true },
  
  // Professional
  { name: 'LinkedIn Premium', patterns: ['linkedin', 'linkedin premium'], category: 'Professional' as SubscriptionCategory, icon: '💼', avgCost: 29.99, isSubscription: true },
  { name: 'Canva', patterns: ['canva'], category: 'Design' as SubscriptionCategory, icon: '🎨', avgCost: 119.99, isSubscription: true },
  { name: 'Squarespace', patterns: ['squarespace'], category: 'Web' as SubscriptionCategory, icon: '🌐', avgCost: 16.00, isSubscription: true },
  { name: 'Wix', patterns: ['wix'], category: 'Web' as SubscriptionCategory, icon: '🌐', avgCost: 16.00, isSubscription: true },
  { name: 'Shopify', patterns: ['shopify'], category: 'Business' as SubscriptionCategory, icon: '🛍️', avgCost: 29.00, isSubscription: true },
  { name: 'YNAB', patterns: ['ynab', 'you need a budget'], category: 'Finance' as SubscriptionCategory, icon: '💰', avgCost: 99.00, isSubscription: true },
  
  // Home & Other
  { name: 'Ring', patterns: ['ring.com', 'ring protect'], category: 'Home' as SubscriptionCategory, icon: '🔔', avgCost: 100.00, isSubscription: true },
  { name: 'Nest', patterns: ['nest', 'google nest'], category: 'Home' as SubscriptionCategory, icon: '🏠', avgCost: 6.00, isSubscription: true },
  { name: 'SimpliSafe', patterns: ['simplisafe'], category: 'Home' as SubscriptionCategory, icon: '🏠', avgCost: 17.99, isSubscription: true },
  { name: 'SiriusXM', patterns: ['siriusxm', 'sirius xm', 'sirius'], category: 'Music' as SubscriptionCategory, icon: '📻', avgCost: 10.99, isSubscription: true },
];

// Known recurring BILLS (utilities, rent, insurance) - NOT subscriptions you can cancel
const BILL_PATTERNS = [
  { name: 'Rent', patterns: ['rent', 'apartment', 'apt rent', 'lease', 'landlord', 'property management'], category: 'Bill' as SubscriptionCategory, icon: '🏠' },
  { name: 'Mortgage', patterns: ['mortgage', 'home loan', 'housing payment'], category: 'Bill' as SubscriptionCategory, icon: '🏠' },
  { name: 'Electric', patterns: ['electric', 'power', 'energy', 'pse&g', 'pseg', 'con edison', 'conedison', 'pge', 'pg&e', 'duke energy', 'fpl', 'florida power'], category: 'Bill' as SubscriptionCategory, icon: '⚡' },
  { name: 'Gas', patterns: ['gas utility', 'natural gas', 'atmos energy'], category: 'Bill' as SubscriptionCategory, icon: '🔥' },
  { name: 'Water', patterns: ['water utility', 'water bill', 'sewer', 'water dept'], category: 'Bill' as SubscriptionCategory, icon: '💧' },
  { name: 'Internet', patterns: ['comcast', 'xfinity', 'spectrum', 'at&t internet', 'verizon fios', 'cox', 'frontier', 'centurylink'], category: 'Bill' as SubscriptionCategory, icon: '🌐' },
  { name: 'Phone', patterns: ['verizon', 'vzw', 'verizon wireless', 't-mobile', 'tmobile', 'at&t wireless', 'sprint'], category: 'Bill' as SubscriptionCategory, icon: '📱' },
  { name: 'Car Insurance', patterns: ['geico', 'state farm', 'allstate', 'progressive', 'liberty mutual', 'farmers insurance', 'usaa', 'nationwide'], category: 'Bill' as SubscriptionCategory, icon: '🚗' },
  { name: 'Health Insurance', patterns: ['blue cross', 'bcbs', 'aetna', 'cigna', 'unitedhealth', 'humana', 'kaiser'], category: 'Bill' as SubscriptionCategory, icon: '🏥' },
  { name: 'Car Payment', patterns: ['car payment', 'auto loan', 'vehicle payment', 'toyota financial', 'honda financial', 'ford credit', 'gm financial'], category: 'Bill' as SubscriptionCategory, icon: '🚗' },
  { name: 'Student Loan', patterns: ['student loan', 'navient', 'sallie mae', 'nelnet', 'great lakes', 'fedloan'], category: 'Bill' as SubscriptionCategory, icon: '🎓' },
];

// Variable spending patterns to EXCLUDE (not recurring subscriptions)
const VARIABLE_SPENDING_PATTERNS = [
  // Food/Restaurants (one-off purchases, not subscriptions)
  'doordash', 'uber eats', 'ubereats', 'grubhub', 'postmates', 'seamless',
  'chipotle', 'starbucks', 'mcdonalds', 'wendys', 'burger king', 'taco bell',
  'panera', 'subway', 'chick-fil-a', 'chickfila', 'dunkin', 'pizza hut', 'dominos',
  // Gas stations
  'exxon', 'mobil', 'exxonmobil', 'shell', 'chevron', 'bp', 'circle k', 'speedway',
  'wawa', 'sheetz', 'marathon', 'sunoco', 'valero', 'phillips 66',
  // General shopping
  'amazon', 'amazon.com', 'amzn', 'walmart', 'target', 'costco', 'sams club',
  'whole foods', 'trader joes', 'kroger', 'safeway', 'publix', 'wegmans',
  'walgreens', 'cvs', 'rite aid', 'home depot', 'lowes', 'best buy',
  // Transportation
  'uber', 'lyft', 'parking', 'toll',
  // ATM/Cash
  'atm', 'cash withdrawal', 'check',
];

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  merchant?: string; // Primary key for grouping
  rawData: Record<string, string>;
}

export interface PriceChange {
  previousAmount: number;
  currentAmount: number;
  changePercent: number;
  changeDate: string;
}

// Cancellation difficulty levels
export type CancellationDifficulty = 'easy' | 'medium' | 'hard';

// Duplicate group info
export interface DuplicateGroup {
  groupId: string;
  groupName: string; // e.g., "Music Streaming", "Food Delivery"
  services: string[];
}

// Price history entry
export interface PriceHistoryEntry {
  date: string;
  amount: number;
}

export interface DetectedSubscription {
  id: string;
  name: string;
  category: string;
  icon: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'unknown';
  lastCharge: string;
  chargeCount: number;
  status: 'active' | 'potential-leak' | 'new' | 'bill';
  transactions: Transaction[];
  matchedPattern?: string;
  monthlyEquivalent?: number;
  priceChange?: PriceChange;
  // New intelligence fields
  cancellationDifficulty?: CancellationDifficulty;
  cancellationNotes?: string;
  duplicateGroup?: DuplicateGroup;
  isZombie?: boolean; // Low/no engagement detected
  zombieDays?: number; // Days since last engagement indicator
  isTrial?: boolean;
  trialEndsAt?: string;
  trialConvertsTo?: number; // Annual cost if trial converts
  isMicroLeak?: boolean; // Small charge < $5
  priceHistory?: PriceHistoryEntry[];
}

// Normalize description for better matching
function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract merchant key from transaction (prioritize merchant column, normalize description)
function extractMerchantKey(transaction: Transaction): string {
  // First, try the merchant field if available
  if (transaction.merchant) {
    return normalizeDescription(transaction.merchant);
  }
  
  // Check rawData for merchant/payee columns
  const rawData = transaction.rawData;
  for (const key of Object.keys(rawData)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('merchant') || lowerKey === 'payee' || lowerKey === 'name') {
      if (rawData[key] && rawData[key].trim()) {
        return normalizeDescription(rawData[key]);
      }
    }
  }
  
  // Fall back to normalized description - extract core words
  const normalized = normalizeDescription(transaction.description);
  const words = normalized.split(' ').filter(w => w.length > 2);
  
  // Take first 2-3 meaningful words as the key
  return words.slice(0, 3).join(' ');
}

// Fuzzy match using Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }
  
  return dp[m][n];
}

// Check if a pattern matches (includes fuzzy matching)
function matchesPattern(description: string, pattern: string): boolean {
  const normalizedDesc = normalizeDescription(description);
  const normalizedPattern = normalizeDescription(pattern);
  
  // Exact substring match
  if (normalizedDesc.includes(normalizedPattern)) {
    return true;
  }
  
  // Word-based match
  const words = normalizedDesc.split(' ');
  for (const word of words) {
    if (word === normalizedPattern) {
      return true;
    }
    // Fuzzy match for longer words (allow 1-2 typos)
    if (normalizedPattern.length >= 5 && word.length >= 5) {
      const distance = levenshteinDistance(word, normalizedPattern);
      const threshold = normalizedPattern.length <= 6 ? 1 : 2;
      if (distance <= threshold) {
        return true;
      }
    }
  }
  
  return false;
}

// Check if transaction is variable spending (food orders, gas, etc.)
function isVariableSpending(description: string): boolean {
  const normalized = normalizeDescription(description);
  
  // Check if it matches a subscription pattern first (DashPass, HelloFresh, etc. are OK)
  for (const pattern of SUBSCRIPTION_PATTERNS) {
    if (pattern.patterns.some(p => matchesPattern(description, p))) {
      return false; // It's a known subscription, not variable spending
    }
  }
  
  // Now check variable spending patterns
  for (const pattern of VARIABLE_SPENDING_PATTERNS) {
    if (normalized.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

// Parse date string to Date object
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try various date formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
    /(\d{2})-(\d{2})-(\d{4})/, // MM-DD-YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // M/D/YY or M/D/YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year, month, day;
      if (format === formats[0]) {
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        month = parseInt(match[1]) - 1;
        day = parseInt(match[2]);
        year = parseInt(match[3]);
        if (year < 100) year += 2000;
      }
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Try native parsing as fallback
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Calculate interval consistency for a set of transactions
function analyzeRecurrence(transactions: Transaction[]): {
  isRecurring: boolean;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'unknown';
  intervalConsistent: boolean;
  amountStable: boolean;
  avgInterval: number;
} {
  if (transactions.length < 2) {
    return { isRecurring: false, frequency: 'unknown', intervalConsistent: false, amountStable: false, avgInterval: 0 };
  }
  
  // Sort by date
  const sorted = [...transactions]
    .map(t => ({ ...t, parsedDate: parseDate(t.date) }))
    .filter(t => t.parsedDate !== null)
    .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());
  
  if (sorted.length < 2) {
    return { isRecurring: false, frequency: 'unknown', intervalConsistent: false, amountStable: false, avgInterval: 0 };
  }
  
  // Calculate intervals in days
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].parsedDate!.getTime() - sorted[i - 1].parsedDate!.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    intervals.push(diffDays);
  }
  
  // Calculate amount stability (within ±10%)
  const amounts = transactions.map(t => t.amount);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const amountStable = amounts.every(a => Math.abs(a - avgAmount) / avgAmount <= 0.10);
  
  // Calculate average interval
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  
  // Determine frequency based on interval
  let frequency: 'monthly' | 'yearly' | 'weekly' | 'unknown' = 'unknown';
  let intervalConsistent = false;
  
  // Weekly: 5-9 days (allow some variance)
  if (avgInterval >= 5 && avgInterval <= 9) {
    intervalConsistent = intervals.every(i => i >= 4 && i <= 10);
    if (intervalConsistent) frequency = 'weekly';
  }
  // Monthly: 25-35 days
  else if (avgInterval >= 25 && avgInterval <= 35) {
    intervalConsistent = intervals.every(i => i >= 20 && i <= 40);
    if (intervalConsistent) frequency = 'monthly';
  }
  // Yearly: 340-400 days
  else if (avgInterval >= 340 && avgInterval <= 400) {
    intervalConsistent = intervals.every(i => i >= 330 && i <= 410);
    if (intervalConsistent) frequency = 'yearly';
  }
  
  // For single-charge in a year, check if it looks annual based on context
  if (transactions.length === 1) {
    frequency = 'unknown'; // Can't determine from single charge
  }
  
  const isRecurring = intervalConsistent && amountStable && transactions.length >= 2;
  
  return { isRecurring, frequency, intervalConsistent, amountStable, avgInterval };
}

// Detect price changes in a subscription's transaction history
function detectPriceChange(transactions: Transaction[]): PriceChange | undefined {
  if (transactions.length < 2) return undefined;
  
  // Sort by date (oldest first)
  const sorted = [...transactions]
    .map(t => ({ ...t, parsedDate: parseDate(t.date) }))
    .filter(t => t.parsedDate !== null)
    .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());
  
  if (sorted.length < 2) return undefined;
  
  // Group by amount to find distinct price points
  const amountGroups = new Map<number, { amount: number; lastDate: Date; count: number }>();
  
  for (const tx of sorted) {
    // Round to 2 decimal places for comparison
    const roundedAmount = Math.round(tx.amount * 100) / 100;
    const existing = amountGroups.get(roundedAmount);
    if (existing) {
      existing.lastDate = tx.parsedDate!;
      existing.count++;
    } else {
      amountGroups.set(roundedAmount, { amount: roundedAmount, lastDate: tx.parsedDate!, count: 1 });
    }
  }
  
  // If only one distinct amount, no price change
  if (amountGroups.size < 2) return undefined;
  
  // Find the most recent two distinct price points
  const pricePoints = Array.from(amountGroups.values())
    .sort((a, b) => b.lastDate.getTime() - a.lastDate.getTime());
  
  const currentPrice = pricePoints[0];
  const previousPrice = pricePoints[1];
  
  // Only report if price INCREASED (not decreased - that's a deal)
  if (currentPrice.amount <= previousPrice.amount) return undefined;
  
  const changePercent = ((currentPrice.amount - previousPrice.amount) / previousPrice.amount) * 100;
  
  // Only flag if increase is at least 3% (filter out minor fluctuations)
  if (changePercent < 3) return undefined;
  
  return {
    previousAmount: previousPrice.amount,
    currentAmount: currentPrice.amount,
    changePercent: Math.round(changePercent * 10) / 10,
    changeDate: currentPrice.lastDate.toISOString().split('T')[0],
  };
}

// Smart column detection for CSV parsing
function detectColumns(headers: string[]): { dateCol: number; descCol: number; amountCol: number; debitCol: number; creditCol: number; merchantCol: number } {
  const normalized = headers.map(h => h.toLowerCase().trim());
  
  let dateCol = -1;
  let descCol = -1;
  let amountCol = -1;
  let debitCol = -1;
  let creditCol = -1;
  let merchantCol = -1;
  
  normalized.forEach((h, i) => {
    if (dateCol === -1 && (h.includes('date') || h.includes('posted') || h === 'trans. date')) {
      dateCol = i;
    }
    // Prioritize merchant column
    if (merchantCol === -1 && (h === 'merchant' || h === 'payee' || h === 'name')) {
      merchantCol = i;
    }
    if (descCol === -1 && (h.includes('description') || h.includes('memo') || h.includes('narrative') || h.includes('details'))) {
      descCol = i;
    }
    if (amountCol === -1 && (h === 'amount' || h.includes('amount') && !h.includes('debit') && !h.includes('credit'))) {
      amountCol = i;
    }
    if (debitCol === -1 && (h.includes('debit') || h.includes('withdrawal') || h.includes('money out'))) {
      debitCol = i;
    }
    if (creditCol === -1 && (h.includes('credit') || h.includes('deposit') || h.includes('money in'))) {
      creditCol = i;
    }
  });
  
  // Fallback
  if (dateCol === -1) dateCol = 0;
  if (descCol === -1 && merchantCol === -1) {
    descCol = normalized.length > 2 ? 1 : 0;
  }
  
  return { dateCol, descCol, amountCol, debitCol, creditCol, merchantCol };
}

export function parseCSV(csvText: string): Transaction[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
  
  if (!result.data || result.data.length === 0) {
    return [];
  }
  
  const headers = Object.keys(result.data[0] as Record<string, string>);
  const { dateCol, descCol, amountCol, debitCol, creditCol, merchantCol } = detectColumns(headers);
  
  const transactions: Transaction[] = [];
  
  for (const row of result.data as Record<string, string>[]) {
    if (!row || typeof row !== 'object') continue;
    
    const values = Object.values(row);
    const keys = Object.keys(row);
    
    // Get merchant (primary key for grouping)
    let merchant = '';
    if (merchantCol >= 0 && values[merchantCol]) {
      merchant = String(values[merchantCol]).trim();
    }
    
    // Get description
    let description = '';
    if (descCol >= 0 && values[descCol]) {
      description = String(values[descCol]).trim();
    } else if (merchantCol >= 0 && values[merchantCol]) {
      description = String(values[merchantCol]).trim();
    } else {
      // Find the longest string value
      for (const val of values) {
        if (typeof val === 'string' && val.length > description.length && !/^[\d.,\-$\s()]+$/.test(val)) {
          description = val;
        }
      }
    }
    
    let amount = 0;
    let type: 'debit' | 'credit' = 'debit';
    
    // Try debit column first
    if (debitCol >= 0 && values[debitCol]) {
      const cleaned = String(values[debitCol]).replace(/[$,\s()]/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num !== 0) {
        amount = Math.abs(num);
        type = 'debit';
      }
    }
    
    // Try credit column
    if (amount === 0 && creditCol >= 0 && values[creditCol]) {
      const cleaned = String(values[creditCol]).replace(/[$,\s()]/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num !== 0) {
        amount = Math.abs(num);
        type = 'credit';
      }
    }
    
    // Try amount column
    if (amount === 0 && amountCol >= 0 && values[amountCol]) {
      const cleaned = String(values[amountCol]).replace(/[$,\s()]/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        amount = Math.abs(num);
        const val = String(values[amountCol]);
        type = num < 0 || val.includes('-') || val.includes('(') ? 'debit' : 'credit';
      }
    }
    
    // Fallback: find any numeric value
    if (amount === 0) {
      for (let j = 0; j < values.length; j++) {
        const val = String(values[j]);
        const cleaned = val.replace(/[$,\s()]/g, '');
        const num = parseFloat(cleaned);
        if (!isNaN(num) && num !== 0 && keys[j].toLowerCase() !== 'date') {
          amount = Math.abs(num);
          type = num < 0 || val.includes('-') || val.includes('(') ? 'debit' : 'credit';
          break;
        }
      }
    }
    
    const dateValue = dateCol >= 0 ? values[dateCol] : values[0];
    
    if (description && amount > 0) {
      transactions.push({
        date: String(dateValue || ''),
        description,
        amount,
        type,
        merchant: merchant || undefined,
        rawData: row,
      });
    }
  }
  
  console.log(`Parsed ${transactions.length} transactions from CSV`);
  
  return transactions;
}

export function detectSubscriptions(transactions: Transaction[]): DetectedSubscription[] {
  const subscriptionMap = new Map<string, DetectedSubscription>();
  const merchantGroups = new Map<string, Transaction[]>();

  console.log(`Detecting subscriptions from ${transactions.length} transactions`);

  // Step 1: Group all transactions by merchant key
  for (const transaction of transactions) {
    if (transaction.type !== 'debit') continue;
    
    const merchantKey = extractMerchantKey(transaction);
    const existing = merchantGroups.get(merchantKey);
    if (existing) {
      existing.push(transaction);
    } else {
      merchantGroups.set(merchantKey, [transaction]);
    }
  }
  
  console.log(`Grouped into ${merchantGroups.size} merchant groups`);

  // Step 2: Process each merchant group
  for (const [merchantKey, txns] of merchantGroups) {
    // Get description from first transaction for pattern matching
    const sampleDesc = txns[0].description;
    
    // Check if it's a known BILL (not a cancellable subscription)
    let isBill = false;
    let billMatch: typeof BILL_PATTERNS[0] | null = null;
    for (const pattern of BILL_PATTERNS) {
      if (pattern.patterns.some(p => matchesPattern(sampleDesc, p) || matchesPattern(merchantKey, p))) {
        isBill = true;
        billMatch = pattern;
        break;
      }
    }
    
    if (isBill && billMatch) {
      // Group bills together but mark them differently
      const lastTx = txns.reduce((a, b) => (parseDate(a.date)?.getTime() || 0) > (parseDate(b.date)?.getTime() || 0) ? a : b);
      const recurrence = analyzeRecurrence(txns);
      
      subscriptionMap.set(merchantKey, {
        id: `bill-${merchantKey.replace(/\s/g, '-')}`,
        name: billMatch.name,
        category: 'Bill',
        icon: billMatch.icon,
        amount: lastTx.amount,
        frequency: recurrence.frequency !== 'unknown' ? recurrence.frequency : 'monthly',
        lastCharge: lastTx.date,
        chargeCount: txns.length,
        status: 'bill',
        transactions: txns,
      });
      continue;
    }
    
    // Check if it's variable spending (skip unless it shows true subscription patterns)
    if (isVariableSpending(sampleDesc)) {
      // Variable spending - skip unless there's strong subscription evidence
      const recurrence = analyzeRecurrence(txns);
      if (!recurrence.isRecurring || !recurrence.amountStable) {
        console.log(`Skipping variable spending: ${merchantKey}`);
        continue;
      }
    }
    
    // Check if it matches a known subscription pattern
    let subscriptionMatch: typeof SUBSCRIPTION_PATTERNS[0] | null = null;
    for (const pattern of SUBSCRIPTION_PATTERNS) {
      if (pattern.patterns.some(p => matchesPattern(sampleDesc, p) || matchesPattern(merchantKey, p))) {
        subscriptionMatch = pattern;
        break;
      }
    }
    
    // Analyze recurrence
    const recurrence = analyzeRecurrence(txns);
    const lastTx = txns.reduce((a, b) => (parseDate(a.date)?.getTime() || 0) > (parseDate(b.date)?.getTime() || 0) ? a : b);
    
    // Detect price changes
    const priceChange = detectPriceChange(txns);
    
    if (subscriptionMatch) {
      // Known subscription - always include
      let frequency = recurrence.frequency;
      
      // If only 1-2 charges in data and amount is > $50, likely annual
      if (txns.length <= 2 && lastTx.amount >= 50) {
        frequency = 'yearly';
      }
      
      const monthlyEquivalent = frequency === 'yearly' ? lastTx.amount / 12 : lastTx.amount;
      
      subscriptionMap.set(merchantKey, {
        id: `sub-${subscriptionMatch.name.toLowerCase().replace(/\s/g, '-')}`,
        name: subscriptionMatch.name,
        category: subscriptionMatch.category,
        icon: subscriptionMatch.icon,
        amount: lastTx.amount,
        frequency,
        lastCharge: lastTx.date,
        chargeCount: txns.length,
        status: 'active',
        transactions: txns,
        matchedPattern: subscriptionMatch.patterns[0],
        monthlyEquivalent,
        priceChange,
      });
    } else if (recurrence.isRecurring && txns.length >= 3) {
      // Unknown but shows recurring pattern - only include if truly recurring
      const name = merchantKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const monthlyEquivalent = recurrence.frequency === 'yearly' ? lastTx.amount / 12 : lastTx.amount;
      
      subscriptionMap.set(merchantKey, {
        id: `sub-unknown-${merchantKey.replace(/\s/g, '-')}`,
        name: name,
        category: 'Other',
        icon: '📋',
        amount: lastTx.amount,
        frequency: recurrence.frequency,
        lastCharge: lastTx.date,
        chargeCount: txns.length,
        status: 'potential-leak',
        transactions: txns,
        monthlyEquivalent,
        priceChange,
      });
    }
  }

  const subscriptions = Array.from(subscriptionMap.values());
  
  console.log(`Detected ${subscriptions.length} subscriptions/bills`);

  // Sort: bills at bottom, then by amount
  return subscriptions.sort((a, b) => {
    if (a.status === 'bill' && b.status !== 'bill') return 1;
    if (b.status === 'bill' && a.status !== 'bill') return -1;
    return b.amount - a.amount;
  });
}

export function calculateTotalMonthlySpend(subscriptions: DetectedSubscription[]): number {
  return subscriptions
    .filter(sub => sub.status !== 'bill') // Exclude bills from subscription total
    .reduce((total, sub) => {
      if (sub.frequency === 'yearly') {
        return total + (sub.amount / 12);
      }
      if (sub.frequency === 'weekly') {
        return total + (sub.amount * 4.33);
      }
      return total + sub.amount;
    }, 0);
}

export function calculatePotentialSavings(subscriptions: DetectedSubscription[]): number {
  return subscriptions
    .filter(sub => sub.status === 'potential-leak')
    .reduce((total, sub) => {
      if (sub.frequency === 'yearly') {
        return total + (sub.amount / 12);
      }
      return total + sub.amount;
    }, 0);
}
