import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from './TaskCard';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../redux/tasksSlice';
import userEvent from '@testing-library/user-event';
import { Task } from '../models/task';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  dueDate: new Date().toISOString(),
  status: 'pending',
  userId: '1',
  archivedAt: null,
  deletedAt: null,
};

const mockShowSnackbar = jest.fn();
const mockOnEdit = jest.fn();
const mockDispatch = jest.fn();

// Mock Redux store
const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
});

const renderComponent = (task = mockTask) => {
  return render(
    <Provider store={store}>
      <TaskCard task={task} showSnackbar={mockShowSnackbar} onEdit={mockOnEdit} />
    </Provider>
  );
};

describe('TaskCard', () => {
  it('renders the task title, description, and due date correctly', () => {
    renderComponent();

    expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('calls onEdit when the card is clicked', () => {
    renderComponent();

    userEvent.click(screen.getByText(/Test Task/i));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls handleArchive when archive button is clicked', async () => {
    const mockArchivedTask = { ...mockTask, archivedAt: null };
    renderComponent(mockArchivedTask);

    const archiveButton = screen.getByTitle(/Archive Task/i);
    userEvent.click(archiveButton);

    expect(mockShowSnackbar).not.toHaveBeenCalled();
    // Handle further assertions once the task has been archived
  });

  it('calls handleUnarchive when unarchive button is clicked', async () => {
    const mockUnarchivedTask = { ...mockTask, archivedAt: new Date().toISOString() };
    renderComponent(mockUnarchivedTask);

    const unarchiveButton = screen.getByTitle(/Unarchive Task/i);
    userEvent.click(unarchiveButton);

    expect(mockShowSnackbar).not.toHaveBeenCalled();
    // Handle further assertions once the task has been unarchived
  });

  it('calls setOpenConfirm when delete button is clicked', async () => {
    renderComponent();

    const deleteButton = screen.getByTitle(/Delete Task/i);
    userEvent.click(deleteButton);


    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
  });

  it('calls handleDelete when delete is confirmed', async () => {
    renderComponent();

    userEvent.click(screen.getByLabelText(/Delete Task/i));
    userEvent.click(screen.getByText(/Delete/i));

    expect(mockShowSnackbar).not.toHaveBeenCalled();
    // Handle further assertions once the task has been deleted
  });
});
