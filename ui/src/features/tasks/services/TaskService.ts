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

export const createTask = async (task: { title: string; description: string; dueDate: string }, token: string) => {
    const response = await axios.post(`${API_BASE_URL}/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};