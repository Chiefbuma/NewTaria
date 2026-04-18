import type { Goal } from '@/lib/types';

export type GoalProgressState = {
  label: 'Goal Achieved' | 'Overdue' | 'In Progress' | 'Cancelled';
  variant: 'default' | 'secondary' | 'destructive';
  isOverdue: boolean;
};

export type GoalAssessmentLevel = 'achieved' | 'on_track' | 'off_track' | 'critical';

export function getGoalProgressState(goal: Goal, now = new Date()): GoalProgressState {
  if (goal.status === 'completed') {
    return {
      label: 'Goal Achieved',
      variant: 'default',
      isOverdue: false,
    };
  }

  if (goal.status === 'cancelled') {
    return {
      label: 'Cancelled',
      variant: 'secondary',
      isOverdue: false,
    };
  }

  const deadline = new Date(goal.deadline);
  const hasValidDeadline = !Number.isNaN(deadline.getTime());
  const isOverdue =
    hasValidDeadline &&
    deadline.getTime() < now.getTime() &&
    goal.status === 'active';

  if (isOverdue) {
    return {
      label: 'Overdue',
      variant: 'destructive',
      isOverdue: true,
    };
  }

  return {
    label: 'In Progress',
    variant: 'secondary',
    isOverdue: false,
  };
}

export function getGoalAssessmentLevel(goal: Goal, assessmentValue: string): GoalAssessmentLevel {
  const current = Number.parseFloat(assessmentValue);
  const target = Number.parseFloat(goal.target_value);

  if (!Number.isFinite(current) || !Number.isFinite(target)) {
    return assessmentValue === goal.target_value ? 'achieved' : 'critical';
  }

  const meetsTarget = (() => {
    switch (goal.target_operator) {
      case '<':
        return current < target;
      case '<=':
        return current <= target;
      case '=':
        return current === target;
      case '>=':
        return current >= target;
      case '>':
        return current > target;
      default:
        return false;
    }
  })();

  if (meetsTarget) {
    return 'achieved';
  }

  const toleranceBase = Math.max(Math.abs(target), 1);
  const gap =
    goal.target_operator === '>' || goal.target_operator === '>='
      ? Math.max(0, target - current)
      : Math.max(0, current - target);
  const ratio = gap / toleranceBase;

  if (ratio <= 0.1) return 'on_track';
  if (ratio <= 0.25) return 'off_track';
  return 'critical';
}

export function getGoalAssessmentFill(level: GoalAssessmentLevel): string {
  switch (level) {
    case 'achieved':
    case 'on_track':
      return '#067f46';
    case 'off_track':
    case 'critical':
    default:
      return '#8c0505';
  }
}
