export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface FetchTasksParams {
    page: number;
    limit: number;
    filters?: TaskFilter;
}

export interface TaskFilter {
    archived?: boolean;
    status?: string;
    dueDate?: Date;
}