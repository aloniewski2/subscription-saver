import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Ghost, 
  Clock, 
  Coins, 
  Copy,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  Trophy
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { calculateEfficiencyScore, getInsightsSummary, EfficiencyBreakdown } from '@/lib/efficiencyScore';
import type { DetectedSubscription } from '@/lib/subscriptionDetector';

interface InsightsTabProps {
  subscriptions: DetectedSubscription[];
}

function EfficiencyScoreCard({ breakdown }: { breakdown: EfficiencyBreakdown }) {
  const [expanded, setExpanded] = useState(false);
  
  const gradeColors = {
    'A': 'text-green-500 bg-green-500/10 border-green-500/30',
    'B': 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    'C': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    'D': 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    'F': 'text-red-500 bg-red-500/10 border-red-500/30',
  };

  const progressColor = breakdown.score >= 75 ? 'bg-green-500' : breakdown.score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Subscription Efficiency Score</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{breakdown.summary}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breakdown.score}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn("h-full rounded-full", progressColor)}
                />
              </div>
            </div>
            <span className="text-2xl font-bold tabular-nums">{breakdown.score}</span>
          </div>
        </div>
        
        <div className={cn("flex items-center justify-center w-16 h-16 rounded-xl border-2 text-2xl font-bold", gradeColors[breakdown.grade])}>
          {breakdown.grade}
        </div>
      </div>

      {breakdown.factors.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-4 gap-2"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? 'Hide breakdown' : 'Show breakdown'}
          </Button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-2">
                  {breakdown.factors.map((factor, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg",
                        factor.severity === 'bad' && "bg-destructive/5",
                        factor.severity === 'warning' && "bg-yellow-500/5",
                        factor.severity === 'good' && "bg-green-500/5"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium tabular-nums min-w-[40px]",
                        factor.impact < 0 ? "text-destructive" : "text-green-500"
                      )}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{factor.name}</p>
                        <p className="text-xs text-muted-foreground">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

function InsightCard({ 
  icon: Icon, 
  title, 
  count, 
  amount,
  variant = 'default',
  children,
  defaultExpanded = false
}: { 
  icon: React.ElementType;
  title: string;
  count: number;
  amount?: string;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  if (count === 0) return null;

  const variantStyles = {
    default: 'border-border',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    danger: 'border-destructive/30 bg-destructive/5',
    success: 'border-green-500/30 bg-green-500/5',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    warning: 'text-yellow-500',
    danger: 'text-destructive',
    success: 'text-green-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-xl border p-4", variantStyles[variant])}
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => children && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-muted/50", iconStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">
              {count} item{count !== 1 ? 's' : ''}
              {amount && <span className="ml-1">· {amount}</span>}
            </p>
          </div>
        </div>
        {children && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      <AnimatePresence>
        {expanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TrialCountdown({ subscription }: { subscription: DetectedSubscription }) {
  if (!subscription.isTrial || !subscription.trialEndsAt) return null;
  
  const endsAt = new Date(subscription.trialEndsAt);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <span className="text-lg">{subscription.icon}</span>
        <div>
          <p className="text-sm font-medium">{subscription.name}</p>
          <p className="text-xs text-muted-foreground">
            Converts to ${(subscription.trialConvertsTo! / 12).toFixed(2)}/mo
          </p>
        </div>
      </div>
      <Badge variant={daysLeft <= 3 ? 'destructive' : 'secondary'}>
        {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
      </Badge>
    </div>
  );
}

function DuplicateGroup({ groupName, services }: { groupName: string; services: DetectedSubscription[] }) {
  const totalMonthly = services.reduce((sum, s) => sum + (s.monthlyEquivalent || s.amount), 0);
  const wastedMonthly = services.slice(1).reduce((sum, s) => sum + (s.monthlyEquivalent || s.amount), 0);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{groupName}</span>
        <span className="text-muted-foreground">
          ${totalMonthly.toFixed(2)}/mo total
        </span>
      </div>
      <div className="space-y-1">
        {services.map((sub, i) => (
          <div 
            key={sub.id}
            className={cn(
              "flex items-center justify-between p-2 rounded-lg text-sm",
              i > 0 ? "bg-destructive/5" : "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span>{sub.icon}</span>
              <span>{sub.name}</span>
              {i > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">duplicate</Badge>}
            </div>
            <span className="tabular-nums">${(sub.monthlyEquivalent || sub.amount).toFixed(2)}/mo</span>
          </div>
        ))}
      </div>
      {wastedMonthly > 0 && (
        <p className="text-xs text-destructive">
          Potential savings: ${wastedMonthly.toFixed(2)}/mo (${(wastedMonthly * 12).toFixed(0)}/year)
        </p>
      )}
    </div>
  );
}

function CancellationDifficultyBadge({ difficulty, notes }: { difficulty?: string; notes?: string }) {
  if (!difficulty) return null;
  
  const config = {
    easy: { color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: ShieldCheck, label: 'Easy' },
    medium: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: ShieldAlert, label: 'Medium' },
    hard: { color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: AlertTriangle, label: 'Hard' },
  };
  
  const { color, icon: DiffIcon, label } = config[difficulty as keyof typeof config] || config.medium;
  
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium", color)}>
      <DiffIcon className="h-3 w-3" />
      {label}
    </div>
  );
}

export function InsightsTab({ subscriptions }: InsightsTabProps) {
  const breakdown = calculateEfficiencyScore(subscriptions);
  const insights = getInsightsSummary(subscriptions);

  return (
    <div className="space-y-6">
      {/* Efficiency Score */}
      <EfficiencyScoreCard breakdown={breakdown} />

      {/* Insights Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Duplicates */}
        <InsightCard
          icon={Copy}
          title="Duplicate Subscriptions"
          count={insights.duplicates.length}
          amount={insights.duplicateWaste > 0 ? `$${insights.duplicateWaste.toFixed(0)}/yr waste` : undefined}
          variant="danger"
          defaultExpanded
        >
          <div className="space-y-4">
            {insights.duplicates.map((dup, i) => (
              <DuplicateGroup key={i} groupName={dup.groupName} services={dup.services} />
            ))}
          </div>
        </InsightCard>

        {/* Price Creep */}
        <InsightCard
          icon={TrendingUp}
          title="Price Increases"
          count={insights.priceIncreases.length}
          amount={insights.totalPriceCreep > 0 ? `+$${insights.totalPriceCreep.toFixed(2)}/mo` : undefined}
          variant="warning"
          defaultExpanded
        >
          <div className="space-y-2">
            {insights.priceIncreases.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-2">
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-destructive font-medium">+{sub.priceChange?.changePercent}%</span>
                  <p className="text-xs text-muted-foreground">
                    ${sub.priceChange?.previousAmount} → ${sub.priceChange?.currentAmount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Zombies */}
        <InsightCard
          icon={Ghost}
          title="Zombie Subscriptions"
          count={insights.zombies.length}
          amount={insights.zombieWaste > 0 ? `$${insights.zombieWaste.toFixed(0)}/yr wasted` : undefined}
          variant="danger"
        >
          <div className="space-y-2">
            {insights.zombies.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-2">
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{sub.zombieDays}d inactive</Badge>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${(sub.monthlyEquivalent || sub.amount).toFixed(2)}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Trial Traps */}
        <InsightCard
          icon={Clock}
          title="Trial Traps"
          count={insights.trials.length}
          amount={insights.trialRisk > 0 ? `$${insights.trialRisk.toFixed(0)}/yr at risk` : undefined}
          variant="danger"
          defaultExpanded={insights.trials.length > 0}
        >
          <div className="space-y-2">
            {insights.trials.map(sub => (
              <TrialCountdown key={sub.id} subscription={sub} />
            ))}
          </div>
        </InsightCard>

        {/* Micro-leaks */}
        <InsightCard
          icon={Coins}
          title="Micro-Leaks"
          count={insights.microLeaks.length}
          amount={insights.microLeakTotal > 0 ? `$${insights.microLeakTotal.toFixed(0)}/yr total` : undefined}
          variant="warning"
        >
          <div className="space-y-2">
            {insights.microLeaks.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-2">
                  <span>{sub.icon}</span>
                  <span>{sub.name}</span>
                </div>
                <span className="tabular-nums">${(sub.monthlyEquivalent || sub.amount).toFixed(2)}/mo</span>
              </div>
            ))}
          </div>
        </InsightCard>

        {/* Hard to Cancel */}
        <InsightCard
          icon={ShieldAlert}
          title="Hard to Cancel"
          count={insights.hardToCancel.length}
          variant="warning"
        >
          <div className="space-y-2">
            {insights.hardToCancel.map(sub => (
              <div key={sub.id} className="p-2 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                  </div>
                  <CancellationDifficultyBadge difficulty={sub.cancellationDifficulty} />
                </div>
                {sub.cancellationNotes && (
                  <p className="text-xs text-muted-foreground mt-1 pl-6">{sub.cancellationNotes}</p>
                )}
              </div>
            ))}
          </div>
        </InsightCard>
      </div>
    </div>
  );
}
