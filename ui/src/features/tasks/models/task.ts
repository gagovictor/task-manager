import { ChecklistItem } from './checklist';

export interface Task {
  id: string; // UUID
  title: string;
  description: string;
  dueDate: string|null;
  status: string/*TaskStatus*/;
  userId: string;
  createdAt: string;
  archivedAt: string|null;
  deletedAt: string|null;
  checklist?: ChecklistItem[]|null;
}

export type TaskStatus = 'new' | 'active' | 'completed' | 'removed';

export const taskStatuses = ['new', 'active', 'completed', 'removed'];