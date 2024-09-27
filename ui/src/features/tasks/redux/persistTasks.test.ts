import { loadTasksFromLocalStorage, saveTasksToLocalStorage } from './persistTasks';
import { Task } from '../models/task';

const sampleTasks: Task[] = [
    {
        id: '1',
        title: 'Task 1',
        description: 'Description for Task 1',
        status: 'new',
        createdAt: '2023-10-01T11:00:00Z',
        archivedAt: null,
        deletedAt: null,
        userId: 'userId',
        dueDate: null,
    },
    {
        id: '2',
        title: 'Task 2',
        description: 'Description for Task 2',
        status: 'completed',
        createdAt: '2023-10-01T11:00:00Z',
        archivedAt: '2023-10-01T12:00:00Z',
        deletedAt: null,
        userId: 'userId',
        dueDate: null,
    },
];

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

describe('loadTasksFromLocalStorage', () => {
    it('should return undefined when "tasks" key is not present in localStorage', () => {
        localStorage.removeItem('tasks');
        
        const result = loadTasksFromLocalStorage();
        expect(result).toBeUndefined();
    });
    
    it('should return an array of Task objects when "tasks" key contains valid JSON', () => {
        localStorage.setItem('tasks', JSON.stringify(sampleTasks));
        
        const result = loadTasksFromLocalStorage();
        expect(result).toEqual(sampleTasks);
    });
    
    it('should return undefined and log an error when "tasks" key contains invalid JSON', () => {
        localStorage.setItem('tasks', 'invalid-json');
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        const result = loadTasksFromLocalStorage();
        expect(result).toBeUndefined();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error loading tasks from Local Storage:',
            expect.any(SyntaxError)
        );
        
        consoleErrorSpy.mockRestore();
    });
});

describe('saveTasksToLocalStorage', () => {
    it('should save tasks to localStorage as a JSON string', () => {
        saveTasksToLocalStorage(sampleTasks);
        
        const storedTasks = localStorage.getItem('tasks');
        expect(storedTasks).toEqual(JSON.stringify(sampleTasks));
    });
    
    it('should log an error when JSON.stringify throws an error', () => {
        const circularTask: any = {};
        circularTask.self = circularTask; // Create a circular reference to cause JSON.stringify to throw
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        saveTasksToLocalStorage([circularTask]);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error saving tasks to Local Storage:',
            expect.any(TypeError)
        );
        
        const storedTasks = localStorage.getItem('tasks');
        expect(storedTasks).toBeNull();
        
        consoleErrorSpy.mockRestore();
    });
});
