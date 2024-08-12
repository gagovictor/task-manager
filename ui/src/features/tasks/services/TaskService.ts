import axios from 'axios';
import API_BASE_URL from '../../shared/config/apiConfig';
import { Task, TaskStatus } from '../models/task';

export const fetchTasks = async (token: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }
    
    return response.json();
};

export interface CreateTaskRequest {
    title: string;
    description: string;
    dueDate: string;
    status:  string/*TaskStatus*/;
}

export interface CreateTaskResponse extends Task {
}

export const createTask = async (request: CreateTaskRequest, token: string) => {
    const response = await axios.post(`${API_BASE_URL}/tasks`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export interface UpdateTaskRequest {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status:  string/*TaskStatus*/;
}

export interface UpdateTaskResponse extends Task {
}

export const updateTask = async (request: UpdateTaskRequest, token: string) => {
    const response = await axios.patch(`${API_BASE_URL}/tasks/${request.id}`, request, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};