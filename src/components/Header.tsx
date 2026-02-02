import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <a href="/" className="text-sm font-medium tracking-tight">
          leakguard
        </a>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            local processing
          </span>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
