export const goalStatuses = ['active', 'completed', 'archived'] as const;

export type GoalStatus = (typeof goalStatuses)[number];

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  targetDate: string | null;
  accentColor: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  area?: string;
  targetDate?: string;
  accentColor?: string;
}

export function normalizeCreateGoalInput(input: CreateGoalInput) {
  const title = input.title.trim();

  if (!title) {
    throw new Error('Введите название цели.');
  }

  return {
    title,
    description: input.description?.trim() || null,
    area: input.area?.trim() || null,
    targetDate: input.targetDate || null,
    accentColor: input.accentColor || null,
  };
}
