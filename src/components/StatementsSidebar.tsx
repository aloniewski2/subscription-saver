import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Home, Search, X } from 'lucide-react';
import { format, parseISO, isValid, startOfMonth, subMonths, isWithinInterval, isAfter } from 'date-fns';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DetectedSubscription } from '@/lib/subscriptionDetector';

interface StatementsSidebarProps {
  subscriptions: DetectedSubscription[];
  onHome: () => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function StatementsSidebar({ 
  subscriptions, 
  onHome, 
  selectedTimeframe, 
  onTimeframeChange,
  searchQuery,
  onSearchChange
}: StatementsSidebarProps) {
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  // Calculate available months from transactions
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    subscriptions.forEach(sub => {
      sub.transactions.forEach(tx => {
        try {
          const date = parseISO(tx.date);
          if (isValid(date)) {
            monthSet.add(format(startOfMonth(date), 'yyyy-MM'));
          }
        } catch {
          // Skip invalid dates
        }
      });
    });
    return Array.from(monthSet).sort().reverse();
  }, [subscriptions]);

  return (
    <Sidebar 
      className={`border-r bg-background transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-60'}`}
      collapsible="icon"
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium"
          >
            Browse
          </motion.span>
        )}
        <SidebarTrigger className="h-8 w-8" />
      </div>

      <SidebarContent className="p-2">
        {/* Home Button */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onHome}
              tooltip="Home"
              className="mb-2 gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Home className="h-4 w-4" />
              {!isCollapsed && <span>Home</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search charges..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 pl-8 pr-8 text-xs"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2"
                  onClick={() => onSearchChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* All Time Quick Filter */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onTimeframeChange('all')}
              tooltip="All Time"
              isActive={selectedTimeframe === 'all'}
              className="gap-2 mb-2"
            >
              <Calendar className="h-3.5 w-3.5" />
              {!isCollapsed && <span className="text-xs">All Time</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Months List */}
        <SidebarGroup>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <SidebarMenu>
                <AnimatePresence>
                  {availableMonths.map((month, index) => {
                    const date = parseISO(month + '-01');
                    const monthLabel = format(date, 'MMMM yyyy');
                    const isActive = selectedTimeframe === month;
                    
                    return (
                      <motion.div
                        key={month}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => onTimeframeChange(month)}
                            tooltip={monthLabel}
                            isActive={isActive}
                            className={`gap-2 transition-all ${isActive ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
                          >
                            <span className="h-4 w-4 flex items-center justify-center text-[10px] font-semibold text-muted-foreground rounded bg-muted">
                              {format(date, 'MMM').substring(0, 3).toUpperCase()}
                            </span>
                            {!isCollapsed && (
                              <span className="text-xs">{format(date, 'MMMM yyyy')}</span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Utility to filter subscriptions by timeframe and search query
export function filterByTimeframe(
  subscriptions: DetectedSubscription[], 
  timeframe: string,
  searchQuery: string = ''
): DetectedSubscription[] {
  let filtered = subscriptions;

  // Apply search filter first
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(sub => 
      sub.name.toLowerCase().includes(query) ||
      sub.category.toLowerCase().includes(query) ||
      sub.transactions.some(tx => 
        tx.description.toLowerCase().includes(query)
      )
    );
  }

  if (timeframe === 'all') return filtered;

  const now = new Date();

  // Check if it's a specific month (yyyy-MM format)
  if (/^\d{4}-\d{2}$/.test(timeframe)) {
    const monthStart = parseISO(timeframe + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    return filtered.filter(sub => {
      return sub.transactions.some(tx => {
        try {
          const txDate = parseISO(tx.date);
          return isValid(txDate) && isWithinInterval(txDate, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      });
    }).map(sub => ({
      ...sub,
      transactions: sub.transactions.filter(tx => {
        try {
          const txDate = parseISO(tx.date);
          return isValid(txDate) && isWithinInterval(txDate, { start: monthStart, end: monthEnd });
        } catch {
          return false;
        }
      })
    }));
  }

  // Handle relative timeframes (1m, 3m, 6m, 12m)
  const monthsBack = parseInt(timeframe.replace('m', ''));
  if (isNaN(monthsBack)) return filtered;

  const startDate = subMonths(now, monthsBack);

  return filtered.filter(sub => {
    return sub.transactions.some(tx => {
      try {
        const txDate = parseISO(tx.date);
        return isValid(txDate) && isAfter(txDate, startDate);
      } catch {
        return false;
      }
    });
  }).map(sub => ({
    ...sub,
    transactions: sub.transactions.filter(tx => {
      try {
        const txDate = parseISO(tx.date);
        return isValid(txDate) && isAfter(txDate, startDate);
      } catch {
        return false;
      }
    })
  }));
}