import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, BarChart3, List, Plus, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscriptionCard } from './SubscriptionCard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { InsightsTab } from './InsightsTab';
import { AddSubscriptionModal } from './AddSubscriptionModal';
import { calculateTotalMonthlySpend, calculatePotentialSavings } from '@/lib/subscriptionDetector';
import type { DetectedSubscription } from '@/lib/subscriptionDetector';

interface DashboardProps {
  subscriptions: DetectedSubscription[];
  onReset: () => void;
  onAddSubscription: (subscription: DetectedSubscription) => void;
  isDemo?: boolean;
  selectedTimeframe?: string;
}

export function Dashboard({ subscriptions, onReset, onAddSubscription, isDemo, selectedTimeframe }: DashboardProps) {
  const [view, setView] = useState<'list' | 'analytics' | 'insights'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const totalMonthly = calculateTotalMonthlySpend(subscriptions);
  const potentialSavings = calculatePotentialSavings(subscriptions);
  const leakCount = subscriptions.filter(s => s.status === 'potential-leak').length;
  const billCount = subscriptions.filter(s => s.status === 'bill').length;
  const subCount = subscriptions.filter(s => s.status !== 'bill').length;

  // Format timeframe label
  const getTimeframeLabel = () => {
    if (!selectedTimeframe || selectedTimeframe === 'all') return null;
    if (selectedTimeframe === '1m') return 'Last month';
    if (selectedTimeframe === '3m') return 'Last 3 months';
    if (selectedTimeframe === '6m') return 'Last 6 months';
    if (selectedTimeframe === '12m') return 'Last year';
    // It's a specific month (yyyy-MM)
    if (/^\d{4}-\d{2}$/.test(selectedTimeframe)) {
      const [year, month] = selectedTimeframe.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return null;
  };

  const timeframeLabel = getTimeframeLabel();

  return (
    <section className="px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-medium">
                {subCount} subscription{subCount !== 1 ? 's' : ''}{billCount > 0 ? `, ${billCount} bill${billCount !== 1 ? 's' : ''}` : ''}
              </h2>
              {isDemo && (
                <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  demo
                </span>
              )}
              {timeframeLabel && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                  {timeframeLabel}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              ${totalMonthly.toFixed(2)}/month subscriptions · ${(totalMonthly * 12).toFixed(0)}/year
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="gap-1.5"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              variant={view === 'insights' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('insights')}
              className="gap-1.5"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Insights</span>
            </Button>
            <Button
              variant={view === 'analytics' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('analytics')}
              className="gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>

        {/* Savings alert */}
        {potentialSavings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 text-accent" />
            <div className="text-sm">
              <p className="font-medium text-accent">
                Potential savings: ${potentialSavings.toFixed(2)}/month
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {leakCount} subscription{leakCount > 1 ? 's' : ''} flagged for review
              </p>
            </div>
          </motion.div>
        )}

        {/* Insights View */}
        {view === 'insights' && (
          <InsightsTab subscriptions={subscriptions} />
        )}

        {/* Analytics View */}
        {view === 'analytics' && (
          <AnalyticsDashboard subscriptions={subscriptions} />
        )}

        {/* List View - Stats row */}
        {view === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 grid grid-cols-3 gap-4"
          >
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="mt-1 text-lg font-medium">${totalMonthly.toFixed(0)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Yearly</p>
              <p className="mt-1 text-lg font-medium">${(totalMonthly * 12).toFixed(0)}</p>
            </div>
            <div className={`rounded-lg border p-4 ${potentialSavings > 0 ? 'border-accent/30 bg-accent/5' : ''}`}>
              <p className="text-xs text-muted-foreground">Potential leaks</p>
              <p className={`mt-1 text-lg font-medium ${potentialSavings > 0 ? 'text-accent' : ''}`}>
                {leakCount}
              </p>
            </div>
          </motion.div>
        )}

        {/* Subscription list */}
        {view === 'list' && (
          <div className="space-y-2">
            {subscriptions.map((subscription, index) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {subscriptions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <p className="text-sm text-muted-foreground">
              No subscriptions detected. Try a different file or add one manually.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Subscription
            </Button>
          </motion.div>
        )}

        {/* Add Subscription Modal */}
        <AddSubscriptionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={onAddSubscription}
        />
      </div>
    </section>
  );
}
