import { ChecklistItem } from "./checklist";

export interface Task {
  id: string;
  title: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  status?: string;
  archivedAt?: Date;
  deletedAt?: Date;
  userId?: string;
}

export interface CreateTaskRequestBody {
  title: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  status?: string;
  userId: string;
}

export interface UpdateTaskRequestBody {
  title?: string;
  description?: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  status?: string;
}

export interface UpdateTaskStatusRequestBody {
  status: string;
}