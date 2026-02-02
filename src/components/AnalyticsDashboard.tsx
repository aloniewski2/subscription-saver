import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector,
  BarChart, Bar, XAxis, YAxis,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Layers, LineChart as LineChartIcon, ChevronDown } from 'lucide-react';
import { format, parseISO, startOfMonth, isValid } from 'date-fns';
import type { DetectedSubscription } from '@/lib/subscriptionDetector';

interface AnalyticsDashboardProps {
  subscriptions: DetectedSubscription[];
}

interface CategoryDataItem {
  name: string;
  value: number;
  count: number;
  items: string[];
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: 'hsl(var(--chart-1))',
  Music: 'hsl(var(--chart-2))',
  Productivity: 'hsl(var(--chart-3))',
  Storage: 'hsl(var(--chart-4))',
  Fitness: 'hsl(var(--chart-5))',
  Health: 'hsl(var(--chart-1))',
  Gaming: 'hsl(var(--chart-2))',
  News: 'hsl(var(--chart-3))',
  Reading: 'hsl(var(--chart-4))',
  Food: 'hsl(var(--chart-5))',
  Security: 'hsl(var(--chart-1))',
  Dating: 'hsl(var(--chart-2))',
  Education: 'hsl(var(--chart-3))',
  AI: 'hsl(var(--chart-4))',
  Professional: 'hsl(var(--chart-5))',
  Design: 'hsl(var(--chart-1))',
  Development: 'hsl(var(--chart-2))',
  Web: 'hsl(var(--chart-3))',
  Business: 'hsl(var(--chart-4))',
  Marketing: 'hsl(var(--chart-5))',
  Finance: 'hsl(var(--chart-1))',
  Home: 'hsl(var(--chart-2))',
  Bill: 'hsl(var(--muted-foreground))',
  Other: 'hsl(var(--chart-5))',
};

export function AnalyticsDashboard({ subscriptions }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    // Separate bills from subscriptions
    const bills = subscriptions.filter(s => s.status === 'bill');
    const subs = subscriptions.filter(s => s.status !== 'bill');
    
    // Category breakdown
    const categoryMap = new Map<string, { total: number; count: number; items: string[] }>();
    subscriptions.forEach(sub => {
      const existing = categoryMap.get(sub.category) || { total: 0, count: 0, items: [] };
      const monthlyAmount = sub.monthlyEquivalent || sub.amount;
      existing.total += monthlyAmount;
      existing.count += 1;
      existing.items.push(sub.name);
      categoryMap.set(sub.category, existing);
    });

    const categoryData = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        value: Math.round(data.total * 100) / 100,
        count: data.count,
        items: data.items,
        color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
      }))
      .sort((a, b) => b.value - a.value);

    // Type breakdown (subscriptions vs bills)
    const subsTotal = subs.reduce((acc, s) => acc + (s.monthlyEquivalent || s.amount), 0);
    const billsTotal = bills.reduce((acc, s) => acc + (s.monthlyEquivalent || s.amount), 0);

    const typeData = [
      { name: 'Subscriptions', value: Math.round(subsTotal * 100) / 100, count: subs.length },
      { name: 'Bills', value: Math.round(billsTotal * 100) / 100, count: bills.length },
    ].filter(d => d.value > 0);

    // Frequency breakdown
    const freqMap = new Map<string, number>();
    subscriptions.forEach(sub => {
      const freq = sub.frequency === 'yearly' ? 'Annual' : sub.frequency === 'weekly' ? 'Weekly' : 'Monthly';
      const monthlyAmount = sub.monthlyEquivalent || sub.amount;
      freqMap.set(freq, (freqMap.get(freq) || 0) + monthlyAmount);
    });

    const frequencyData = Array.from(freqMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

    // Top spenders
    const topSpenders = [...subscriptions]
      .sort((a, b) => (b.monthlyEquivalent || b.amount) - (a.monthlyEquivalent || a.amount))
      .slice(0, 5)
      .map(s => ({
        name: s.name,
        value: Math.round((s.monthlyEquivalent || s.amount) * 100) / 100,
        icon: s.icon,
      }));

    // Leak analysis
    const leaks = subscriptions.filter(s => s.status === 'potential-leak');
    const leakTotal = leaks.reduce((acc, s) => acc + (s.monthlyEquivalent || s.amount), 0);

    // Monthly trend - aggregate all transactions by month
    const monthlyMap = new Map<string, { subscriptions: number; bills: number }>();
    subscriptions.forEach(sub => {
      sub.transactions.forEach(tx => {
        try {
          const date = parseISO(tx.date);
          if (!isValid(date)) return;
          const monthKey = format(startOfMonth(date), 'yyyy-MM');
          const existing = monthlyMap.get(monthKey) || { subscriptions: 0, bills: 0 };
          if (sub.status === 'bill') {
            existing.bills += Math.abs(tx.amount);
          } else {
            existing.subscriptions += Math.abs(tx.amount);
          }
          monthlyMap.set(monthKey, existing);
        } catch {
          // Skip invalid dates
        }
      });
    });

    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        label: format(parseISO(month + '-01'), 'MMM'),
        subscriptions: Math.round(data.subscriptions * 100) / 100,
        bills: Math.round(data.bills * 100) / 100,
        total: Math.round((data.subscriptions + data.bills) * 100) / 100,
      }));

    return {
      categoryData,
      typeData,
      frequencyData,
      topSpenders,
      monthlyTrend,
      totalMonthly: subsTotal + billsTotal,
      subsTotal,
      billsTotal,
      leakTotal,
      leakCount: leaks.length,
      subscriptionCount: subs.length,
      billCount: bills.length,
    };
  }, [subscriptions]);

  if (subscriptions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8 space-y-6"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Monthly"
          value={`$${analytics.totalMonthly.toFixed(0)}`}
          sublabel={`$${(analytics.totalMonthly * 12).toFixed(0)}/yr`}
        />
        <StatCard
          icon={Layers}
          label="Subscriptions"
          value={`$${analytics.subsTotal.toFixed(0)}`}
          sublabel={`${analytics.subscriptionCount} active`}
        />
        <StatCard
          icon={Calendar}
          label="Bills"
          value={`$${analytics.billsTotal.toFixed(0)}`}
          sublabel={`${analytics.billCount} recurring`}
        />
        <StatCard
          icon={analytics.leakTotal > 0 ? TrendingDown : TrendingUp}
          label="Potential Leaks"
          value={`$${analytics.leakTotal.toFixed(0)}`}
          sublabel={`${analytics.leakCount} flagged`}
          highlight={analytics.leakTotal > 0}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown */}
        <InteractiveCategoryChart categoryData={analytics.categoryData} />

        {/* Top Spenders */}
        <InteractiveTopSpenders topSpenders={analytics.topSpenders} />

        {/* Type Split */}
        <div className="rounded-lg border p-4">
          <p className="mb-4 text-xs font-medium text-muted-foreground">Subscriptions vs Bills</p>
          <div className="space-y-3">
            {analytics.typeData.map((type) => {
              const percentage = (type.value / analytics.totalMonthly) * 100;
              return (
                <div key={type.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{type.name}</span>
                    <span className="font-medium">
                      ${type.value.toFixed(0)} <span className="text-muted-foreground">({percentage.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full rounded-full ${type.name === 'Bills' ? 'bg-muted-foreground' : 'bg-foreground'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequency Breakdown */}
        <div className="rounded-lg border p-4">
          <p className="mb-4 text-xs font-medium text-muted-foreground">By Billing Cycle</p>
          <div className="space-y-3">
            {analytics.frequencyData.map((freq) => {
              const percentage = (freq.value / analytics.totalMonthly) * 100;
              return (
                <div key={freq.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{freq.name}</span>
                    <span className="font-medium">
                      ${freq.value.toFixed(0)}/mo
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="h-full rounded-full bg-foreground/70"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {analytics.monthlyTrend.length > 1 && (
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Monthly Spending Trend</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.monthlyTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="subsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="billsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value}`}
                  width={50}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#subsGradient)"
                  name="Subscriptions"
                />
                <Area
                  type="monotone"
                  dataKey="bills"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#billsGradient)"
                  name="Bills"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-4 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
              <span className="text-muted-foreground">Subscriptions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-4 rounded-sm" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }} />
              <span className="text-muted-foreground">Bills</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  highlight,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  sublabel: string;
  highlight?: boolean;
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-md ${highlight ? 'border-accent/30 bg-accent/5' : 'hover:border-foreground/20'}`}
    >
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon className={`h-3.5 w-3.5 ${highlight ? 'text-accent' : 'text-muted-foreground'}`} />
        </motion.div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <motion.p 
        className={`mt-1.5 text-lg font-medium ${highlight ? 'text-accent' : ''}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </motion.div>
  );
}

function InteractiveCategoryChart({ categoryData }: { categoryData: CategoryDataItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground text-[10px] font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          ${payload.value.toFixed(0)} ({(percent * 100).toFixed(0)}%)
        </text>
      </g>
    );
  };

  return (
    <motion.div 
      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
      whileHover={{ borderColor: 'hsl(var(--foreground) / 0.2)' }}
    >
      <p className="mb-4 text-xs font-medium text-muted-foreground">Spending by Category</p>
      <div className="flex items-center gap-4">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                activeIndex={activeIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ 
                      cursor: 'pointer', 
                      transition: 'opacity 0.2s',
                      opacity: activeIndex === null || activeIndex === index ? 1 : 0.4
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {categoryData.slice(0, 5).map((cat, index) => (
            <motion.div 
              key={cat.name}
              className="cursor-pointer rounded-md px-1.5 py-1 transition-colors hover:bg-muted/50"
              style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.4 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
              whileHover={{ x: 2 }}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <motion.div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    animate={{ scale: activeIndex === index ? 1.3 : 1 }}
                  />
                  <span className="truncate text-muted-foreground">{cat.name}</span>
                  <ChevronDown 
                    className={`h-3 w-3 text-muted-foreground transition-transform ${expandedCategory === cat.name ? 'rotate-180' : ''}`} 
                  />
                </div>
                <span className="shrink-0 font-medium">${cat.value.toFixed(0)}</span>
              </div>
              <AnimatePresence>
                {expandedCategory === cat.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 pl-4 text-[10px] text-muted-foreground">
                      {cat.items.slice(0, 3).join(', ')}
                      {cat.items.length > 3 && ` +${cat.items.length - 3} more`}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function InteractiveTopSpenders({ topSpenders }: { topSpenders: Array<{ name: string; value: number; icon: string }> }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...topSpenders.map(s => s.value));

  return (
    <motion.div 
      className="rounded-lg border p-4 transition-shadow hover:shadow-md"
      whileHover={{ borderColor: 'hsl(var(--foreground) / 0.2)' }}
    >
      <p className="mb-4 text-xs font-medium text-muted-foreground">Top Spenders</p>
      <div className="space-y-2">
        {topSpenders.map((spender, index) => {
          const percentage = (spender.value / maxValue) * 100;
          return (
            <motion.div
              key={spender.name}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ x: 4 }}
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <motion.span 
                    className="text-sm"
                    animate={{ scale: hoveredIndex === index ? 1.2 : 1 }}
                  >
                    {spender.icon}
                  </motion.span>
                  <span className={`truncate transition-colors ${hoveredIndex === index ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {spender.name}
                  </span>
                </div>
                <motion.span 
                  className="shrink-0 font-medium"
                  animate={{ scale: hoveredIndex === index ? 1.1 : 1 }}
                >
                  ${spender.value.toFixed(0)}/mo
                </motion.span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${percentage}%`,
                    backgroundColor: hoveredIndex === index ? 'hsl(var(--chart-1))' : 'hsl(var(--foreground))'
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border bg-popover px-2.5 py-2 text-xs shadow-sm">
      <p className="mb-1.5 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-medium">${entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}
