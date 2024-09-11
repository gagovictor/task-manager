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

interface TaskRepository {
    createTask(task: Task): Promise<Task>;
    getTaskById(id: string): Promise<Task | null>;
    updateTask(id: string, task: Partial<Task>): Promise<Task | null>;
    deleteTask(id: string): Promise<Task | null>;
    getAllTasks(): Promise<Task[]>;
}

export default TaskRepository;
