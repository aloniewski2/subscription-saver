import { motion } from 'framer-motion';
import { Upload, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onGetStarted: () => void;
  onTryDemo: () => void;
}

export function Hero({ onGetStarted, onTryDemo }: HeroProps) {
  return (
    <section className="px-4 py-24 sm:py-32">
      <div className="container mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Find forgotten subscriptions
          </h1>
          
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Drop your bank statement and see what's quietly draining your account every month.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={onGetStarted}
              className="h-10 gap-2 px-5"
            >
              <Upload className="h-4 w-4" />
              Upload CSV
            </Button>
            <Button
              onClick={onTryDemo}
              variant="ghost"
              className="h-10 gap-2 text-muted-foreground"
            >
              <Play className="h-4 w-4" />
              Try demo
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free · No signup · Works offline
          </p>
        </motion.div>
      </div>
    </section>
  );
}
