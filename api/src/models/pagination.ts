export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface TaskFilter {
    archived?: boolean;
    status?: string;
    dueDate?: Date;
}
