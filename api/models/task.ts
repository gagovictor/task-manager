interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status?: string;
  archivedAt?: Date;
  deletedAt?: Date;
  userId?: string;
}

export default Task;
