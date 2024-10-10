import apiClient from '../../shared/services/ApiService';
import { ChecklistItem } from '../models/checklist';
import { FetchTasksParams, PaginatedResponse } from '../models/api';
import { Task } from '../models/task';

export const fetchTasks = async (
    token: string,
    params: FetchTasksParams
): Promise<PaginatedResponse<Task>> => {
    const {
        page = 0,
        limit = 10,
        filters = {
            archived: false
        }
    } = params;
    
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        archived: filters.archived!.toString(),
    });
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await apiClient.get(`${process.env.REACT_APP_API_BASE_URL}/tasks${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface CreateTaskRequest {
    title: string;
    description: string;
    checklist: ChecklistItem[] | null;
    dueDate: string | null;
    status:  string/*TaskStatus*/;
}

export interface CreateTaskResponse extends Task {
}

export const createTask = async (request: CreateTaskRequest, token: string) => {
    const response = await apiClient.post(`${process.env.REACT_APP_API_BASE_URL}/tasks`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface UpdateTaskRequest {
    id: string;
    title: string;
    description: string;
    checklist: ChecklistItem[] | null;
    dueDate: string | null;
    status:  string/*TaskStatus*/;
}

export interface UpdateTaskResponse extends Task {
}

export const updateTask = async (request: UpdateTaskRequest, token: string) => {
    const response = await apiClient.patch(`${process.env.REACT_APP_API_BASE_URL}/tasks/${request.id}`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteTask = async (taskId: string, token: string) => {
    const response = await apiClient.delete(`${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const archiveTask = async (taskId: string, token: string) => {
    const response = await apiClient.post(`${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}/archive`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const unarchiveTask = async (taskId: string, token: string) => {
    const response = await apiClient.post(`${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}/unarchive`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface UpdateTaskStatusRequest {
    id: string;
    status: string; /*TaskStatus*/
}

export const updateTaskStatus = async (request: UpdateTaskStatusRequest, token: string) => {
    const response = await apiClient.post(`${process.env.REACT_APP_API_BASE_URL}/tasks/${request.id}/status`, { status: request.status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};