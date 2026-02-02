import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DetectedSubscription } from '@/lib/subscriptionDetector';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: DetectedSubscription) => void;
}

const CATEGORIES = [
  { value: 'Entertainment', icon: '🎬' },
  { value: 'Music', icon: '🎵' },
  { value: 'Productivity', icon: '📎' },
  { value: 'Storage', icon: '☁️' },
  { value: 'Fitness', icon: '💪' },
  { value: 'Health', icon: '🧘' },
  { value: 'Gaming', icon: '🎮' },
  { value: 'News', icon: '📰' },
  { value: 'Reading', icon: '📖' },
  { value: 'Food', icon: '🍕' },
  { value: 'Security', icon: '🔒' },
  { value: 'Dating', icon: '💕' },
  { value: 'Education', icon: '🎓' },
  { value: 'AI', icon: '🤖' },
  { value: 'Professional', icon: '💼' },
  { value: 'Design', icon: '🎨' },
  { value: 'Development', icon: '🐙' },
  { value: 'Web', icon: '🌐' },
  { value: 'Business', icon: '🛍️' },
  { value: 'Finance', icon: '💰' },
  { value: 'Home', icon: '🏠' },
  { value: 'Bill', icon: '📄' },
  { value: 'Other', icon: '📦' },
];

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
];

export function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [isBill, setIsBill] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount) return;

    const categoryData = CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
    const parsedAmount = parseFloat(amount);
    
    const newSubscription: DetectedSubscription = {
      id: `manual-${Date.now()}`,
      name: name.trim(),
      category: isBill ? 'Bill' : category,
      icon: isBill ? '📄' : categoryData.icon,
      amount: parsedAmount,
      frequency,
      lastCharge: new Date().toISOString().split('T')[0],
      chargeCount: 1,
      status: isBill ? 'bill' : 'active',
      transactions: [],
      monthlyEquivalent: frequency === 'yearly' ? parsedAmount / 12 : 
                         frequency === 'weekly' ? parsedAmount * 4.33 : parsedAmount,
    };

    onAdd(newSubscription);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setAmount('');
    setCategory('Other');
    setFrequency('monthly');
    setIsBill(false);
  };

  const selectedCategory = CATEGORIES.find(c => c.value === category);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium">Add Subscription</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Netflix, Gym Membership"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label>Billing Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as 'monthly' | 'yearly' | 'weekly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory} disabled={isBill}>
                  <SelectTrigger>
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span>{selectedCategory?.icon}</span>
                        <span>{category}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.value}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Is Bill Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isBill"
                  checked={isBill}
                  onChange={(e) => setIsBill(e.target.checked)}
                  className="h-4 w-4 rounded border-muted-foreground/30"
                />
                <Label htmlFor="isBill" className="cursor-pointer text-sm font-normal text-muted-foreground">
                  This is a recurring bill (rent, utilities, insurance)
                </Label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}