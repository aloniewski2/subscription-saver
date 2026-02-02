import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Ghost, 
  Clock, 
  Coins, 
  Copy,
  ShieldCheck,
  ShieldAlert,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DetectedSubscription } from '@/lib/subscriptionDetector';

interface SubscriptionCardProps {
  subscription: DetectedSubscription;
  index: number;
}

function getFrequencyLabel(frequency: string): string {
  switch (frequency) {
    case 'yearly': return '/yr';
    case 'weekly': return '/wk';
    case 'monthly': return '/mo';
    default: return '';
  }
}

function CancellationBadge({ difficulty, notes }: { difficulty?: string; notes?: string }) {
  if (!difficulty) return null;
  
  const config = {
    easy: { 
      color: 'bg-green-500/10 text-green-600 border-green-500/20', 
      icon: ShieldCheck, 
      label: 'Easy cancel' 
    },
    medium: { 
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', 
      icon: Shield, 
      label: 'Medium' 
    },
    hard: { 
      color: 'bg-red-500/10 text-red-600 border-red-500/20', 
      icon: ShieldAlert, 
      label: 'Hard to cancel' 
    },
  };
  
  const { color, icon: DiffIcon, label } = config[difficulty as keyof typeof config] || config.medium;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs", color)}>
            <DiffIcon className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{label}</p>
          {notes && <p className="text-xs text-muted-foreground mt-1">{notes}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TrialBadge({ subscription }: { subscription: DetectedSubscription }) {
  if (!subscription.isTrial || !subscription.trialEndsAt) return null;
  
  const endsAt = new Date(subscription.trialEndsAt);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isUrgent = daysLeft <= 3;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className={cn(
            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
            isUrgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          )}>
            <Clock className="h-3 w-3" />
            {daysLeft === 0 ? 'Today!' : `${daysLeft}d`}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">Free trial ending</p>
          <p className="text-xs text-muted-foreground">
            Converts to ${((subscription.trialConvertsTo || 0) / 12).toFixed(2)}/mo 
            (${subscription.trialConvertsTo?.toFixed(0)}/yr)
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SubscriptionCard({ subscription, index }: SubscriptionCardProps) {
  const isLeak = subscription.status === 'potential-leak';
  const isBill = subscription.status === 'bill';
  const isYearly = subscription.frequency === 'yearly';
  const hasPriceIncrease = subscription.priceChange && subscription.priceChange.changePercent > 0;
  const isZombie = subscription.isZombie;
  const isTrial = subscription.isTrial;
  const isMicroLeak = subscription.isMicroLeak;
  const hasDuplicate = subscription.duplicateGroup && subscription.duplicateGroup.services.length > 1;

  // Determine card styling priority
  const cardStyle = cn(
    "flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30",
    isTrial && "border-primary/40 bg-primary/5",
    isZombie && "border-destructive/30 bg-destructive/5",
    isLeak && !isZombie && "border-accent/30 bg-accent/5",
    isBill && "border-muted bg-muted/20 opacity-80",
    hasPriceIncrease && !isLeak && !isZombie && "border-yellow-500/30 bg-yellow-500/5"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cardStyle}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-lg flex-shrink-0">{subscription.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium truncate">{subscription.name}</span>
            
            {/* Trial countdown */}
            <TrialBadge subscription={subscription} />
            
            {/* Zombie indicator */}
            {isZombie && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                      <Ghost className="h-3 w-3" />
                      {subscription.zombieDays}d
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-medium">Zombie subscription</p>
                    <p className="text-xs text-muted-foreground">
                      No activity detected for {subscription.zombieDays} days
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Price increase */}
            {hasPriceIncrease && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center gap-1 rounded bg-yellow-500/10 px-1.5 py-0.5 text-xs text-yellow-600">
                      <TrendingUp className="h-3 w-3" />
                      +{subscription.priceChange!.changePercent}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-medium">Price increased</p>
                    <p className="text-xs text-muted-foreground">
                      Was ${subscription.priceChange!.previousAmount.toFixed(2)} → 
                      Now ${subscription.priceChange!.currentAmount.toFixed(2)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Duplicate indicator */}
            {hasDuplicate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center gap-1 rounded bg-orange-500/10 px-1.5 py-0.5 text-xs text-orange-600">
                      <Copy className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-medium">Duplicate detected</p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.duplicateGroup!.groupName}: {subscription.duplicateGroup!.services.join(', ')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Micro-leak */}
            {isMicroLeak && !isZombie && !isTrial && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      <Coins className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-medium">Micro-leak</p>
                    <p className="text-xs text-muted-foreground">
                      Small recurring charge — adds up to ${((subscription.monthlyEquivalent || subscription.amount) * 12).toFixed(2)}/yr
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Review flag */}
            {isLeak && !isZombie && !hasDuplicate && (
              <span className="flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent">
                <AlertTriangle className="h-3 w-3" />
                review
              </span>
            )}
            
            {/* Bill indicator */}
            {isBill && (
              <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                bill
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground">
              {subscription.category} · {subscription.chargeCount} charge{subscription.chargeCount > 1 ? 's' : ''}
            </p>
            <CancellationBadge 
              difficulty={subscription.cancellationDifficulty} 
              notes={subscription.cancellationNotes} 
            />
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0 ml-2">
        <p className={cn(
          "text-sm font-medium tabular-nums",
          isTrial && "text-primary",
          isZombie && "text-destructive",
          isLeak && !isZombie && "text-accent",
          hasPriceIncrease && !isLeak && !isZombie && "text-yellow-600"
        )}>
          {isTrial ? 'FREE' : `$${subscription.amount.toFixed(2)}`}
          <span className="text-xs font-normal text-muted-foreground ml-0.5">
            {getFrequencyLabel(subscription.frequency)}
          </span>
        </p>
        {isYearly && subscription.monthlyEquivalent && (
          <p className="text-xs text-muted-foreground">
            ~${subscription.monthlyEquivalent.toFixed(2)}/mo
          </p>
        )}
        {isTrial && subscription.trialConvertsTo && (
          <p className="text-xs text-muted-foreground">
            then ${((subscription.trialConvertsTo) / 12).toFixed(2)}/mo
          </p>
        )}
      </div>
    </motion.div>
  );
}
