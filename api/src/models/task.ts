import { ChecklistItem } from "./checklist";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  status?: string;
  createdAt: Date;
  modifiedAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
}

export interface CreateTaskRequestBody {
  title: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  status?: string;
}

export interface CreateTaskDto {
  userId: string;
  title: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  status?: string;
}

export interface UpdateTaskRequestBody {
  title?: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  status?: string;
}

export interface UpdateTaskDto {
  userId: string;
  title?: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
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