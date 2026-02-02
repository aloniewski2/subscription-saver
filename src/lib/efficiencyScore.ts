import { DetectedSubscription } from './subscriptionDetector';

export interface EfficiencyBreakdown {
  score: number;
  maxScore: number;
  factors: {
    name: string;
    impact: number; // Negative = penalty, positive = bonus
    description: string;
    severity: 'good' | 'warning' | 'bad';
  }[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
}

// Calculate efficiency score out of 100
export function calculateEfficiencyScore(subscriptions: DetectedSubscription[]): EfficiencyBreakdown {
  const factors: EfficiencyBreakdown['factors'] = [];
  let score = 100;

  // Filter out bills
  const subs = subscriptions.filter(s => s.status !== 'bill');
  
  if (subs.length === 0) {
    return {
      score: 100,
      maxScore: 100,
      factors: [],
      grade: 'A',
      summary: 'No subscriptions to analyze',
    };
  }

  // 1. Duplicate detection penalty (-5 to -15 per duplicate group)
  const duplicateGroups = new Map<string, DetectedSubscription[]>();
  subs.forEach(sub => {
    if (sub.duplicateGroup) {
      const existing = duplicateGroups.get(sub.duplicateGroup.groupId) || [];
      existing.push(sub);
      duplicateGroups.set(sub.duplicateGroup.groupId, existing);
    }
  });

  duplicateGroups.forEach((group, groupId) => {
    if (group.length > 1) {
      const penalty = Math.min(group.length * 5, 15);
      score -= penalty;
      const totalWaste = group.slice(1).reduce((sum, s) => sum + (s.monthlyEquivalent || s.amount), 0);
      factors.push({
        name: `Duplicate ${group[0].duplicateGroup?.groupName || 'services'}`,
        impact: -penalty,
        description: `${group.length} overlapping services: ${group.map(s => s.name).join(', ')}. Potential waste: $${totalWaste.toFixed(2)}/mo`,
        severity: 'bad',
      });
    }
  });

  // 2. Zombie subscription penalty (-8 per zombie)
  const zombies = subs.filter(s => s.isZombie);
  if (zombies.length > 0) {
    const penalty = zombies.length * 8;
    score -= penalty;
    const zombieWaste = zombies.reduce((sum, s) => sum + (s.monthlyEquivalent || s.amount), 0);
    factors.push({
      name: 'Unused subscriptions',
      impact: -penalty,
      description: `${zombies.length} subscription${zombies.length > 1 ? 's' : ''} with no recent activity: ${zombies.map(s => `${s.name} (${s.zombieDays}d)`).join(', ')}. Wasting $${zombieWaste.toFixed(2)}/mo`,
      severity: 'bad',
    });
  }

  // 3. Price increase penalty (-3 per sub with >10% increase)
  const priceHiked = subs.filter(s => s.priceChange && s.priceChange.changePercent > 10);
  if (priceHiked.length > 0) {
    const penalty = priceHiked.length * 3;
    score -= penalty;
    const totalIncrease = priceHiked.reduce((sum, s) => 
      sum + ((s.priceChange?.currentAmount || 0) - (s.priceChange?.previousAmount || 0)), 0);
    factors.push({
      name: 'Price creep',
      impact: -penalty,
      description: `${priceHiked.length} subscription${priceHiked.length > 1 ? 's' : ''} increased prices significantly, adding $${totalIncrease.toFixed(2)}/mo`,
      severity: 'warning',
    });
  }

  // 4. Hard-to-cancel penalty (-4 per hard, -2 per medium)
  const hardToCancel = subs.filter(s => s.cancellationDifficulty === 'hard');
  const mediumToCancel = subs.filter(s => s.cancellationDifficulty === 'medium');
  if (hardToCancel.length > 0) {
    const penalty = hardToCancel.length * 4;
    score -= penalty;
    factors.push({
      name: 'Cancellation traps',
      impact: -penalty,
      description: `${hardToCancel.length} subscription${hardToCancel.length > 1 ? 's' : ''} are difficult to cancel: ${hardToCancel.map(s => s.name).join(', ')}`,
      severity: 'warning',
    });
  }

  // 5. Trial traps penalty (-5 per trial)
  const trials = subs.filter(s => s.isTrial);
  if (trials.length > 0) {
    const penalty = trials.length * 5;
    score -= penalty;
    const totalRisk = trials.reduce((sum, s) => sum + (s.trialConvertsTo || 0), 0);
    factors.push({
      name: 'Trial traps',
      impact: -penalty,
      description: `${trials.length} trial${trials.length > 1 ? 's' : ''} converting soon, risking $${totalRisk.toFixed(0)}/year`,
      severity: 'bad',
    });
  }

  // 6. Micro-leaks penalty (-2 per micro-leak)
  const microLeaks = subs.filter(s => s.isMicroLeak);
  if (microLeaks.length > 0) {
    const penalty = Math.min(microLeaks.length * 2, 10);
    score -= penalty;
    const microTotal = microLeaks.reduce((sum, s) => sum + (s.monthlyEquivalent || s.amount), 0) * 12;
    factors.push({
      name: 'Micro-leaks',
      impact: -penalty,
      description: `${microLeaks.length} small charges adding up to $${microTotal.toFixed(2)}/year`,
      severity: 'warning',
    });
  }

  // 7. Potential leaks penalty (-3 per potential leak)
  const leaks = subs.filter(s => s.status === 'potential-leak' && !s.isZombie && !s.duplicateGroup);
  if (leaks.length > 0) {
    const penalty = leaks.length * 3;
    score -= penalty;
    factors.push({
      name: 'Flagged for review',
      impact: -penalty,
      description: `${leaks.length} subscription${leaks.length > 1 ? 's' : ''} need attention`,
      severity: 'warning',
    });
  }

  // Positive factors
  // 8. Easy cancellation bonus (+2 per easy)
  const easyCancel = subs.filter(s => s.cancellationDifficulty === 'easy');
  if (easyCancel.length > 3) {
    const bonus = Math.min((easyCancel.length - 3) * 1, 5);
    score += bonus;
    factors.push({
      name: 'Flexible subscriptions',
      impact: bonus,
      description: `${easyCancel.length} subscriptions with one-click cancellation`,
      severity: 'good',
    });
  }

  // 9. Active, no issues bonus
  const healthy = subs.filter(s => 
    s.status === 'active' && 
    !s.isZombie && 
    !s.duplicateGroup && 
    !s.isTrial && 
    !s.priceChange
  );
  if (healthy.length > 0 && healthy.length > subs.length * 0.5) {
    const bonus = 5;
    score += bonus;
    factors.push({
      name: 'Healthy subscriptions',
      impact: bonus,
      description: `${healthy.length} subscriptions with no issues detected`,
      severity: 'good',
    });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Calculate grade
  let grade: EfficiencyBreakdown['grade'];
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  // Generate summary
  const worstFactor = factors.filter(f => f.impact < 0).sort((a, b) => a.impact - b.impact)[0];
  let summary = '';
  if (score >= 90) {
    summary = 'Excellent subscription hygiene! Keep it up.';
  } else if (score >= 75) {
    summary = worstFactor ? `Good overall, but ${worstFactor.name.toLowerCase()} needs attention.` : 'Good subscription management.';
  } else if (score >= 60) {
    summary = worstFactor ? `Fair score. Focus on fixing ${worstFactor.name.toLowerCase()}.` : 'Room for improvement.';
  } else if (score >= 40) {
    summary = 'Several issues detected. Review your subscriptions carefully.';
  } else {
    summary = 'Urgent attention needed! Significant subscription waste detected.';
  }

  return {
    score: Math.round(score),
    maxScore: 100,
    factors: factors.sort((a, b) => a.impact - b.impact),
    grade,
    summary,
  };
}

// Get insights summary
export function getInsightsSummary(subscriptions: DetectedSubscription[]) {
  const subs = subscriptions.filter(s => s.status !== 'bill');
  
  // Duplicates
  const duplicateGroups = new Map<string, DetectedSubscription[]>();
  subs.forEach(sub => {
    if (sub.duplicateGroup) {
      const existing = duplicateGroups.get(sub.duplicateGroup.groupId) || [];
      existing.push(sub);
      duplicateGroups.set(sub.duplicateGroup.groupId, existing);
    }
  });
  const actualDuplicates: { groupName: string; services: DetectedSubscription[] }[] = [];
  duplicateGroups.forEach((group) => {
    if (group.length > 1) {
      actualDuplicates.push({
        groupName: group[0].duplicateGroup?.groupName || 'Services',
        services: group,
      });
    }
  });

  // Price creep
  const priceIncreases = subs.filter(s => s.priceChange && s.priceChange.changePercent > 0);
  const totalPriceCreep = priceIncreases.reduce((sum, s) => 
    sum + ((s.priceChange?.currentAmount || 0) - (s.priceChange?.previousAmount || 0)), 0);

  // Zombies
  const zombies = subs.filter(s => s.isZombie);
  const zombieWaste = zombies.reduce((sum, s) => sum + (s.monthlyEquivalent || s.amount), 0);

  // Trials
  const trials = subs.filter(s => s.isTrial);
  const trialRisk = trials.reduce((sum, s) => sum + (s.trialConvertsTo || 0), 0);

  // Micro-leaks
  const microLeaks = subs.filter(s => s.isMicroLeak);
  const microLeakTotal = microLeaks.reduce((sum, s) => sum + (s.monthlyEquivalent || s.amount), 0) * 12;

  // Cancellation difficulty
  const hardToCancel = subs.filter(s => s.cancellationDifficulty === 'hard');
  const easyToCancel = subs.filter(s => s.cancellationDifficulty === 'easy');

  return {
    duplicates: actualDuplicates,
    duplicateWaste: actualDuplicates.reduce((sum, d) => 
      sum + d.services.slice(1).reduce((s, sub) => s + (sub.monthlyEquivalent || sub.amount), 0), 0) * 12,
    priceIncreases,
    totalPriceCreep,
    zombies,
    zombieWaste: zombieWaste * 12,
    trials,
    trialRisk,
    microLeaks,
    microLeakTotal,
    hardToCancel,
    easyToCancel,
  };
}
