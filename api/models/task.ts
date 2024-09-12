export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status?: string;
  archivedAt?: Date;
  deletedAt?: Date;
  userId?: string;
}

export interface CreateTaskRequestBody {
  title: string;
  description?: string;
  dueDate?: Date;
  status?: string;
  userId: string;
}

export interface UpdateTaskRequestBody {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: string;
}

export interface UpdateTaskStatusRequestBody {
  status: string;
}