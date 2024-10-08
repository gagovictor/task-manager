import { ChecklistItem } from "./checklist";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  checklist: ChecklistItem[] | null;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  modifiedAt: Date | null;
  archivedAt: Date | null;
  deletedAt: Date | null;
}

export interface CreateTaskRequestBody {
  title: string;
  description: string | null;
  checklist: ChecklistItem[] | null;
  dueDate: Date | null;
  status: string;
}

export interface CreateTaskDto {
  userId: string;
  title: string;
  description: string | null;
  checklist: ChecklistItem[] | null;
  dueDate: Date | null;
  status: string;
}

export interface UpdateTaskRequestBody {
  title?: string;
  description?: string | null;
  checklist?: ChecklistItem[] | null;
  dueDate?: Date | null;
  status?: string;
}

export interface UpdateTaskDto {
  userId: string;
  title?: string;
  description?: string | null;
  checklist?: ChecklistItem[] | null;
  dueDate?: Date | null;
  status?: string;
}

export interface UpdateTaskStatusRequestBody {
  status: string;
}

export const TaskStatus = {
  New: 'new',
  Active: 'active',
  Completed: 'completed',
  Removed: 'removed'
};