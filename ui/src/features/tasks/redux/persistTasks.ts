import { Task } from "../models/task";

/**
 * Loads tasks from Local Storage.
 * @returns An array of Task objects or undefined if not found.
 */
export const loadTasksFromLocalStorage = (): Task[] | undefined => {
  try {
    const serializedTasks = localStorage.getItem('tasks');
    if (serializedTasks === null) {
      return undefined;
    }
    return JSON.parse(serializedTasks) as Task[];
  } catch (error) {
    console.error('Error loading tasks from Local Storage:', error);
    return undefined;
  }
};

/**
 * Saves tasks to Local Storage.
 * @param tasks - An array of Task objects to be saved.
 */
export const saveTasksToLocalStorage = (tasks: Task[]): void => {
  try {
    const serializedTasks = JSON.stringify(tasks);
    localStorage.setItem('tasks', serializedTasks);
  } catch (error) {
    console.error('Error saving tasks to Local Storage:', error);
  }
};
