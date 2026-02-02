import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import type { DetectedSubscription } from '@/lib/subscriptionDetector';

interface SpendingChartProps {
  subscriptions: DetectedSubscription[];
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function SpendingChart({ subscriptions }: SpendingChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    subscriptions.forEach(sub => {
      const current = categoryMap.get(sub.category) || 0;
      categoryMap.set(sub.category, current + sub.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        name: category,
        value: Math.round(amount * 100) / 100,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [subscriptions]);

  if (subscriptions.length === 0) return null;

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground text-xs font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          ${payload.value.toFixed(0)} ({(percent * 100).toFixed(0)}%)
        </text>
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-lg border p-4"
    >
      <p className="mb-4 text-xs text-muted-foreground">Spending by category</p>
      
      <div className="flex items-center gap-4">
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={3}
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
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded border bg-popover px-2 py-1.5 text-xs shadow-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-muted-foreground">${data.value.toFixed(2)}/mo</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-1.5">
          {categoryData.slice(0, 5).map((cat, index) => (
            <motion.div
              key={cat.name}
              className="flex cursor-pointer items-center justify-between text-xs transition-opacity"
              style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.4 }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate text-muted-foreground">{cat.name}</span>
              </div>
              <span className="shrink-0 font-medium">${cat.value.toFixed(0)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
