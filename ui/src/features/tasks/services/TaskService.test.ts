import apiClient from '../../shared/services/ApiService';
import { fetchTasks, createTask, updateTask, deleteTask, archiveTask, unarchiveTask, updateTaskStatus } from './TaskService'; // Adjust path as needed
import { Task } from '../models/task';
import { FetchTasksParams } from '../models/api';

jest.mock('../../shared/services/ApiService');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('TaskService', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('fetchTasks', () => {
        const fetchParams: FetchTasksParams = {
            page: 1,
            limit: 10,
            filters: {
                archived: false
            }
        };

        it('should return tasks data when API call is successful', async () => {
            const token = 'fake-token';
            const response: Task[] = [{
                id: '1',
                userId: '1',
                title: 'Test Task',
                description: 'Test Description',
                dueDate: new Date().toISOString(),
                status: 'new',
                createdAt: new Date().toISOString(),
                archivedAt: null,
                deletedAt: null
            }];
            mockedApiClient.get.mockResolvedValue({ data: response });

            const result = await fetchTasks(token, fetchParams);

            expect(result).toEqual(response);
            expect(mockedApiClient.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/tasks?page=1&limit=10&archived=false`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const token = 'fake-token';

            mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

            await expect(fetchTasks(token, fetchParams)).rejects.toThrow('Network Error');
        });
    });

    describe('createTask', () => {
        it('should return created task data when API call is successful', async () => {
            const request = { title: 'New Task', description: 'Task Description', checklist: null, dueDate: new Date().toISOString(), status: 'active' };
            const token = 'fake-token';
            const response: Task = { id: '1', ...request, userId: 'userId', createdAt: new Date().toISOString(), archivedAt: null, deletedAt: null };
            mockedApiClient.post.mockResolvedValue({ data: response });

            const result = await createTask(request, token);

            expect(result).toEqual(response);
            expect(mockedApiClient.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/tasks`, request, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const request = { title: 'New Task', description: 'Task Description', checklist: null, dueDate: new Date().toISOString(), status: 'active' };
            const token = 'fake-token';
            mockedApiClient.post.mockRejectedValue(new Error('Network Error'));

            await expect(createTask(request, token)).rejects.toThrow('Network Error');
        });
    });

    describe('updateTask', () => {
        it('should return updated task data when API call is successful', async () => {
            const request = { id: '1', title: 'Updated Task', description: 'Updated Description', checklist: null, dueDate: new Date().toISOString(), status: 'completed' };
            const token = 'fake-token';
            const response: Task = { ...request, userId: 'userId', createdAt: new Date().toISOString(), archivedAt: null, deletedAt: null };
            mockedApiClient.patch.mockResolvedValue({ data: response });

            const result = await updateTask(request, token);

            expect(result).toEqual(response);
            expect(mockedApiClient.patch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/tasks/${request.id}`, request, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(mockedApiClient.patch).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const request = { id: '1', title: 'Updated Task', description: 'Updated Description', checklist: null, dueDate: new Date().toISOString(), status: 'completed' };
            const token = 'fake-token';
            mockedApiClient.patch.mockRejectedValue(new Error('Network Error'));

            await expect(updateTask(request, token)).rejects.toThrow('Network Error');
        });
    });

    describe('deleteTask', () => {
        it('should return success message when API call is successful', async () => {
            const taskId = '1';
            const token = 'fake-token';
            mockedApiClient.delete.mockResolvedValue({ data: {} });

            const result = await deleteTask(taskId, token);

            expect(result).toEqual({});
            expect(mockedApiClient.delete).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(mockedApiClient.delete).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const taskId = '1';
            const token = 'fake-token';
            mockedApiClient.delete.mockRejectedValue(new Error('Network Error'));

            await expect(deleteTask(taskId, token)).rejects.toThrow('Network Error');
        });
    });

    describe('archiveTask', () => {
        it('should return success message when API call is successful', async () => {
            const taskId = '1';
            const token = 'fake-token';
            mockedApiClient.post.mockResolvedValue({ data: {} });

            const result = await archiveTask(taskId, token);

            expect(result).toEqual({});
            expect(mockedApiClient.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}/archive`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const taskId = '1';
            const token = 'fake-token';
            mockedApiClient.post.mockRejectedValue(new Error('Network Error'));

            await expect(archiveTask(taskId, token)).rejects.toThrow('Network Error');
        });
    });

    describe('unarchiveTask', () => {
        it('should return success message when API call is successful', async () => {
            const taskId = '1';
            const token = 'fake-token';
            mockedApiClient.post.mockResolvedValue({ data: {} });

            const result = await unarchiveTask(taskId, token);

            expect(result).toEqual({});
            expect(mockedApiClient.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}/unarchive`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const taskId = '1';
            const token = 'fake-token';
            mockedApiClient.post.mockRejectedValue(new Error('Network Error'));

            await expect(unarchiveTask(taskId, token)).rejects.toThrow('Network Error');
        });
    });

    describe('updateTaskStatus', () => {
        it('should return success message when API call is successful', async () => {
            const request = { id: '1', status: 'completed' };
            const token = 'fake-token';
            mockedApiClient.post.mockResolvedValue({ data: {} });

            const result = await updateTaskStatus(request, token);

            expect(result).toEqual({});
            expect(mockedApiClient.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}/tasks/${request.id}/status`, { status: request.status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const request = { id: '1', status: 'completed' };
            const token = 'fake-token';
            mockedApiClient.post.mockRejectedValue(new Error('Network Error'));

            await expect(updateTaskStatus(request, token)).rejects.toThrow('Network Error');
        });
    });
});
