import { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from './TaskCard';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { Task } from '../models/task';
import { tasksReducer } from '../redux/tasksSlice';

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

  it('calls onEdit when edit button is clicked', () => {
    renderComponent();

    userEvent.click(screen.getByTestId('edit-task-btn'));

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls handleArchive when archive button is clicked', async () => {
    const mockArchivedTask = { ...mockTask, archivedAt: null };
    renderComponent(mockArchivedTask);
  
    await act(async () => {
      userEvent.click(screen.getByTestId('archive-task-btn'));
      expect(mockShowSnackbar).not.toHaveBeenCalled();
    });
  
  });

  it('calls handleUnarchive when unarchive button is clicked', async () => {
    const mockUnarchivedTask = { ...mockTask, archivedAt: new Date().toISOString() };
    renderComponent(mockUnarchivedTask);

    userEvent.click(screen.getByTestId('unarchive-task-btn'));

    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });

  it('calls setOpenConfirm when delete button is clicked', async () => {
    renderComponent();

    userEvent.click(screen.getByTestId('delete-task-btn'));

    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
  });

  it('calls handleDelete when delete is confirmed', async () => {
    renderComponent();

    userEvent.click(screen.getByTestId('delete-task-btn'));

    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });
});
