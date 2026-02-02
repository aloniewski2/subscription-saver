import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getSupportedExtensions, getSupportedExtensionsDisplay } from '@/lib/fileParser';

interface FileUploaderProps {
  onFileSelect: (content: string, fileName: string) => void;
  isLoading?: boolean;
}

export function CSVUploader({ onFileSelect, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportedExtensions = getSupportedExtensions();

  const handleFile = useCallback((selectedFile: File) => {
    setError(null);
    
    const ext = '.' + selectedFile.name.toLowerCase().split('.').pop();
    if (!supportedExtensions.includes(ext)) {
      setError(`Unsupported format. Use ${getSupportedExtensionsDisplay()}`);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content, selectedFile.name);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(selectedFile);
  }, [onFileSelect, supportedExtensions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return (
    <section id="upload-section" className="px-4 pb-24">
      <div className="container mx-auto max-w-lg">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.label
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              htmlFor="file-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                isDragging
                  ? "border-foreground bg-muted/50"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <Upload className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-foreground" : "text-muted-foreground"
              )} />
              
              <p className="mt-4 text-sm">
                {isDragging ? 'Drop here' : 'Drop file or click to browse'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {getSupportedExtensionsDisplay()} · Max 10MB
              </p>

              <input
                id="file-upload"
                type="file"
                accept={supportedExtensions.join(',')}
                onChange={handleInputChange}
                className="hidden"
              />
            </motion.label>
          ) : (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  className="h-8 w-8 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isLoading && (
                <div className="mt-3">
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="h-full w-1/3 bg-foreground"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-xs text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
