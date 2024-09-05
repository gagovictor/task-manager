import API_BASE_URL from '../../shared/config/apiConfig';
import apiClient from '../../shared/services/ApiService';
import { Task } from '../models/task';

export const fetchTasks = async (token: string) => {
    const response = await apiClient.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface CreateTaskRequest {
    title: string;
    description: string;
    dueDate: string|null;
    status:  string/*TaskStatus*/;
}

export interface CreateTaskResponse extends Task {
}

export const createTask = async (request: CreateTaskRequest, token: string) => {
    const response = await apiClient.post(`${API_BASE_URL}/tasks`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface UpdateTaskRequest {
    id: string;
    title: string;
    description: string;
    dueDate: string|null;
    status:  string/*TaskStatus*/;
}

export interface UpdateTaskResponse extends Task {
}

export const updateTask = async (request: UpdateTaskRequest, token: string) => {
    const response = await apiClient.patch(`${API_BASE_URL}/tasks/${request.id}`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteTask = async (taskId: string, token: string) => {
    const response = await apiClient.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const archiveTask = async (taskId: string, token: string) => {
    const response = await apiClient.post(`${API_BASE_URL}/tasks/${taskId}/archive`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const unarchiveTask = async (taskId: string, token: string) => {
    const response = await apiClient.post(`${API_BASE_URL}/tasks/${taskId}/unarchive`, null, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface UpdateTaskStatusRequest {
    id: string;
    status: string; /*TaskStatus*/
}

export const updateTaskStatus = async (request: UpdateTaskStatusRequest, token: string) => {
    const response = await apiClient.post(`${API_BASE_URL}/tasks/${request.id}/status`, { status: request.status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};