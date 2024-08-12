import { User } from "../../auth/models/user";

export interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  dueDate?: string;
  status?: string/*TaskStatus*/;
  userId?: string;
  user?: User;
}

export type TaskStatus = 'pending' | 'completed';