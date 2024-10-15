import {
    tasksReducer,
    reorderTasksLocally,
    initialState,
    fetchTasksAsync,
    createTaskAsync,
    updateTaskAsync,
    deleteTaskAsync,
    archiveTaskAsync,
    unarchiveTaskAsync,
    updateTaskStatusAsync
} from './tasksSlice';
import { AnyAction } from 'redux';
import { Task } from '../models/task';

const mockTask: Task = {
    id: '1',
    userId: 'userId',
    title: 'Task 1',
    description: '',
    dueDate: null,
    status: 'new',
    createdAt: new Date().toISOString(),
    archivedAt: null,
    deletedAt: null
};

const mockTasks: Task[] = [mockTask];

describe('tasksSlice', () => {
    let saveTasksSpy: jest.SpyInstance;
  
    beforeEach(() => {
      saveTasksSpy = jest.spyOn(require('./persistTasks'), 'saveTasksToLocalStorage');
    });

    it('should return the initial state', () => {
        expect(tasksReducer(undefined, {} as AnyAction)).toEqual(initialState);
    });
    
    it('should handle reorderTasksLocally action', () => {
        const initialTasks: Task[] = [
            { ...mockTask, status: 'active' },
            { ...mockTask, id: '2', status: 'completed' }
        ];
        const updatedTasks: Task[] = [
            { ...mockTask, status: 'completed' },
            { ...mockTask, id: '2', status: 'active' }
        ];
        const action = reorderTasksLocally({ updatedTasks });
        const state = tasksReducer({ ...initialState, tasks: initialTasks }, action);
        expect(state.tasks).toEqual(updatedTasks);
        expect(saveTasksSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle fetchTasksAsync.pending', () => {
        const action = { type: fetchTasksAsync.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.fetchStatus).toBe('loading');
    });
    
    it('should handle fetchTasksAsync.fulfilled', () => {
        const action = {
            type: fetchTasksAsync.fulfilled.type,
            meta: {
                arg: {
                    page: 1
                }
            },
            payload: {
                totalItems: 1,
                totalPages: 1,
                currentPage: 1,
                items: mockTasks
            }
        };
        const state = tasksReducer(initialState, action);
        expect(state.fetchStatus).toBe('succeeded');
        expect(state.tasks).toEqual(mockTasks);
        expect(saveTasksSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle fetchTasksAsync.rejected and set fixed error message', () => {
        const action = { type: fetchTasksAsync.rejected.type, error: { message: 'Fetch failed' } };
        const state = tasksReducer(initialState, action);
        expect(state.fetchStatus).toBe('failed');
        expect(state.fetchError).toBe('Failed to load tasks.');
        expect(state.hasMore).toBe(false);
        expect(saveTasksSpy).toHaveBeenCalledTimes(0);
    });
    
    it('should handle createTaskAsync.pending', () => {
        const action = { type: createTaskAsync.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.createStatus).toBe('loading');
    });
    
    it('should handle createTaskAsync.fulfilled', () => {
        const action = { type: createTaskAsync.fulfilled.type, payload: mockTask };
        const state = tasksReducer(initialState, action);
        expect(state.createStatus).toBe('succeeded');
        expect(state.tasks).toEqual([mockTask]);
        expect(saveTasksSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle createTaskAsync.rejected', () => {
        const action = { type: createTaskAsync.rejected.type, error: { message: 'Create failed' } };
        const state = tasksReducer(initialState, action);
        expect(state.createStatus).toBe('failed');
        expect(state.createError).toBe('Create failed');
        expect(saveTasksSpy).toHaveBeenCalledTimes(0);
    });
    
    it('should handle updateTaskAsync.pending', () => {
        const action = { type: updateTaskAsync.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.updateStatus).toBe('loading');
    });
    
    it('should handle updateTaskAsync.fulfilled', () => {
        const initialTasks: Task[] = [mockTask];
        const updatedTask = { ...mockTask, title: 'Updated Task 1', status: 'completed' };
        const action = { type: updateTaskAsync.fulfilled.type, payload: updatedTask };
        const state = tasksReducer({ ...initialState, tasks: initialTasks }, action);
        expect(state.updateStatus).toBe('succeeded');
        expect(state.tasks[0]).toEqual(updatedTask);
        expect(saveTasksSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle updateTaskAsync.rejected', () => {
        const action = { type: updateTaskAsync.rejected.type, error: { message: 'Update failed' } };
        const state = tasksReducer(initialState, action);
        expect(state.updateStatus).toBe('failed');
        expect(state.updateError).toBe('Update failed');
        expect(saveTasksSpy).toHaveBeenCalledTimes(0);
    });
    
    it('should handle deleteTaskAsync.pending', () => {
        const action = { type: deleteTaskAsync.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.deleteStatus).toBe('loading');
    });
    
    it('should handle deleteTaskAsync.fulfilled', () => {
        const initialTasks: Task[] = [mockTask, { ...mockTask, id: '2' }];
        const action = { type: deleteTaskAsync.fulfilled.type, payload: '1' };
        const state = tasksReducer({ ...initialState, tasks: initialTasks }, action);
        expect(state.deleteStatus).toBe('succeeded');
        expect(state.tasks.find(task => task.id === '1')?.deletedAt).toBeDefined();
        expect(saveTasksSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle deleteTaskAsync.rejected', () => {
        const action = { type: deleteTaskAsync.rejected.type, error: { message: 'Delete failed' } };
        const state = tasksReducer(initialState, action);
        expect(state.deleteStatus).toBe('failed');
        expect(state.deleteError).toBe('Delete failed');
        expect(saveTasksSpy).toHaveBeenCalledTimes(0);
    });
    
    it('should handle archiveTaskAsync.pending', () => {
        const action = { type: archiveTaskAsync.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.archiveStatus).toBe('loading');
    });
    
    it('should handle archiveTaskAsync.fulfilled', () => {
        const initialTasks: Task[] = [mockTask];
        const action = { type: archiveTaskAsync.fulfilled.type, payload: '1' };
        const state = tasksReducer({ ...initialState, tasks: initialTasks }, action);
        expect(state.archiveStatus).toBe('succeeded');
        expect(state.tasks[0].archivedAt).toBeDefined();
        expect(saveTasksSpy).toHaveBeenCalledTimes(1);
    });
    
    it('should handle archiveTaskAsync.rejected', () => {
        const action = { type: archiveTaskAsync.rejected.type, error: { message: 'Archive failed' } };
        const state = tasksReducer(initialState, action);
        expect(state.archiveStatus).toBe('failed');
        expect(state.archiveError).toBe('Archive failed');
        expect(saveTasksSpy).toHaveBeenCalledTimes(0);
    });
    
    it('should handle unarchiveTaskAsync.pending', () => {
        const action = { type: unarchiveTaskAsync.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.archiveStatus).toBe('loading');
    });
    
    it('should handle unarchiveTaskAsync.fulfilled', () => {
        const initialTasks: Task[] = [{ ...mockTask, archivedAt: '2024-01-01T00:00:00Z' }];
        const action = { type: unarchiveTaskAsync.fulfilled.type, payload: '1' };
        const state = tasksReducer({ ...initialState, tasks: initialTasks }, action);
        expect(state.archiveStatus).toBe('succeeded');
        expect(state.tasks[0].archivedAt).toBeNull();
    });
    
    it('should handle unarchiveTaskAsync.rejected', () => {
        const action = { type: unarchiveTaskAsync.rejected.type, error: { message: 'Unarchive failed' } };
        const state = tasksReducer(initialState, action);
        expect(state.archiveStatus).toBe('failed');
        expect(state.archiveError).toBe('Unarchive failed');
    });
    
    it('should handle updateTaskStatusAsync.pending', () => {
        const action = { type: updateTaskStatusAsync.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.updateStatus).toBe('loading');
    });
    
    it('should handle updateTaskStatusAsync.fulfilled', () => {
        const initialTasks: Task[] = [mockTask];
        const updatedTask = { ...mockTask, status: 'completed' };
        const action = { type: updateTaskStatusAsync.fulfilled.type, payload: updatedTask };
        const state = tasksReducer({ ...initialState, tasks: initialTasks }, action);
        expect(state.updateStatus).toBe('succeeded');
        expect(state.tasks[0]).toEqual(updatedTask);
    });
    
    it('should handle updateTaskStatusAsync.rejected', () => {
        const action = { type: updateTaskStatusAsync.rejected.type, error: { message: 'Status update failed' } };
        const state = tasksReducer(initialState, action);
        expect(state.updateStatus).toBe('failed');
        expect(state.updateError).toBe('Status update failed');
    });
    
    it('should handle reorderTasksLocally with empty tasks array', () => {
        const updatedTasks: Task[] = [];
        const action = reorderTasksLocally({ updatedTasks });
        const state = tasksReducer({ ...initialState, tasks: mockTasks }, action);
        expect(state.tasks).toEqual(updatedTasks);
    });
    
    it('should handle reorderTasksLocally with single task array', () => {
        const singleTask: Task[] = [{ ...mockTask, id: '2' }];
        const action = reorderTasksLocally({ updatedTasks: singleTask });
        const state = tasksReducer({ ...initialState, tasks: mockTasks }, action);
        expect(state.tasks).toEqual(singleTask);
    });
    
    it('should handle fetchTasksAsync.pending when state has an error', () => {
        const action = { type: fetchTasksAsync.pending.type };
        const state = tasksReducer({ ...initialState, fetchStatus: 'failed', fetchError: 'Previous error' }, action);
        expect(state.fetchStatus).toBe('loading');
        expect(state.fetchError).toBeNull();
    });
    
    it('should handle fetchTasksAsync.fulfilled with an empty payload', () => {
        const action = {
            type: fetchTasksAsync.fulfilled.type,
            meta: {
                arg: {
                    page: 1
                }
            },
            payload: []
        };
        const state = tasksReducer(initialState, action);
        expect(state.fetchStatus).toBe('succeeded');
        expect(state.tasks).toEqual([]);
    });
    
    it('should handle fetchTasksAsync.rejected with an unexpected error structure', () => {
        const action = { type: fetchTasksAsync.rejected.type, error: { message: null } };
        const state = tasksReducer(initialState, action);
        expect(state.fetchStatus).toBe('failed');
        expect(state.fetchError).toBe('Failed to load tasks.');
    });
    
    it('should handle createTaskAsync.fulfilled with existing tasks', () => {
        const newTask = { ...mockTask, id: '2' };
        const action = { type: createTaskAsync.fulfilled.type, payload: newTask };
        const state = tasksReducer({ ...initialState, tasks: mockTasks }, action);
        expect(state.createStatus).toBe('succeeded');
        expect(state.tasks).toContain(newTask);
    });
    
    it('should handle updateTaskAsync.fulfilled with a non-existing task ID', () => {
        const updatedTask = { id: 'non-existing', title: 'Updated Task', status: 'completed' };
        const action = { type: updateTaskAsync.fulfilled.type, payload: updatedTask };
        const state = tasksReducer({ ...initialState, tasks: mockTasks }, action);
        expect(state.updateStatus).toBe('succeeded');
        expect(state.tasks).toEqual(mockTasks);
    });
    
    it('should handle deleteTaskAsync.fulfilled with non-existing task ID', () => {
        const action = { type: deleteTaskAsync.fulfilled.type, payload: 'non-existing-id' };
        const state = tasksReducer({ ...initialState, tasks: mockTasks }, action);
        expect(state.deleteStatus).toBe('succeeded');
        expect(state.tasks).toEqual(mockTasks);
    });
    
    it('should handle archiveTaskAsync.fulfilled with a task already archived', () => {
        const archivedTask = { ...mockTask, archivedAt: '2024-01-01T00:00:00Z' };
        const action = { type: archiveTaskAsync.fulfilled.type, payload: '1' };
        const state = tasksReducer({ ...initialState, tasks: [archivedTask] }, action);
        expect(state.archiveStatus).toBe('succeeded');
    });
    
    it('should handle unarchiveTaskAsync.fulfilled with a task already unarchived', () => {
        const unarchivedTask = { ...mockTask, archivedAt: null };
        const action = { type: unarchiveTaskAsync.fulfilled.type, payload: '1' };
        const state = tasksReducer({ ...initialState, tasks: [unarchivedTask] }, action);
        expect(state.archiveStatus).toBe('succeeded');
        expect(state.tasks[0].archivedAt).toBeNull();
    });
    
    it('should handle updateTaskStatusAsync.fulfilled with an unexpected status', () => {
        const updatedTask = { ...mockTask, status: 'unexpected-status' };
        const action = { type: updateTaskStatusAsync.fulfilled.type, payload: updatedTask };
        const state = tasksReducer({ ...initialState, tasks: mockTasks }, action);
        expect(state.updateStatus).toBe('succeeded');
        expect(state.tasks[0].status).toEqual('unexpected-status');
    });
    
    it('should not mutate the state directly', () => {
        const initialStateCopy = { ...initialState, tasks: mockTasks };
        const action = reorderTasksLocally({ updatedTasks: [] });
        const newState = tasksReducer(initialStateCopy, action);
        expect(newState).not.toBe(initialStateCopy);
        expect(newState.tasks).not.toBe(initialStateCopy.tasks);
    });


    describe('fetchTasksAsync.fulfilled merge logic', () => {
        let saveTasksSpy: jest.SpyInstance;
    
        beforeEach(() => {
            saveTasksSpy = jest.spyOn(require('./persistTasks'), 'saveTasksToLocalStorage');
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        const existingTask1: Task = {
            id: '1',
            userId: 'userId',
            title: 'Existing Task 1',
            description: '',
            dueDate: null,
            status: 'new',
            createdAt: new Date().toISOString(),
            archivedAt: null,
            deletedAt: null,
        };
    
        const existingTask2: Task = {
            id: '2',
            userId: 'userId',
            title: 'Existing Task 2',
            description: '',
            dueDate: null,
            status: 'in-progress',
            createdAt: new Date().toISOString(),
            archivedAt: null,
            deletedAt: null,
        };
    
        const updatedTask1: Task = {
            ...existingTask1,
            title: 'Updated Task 1',
            status: 'completed',
        };
    
        const newTask3: Task = {
            id: '3',
            userId: 'userId',
            title: 'New Task 3',
            description: '',
            dueDate: null,
            status: 'new',
            createdAt: new Date().toISOString(),
            archivedAt: null,
            deletedAt: null,
        };
    
        it('should replace tasks when page is 1', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1, existingTask2],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 1,
                    limit: 20,
                },
                },
                payload: {
                items: [newTask3],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([newTask3]);
            expect(state.hasMore).toBe(false);
            expect(saveTasksSpy).toHaveBeenCalledWith([newTask3]);
        });
    
        it('should update existing tasks and append new tasks when page > 1', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1, existingTask2],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 2,
                    limit: 20,
                },
                },
                payload: {
                items: [updatedTask1, newTask3],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([updatedTask1, existingTask2, newTask3]);
            expect(state.hasMore).toBe(false);
            expect(saveTasksSpy).toHaveBeenCalledWith([updatedTask1, existingTask2, newTask3]);
        });
    
        it('should append new tasks without updating when no IDs match', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 2,
                    limit: 20,
                },
                },
                payload: {
                items: [newTask3],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([existingTask1, newTask3]);
            expect(state.hasMore).toBe(false);
            expect(saveTasksSpy).toHaveBeenCalledWith([existingTask1, newTask3]);
        });
    
        it('should not duplicate tasks when merging', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 2,
                    limit: 20,
                },
                },
                payload: {
                items: [existingTask1, newTask3],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([existingTask1, newTask3]);
            expect(state.tasks.length).toBe(2);
            expect(saveTasksSpy).toHaveBeenCalledWith([existingTask1, newTask3]);
        });
    
        it('should handle empty incomingTasks gracefully', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 2,
                    limit: 20,
                },
                },
                payload: {
                items: [],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([existingTask1]);
            expect(state.hasMore).toBe(false);
            expect(saveTasksSpy).toHaveBeenCalledWith([existingTask1]);
        });
    
        it('should correctly set hasMore based on the payload', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 1,
                    limit: 1,
                },
                },
                payload: {
                items: [existingTask1],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([existingTask1]);
            expect(state.hasMore).toBe(true); // Because items length equals limit
            });
        
            it('should handle incoming tasks that are all updates to existing tasks', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1, existingTask2],
            };
        
            const updatedTask2 = {
                ...existingTask2,
                title: 'Updated Task 2',
                status: 'completed',
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 2,
                    limit: 20,
                },
                },
                payload: {
                items: [updatedTask1, updatedTask2],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([updatedTask1, updatedTask2]);
            expect(state.tasks.length).toBe(2);
            expect(saveTasksSpy).toHaveBeenCalledWith([updatedTask1, updatedTask2]);
        });
    
        it('should not mutate the original state', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 2,
                    limit: 20,
                },
                },
                payload: {
                items: [updatedTask1],
                },
            };
        
            const prevState = { ...initialTasksState };
            const state = tasksReducer(initialTasksState, action);
        
            expect(state).not.toBe(initialTasksState);
            expect(state.tasks).not.toBe(initialTasksState.tasks);
            expect(state.tasks).toEqual([updatedTask1]);
            expect(saveTasksSpy).toHaveBeenCalledWith([updatedTask1]);
        });
    
        it('should correctly handle tasks with identical IDs but different content', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [existingTask1],
            };
        
            const conflictingTask = {
                id: '1',
                userId: 'userId',
                title: 'Conflicting Task',
                description: 'Different content',
                dueDate: null,
                status: 'in-progress',
                createdAt: new Date().toISOString(),
                archivedAt: null,
                deletedAt: null,
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 2,
                    limit: 20,
                },
                },
                payload: {
                items: [conflictingTask],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([conflictingTask]);
            expect(saveTasksSpy).toHaveBeenCalledWith([conflictingTask]);
        });
    
        it('should correctly merge when initial state is empty', () => {
            const initialTasksState = {
                ...initialState,
                tasks: [],
            };
        
            const action = {
                type: fetchTasksAsync.fulfilled.type,
                meta: {
                arg: {
                    page: 1,
                    limit: 20,
                },
                },
                payload: {
                items: [existingTask1, existingTask2],
                },
            };
        
            const state = tasksReducer(initialTasksState, action);
        
            expect(state.tasks).toEqual([existingTask1, existingTask2]);
            expect(state.tasks.length).toBe(2);
            expect(saveTasksSpy).toHaveBeenCalledWith([existingTask1, existingTask2]);
        });
    });
});
