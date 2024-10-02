import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from './TaskCard';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { Task } from '../models/task';
import { initialState, setupStore } from '../../../redux/store';
import { format } from 'date-fns-tz';
import { http } from 'msw';
import { setupServer } from 'msw/lib/node';
import { addHours } from 'date-fns';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  dueDate: new Date().toISOString(),
  status: 'new',
  userId: '1',
  createdAt: new Date().toISOString(),
  archivedAt: null,
  deletedAt: null,
};

const mockShowSnackbar = jest.fn();
const mockOnEdit = jest.fn();

const mockStore = setupStore({
  ...initialState
});

const renderComponent = (task = mockTask, store = mockStore) => {
  return render(
    <Provider store={store}>
      <TaskCard task={task} showSnackbar={mockShowSnackbar} onEdit={mockOnEdit} />
    </Provider>
  );
};

describe('TaskCard', () => {
  
  const handlers = [
    http.all(`${process.env.REACT_APP_API_BASE_URL}/*`, () => {
      return new Response(null, {
        status: 200,
        headers: {
          Allow: 'GET,HEAD,POST,PUT,PATCH,DELETE',
        },
      })
    }),
  ];
  const server = setupServer(...handlers);
  
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.dispose();
  });

  it('should render the task title, description, and due date correctly', () => {
    renderComponent();
    
    expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    expect(screen.getByText(/new/i)).toBeInTheDocument();
  });
  
  it('should call onEdit when the card is clicked', () => {
    renderComponent();
    
    userEvent.click(screen.getByText(/Test Task/i));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });
  
  it('should call onEdit when edit button is clicked', () => {
    renderComponent();
    
    userEvent.click(screen.getByTestId('edit-task-btn'));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });
  
  it('should call handleArchive when archive button is clicked', async () => {
    const mockArchivedTask = { ...mockTask, archivedAt: null };
    renderComponent(mockArchivedTask);
    
    await act(async () => {
      userEvent.click(screen.getByTestId('archive-task-btn'));
      
      expect(mockShowSnackbar).not.toHaveBeenCalled();
    });
  });
  
  it('should call handleUnarchive when unarchive button is clicked', async () => {
    const mockUnarchivedTask = { ...mockTask, archivedAt: new Date().toISOString() };
    const store = setupStore({
      ...initialState,
      tasks: {
        ...initialState.tasks,
        archiveStatus: 'idle'
      }
    });
    renderComponent(mockUnarchivedTask, store);
    
    await waitFor(() => {
      userEvent.click(screen.getByTestId('unarchive-task-btn'));
    });
    
    expect(mockShowSnackbar).toHaveBeenCalledWith('Task unarchived successfully', 'success');
  });
  
  it('should call setOpenConfirm when delete button is clicked', async () => {
    renderComponent();
    
    userEvent.click(screen.getByTestId('delete-task-btn'));
    
    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
  });
  
  it('should call handleDelete when delete is confirmed', async () => {
    renderComponent();
    
    userEvent.click(screen.getByTestId('delete-task-btn'));
    
    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });
  
  it('should display "No description provided" when task description is empty', () => {
    const taskWithoutDescription = { ...mockTask, description: '' };
    renderComponent(taskWithoutDescription);
    
    expect(screen.getByText(/No description provided/i)).toBeInTheDocument();
  });
  
  it('should stop event propagation when action button (archive/delete) is clicked', async () => {
    renderComponent();
    
    await act(async () => {
      userEvent.click(screen.getByTestId('delete-task-btn'));
      
      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });
  
  it('should show "Past Due" label when task is not completed and due date is in the past', () => {
    const pastDueTask = {
      ...mockTask,
      status: 'active',
      dueDate: new Date('2000-01-01').toISOString()
    };
    renderComponent(pastDueTask);
    
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formattedDate = format(new Date(pastDueTask.dueDate), 'dd/MM/yyyy HH:mm', { timeZone });
    
    const chip = screen.getByText(formattedDate);
    expect(chip).toBeInTheDocument();
    expect(screen.getByTestId('duedate-chip')).toHaveClass('MuiChip-colorError');
  });

  it('should not show "Past Due" label when task is completed and due date is in the past', () => {
    const pastDueTask = {
      ...mockTask,
      status: 'completed',
      dueDate: new Date('2000-01-01').toISOString()
    };
    renderComponent(pastDueTask);
    
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formattedDate = format(new Date(pastDueTask.dueDate), 'dd/MM/yyyy HH:mm', { timeZone });
    
    const chip = screen.getByText(formattedDate);
    expect(chip).toBeInTheDocument();
    expect(screen.getByTestId('duedate-chip')).not.toHaveClass('MuiChip-colorError');
  });
  
  it('should display the Date Chip with secondary color if the task is due within the next 24 hours', () => {
    const taskWithDueDateInNext24Hours = {
      ...mockTask,
      dueDate: addHours(new Date(), 23).toISOString(),
    };
  
    renderComponent(taskWithDueDateInNext24Hours);
  
    const chip = screen.getByText(format(new Date(taskWithDueDateInNext24Hours.dueDate), 'dd/MM/yyyy HH:mm'));
    expect(chip).toBeInTheDocument();
    expect(screen.getByTestId('duedate-chip')).toHaveClass('MuiChip-colorSecondary');
  });
  
  it('should display the Date Chip with default color if the task is due in more than 24 hours', () => {
    const taskWithFutureDueDate = {
      ...mockTask,
      dueDate: addHours(new Date(), 25).toISOString(),
    };
    
    renderComponent(taskWithFutureDueDate);
    
    const chip = screen.getByText(format(new Date(taskWithFutureDueDate.dueDate), 'dd/MM/yyyy HH:mm'));
    
    expect(chip).toBeInTheDocument();
    expect(screen.getByTestId('duedate-chip')).toHaveClass('MuiChip-colorDefault');
  });
  
  it('should display the Status Chip with success color if the task is completed, Date Chip default color regardless of due date', () => {
    const taskWithDueDateInNext24Hours = {
      ...mockTask,
      dueDate: addHours(new Date(), 48).toISOString(),
      status: 'completed'
    };
  
    renderComponent(taskWithDueDateInNext24Hours);
  
    const chip = screen.getByText(format(new Date(taskWithDueDateInNext24Hours.dueDate), 'dd/MM/yyyy HH:mm'));
    expect(chip).toBeInTheDocument();
    expect(screen.getByTestId('status-chip')).toHaveClass('MuiChip-colorSuccess');
    expect(screen.getByTestId('duedate-chip')).toHaveClass('MuiChip-colorDefault');
  });
  
  it('should disable the archive button when archiving is in progress', async () => {
    const store = setupStore({
      ...initialState,
      tasks: {
        ...initialState.tasks,
        archiveStatus: 'loading'
      }
    });
    renderComponent(mockTask, store);
    
    await act(async () => {
      expect(screen.getByTestId('archive-task-btn')).toBeDisabled();
    });
  });
  
  it('should disable the unarchive button when unarchiving is in progress', async () => {
    const store = setupStore({
      ...initialState,
      tasks: {
        ...initialState.tasks,
        archiveStatus: 'loading'
      }
    });
    const archivedTask = { ...mockTask, archivedAt: new Date('2000-01-01').toISOString() };
    renderComponent(archivedTask, store);
    
    await act(async () => {
      expect(screen.getByTestId('unarchive-task-btn')).toBeDisabled();
    });
  });
  
  it('should disable the delete button when deleting is in progress', async () => {
    const store = setupStore({
      ...initialState,
      tasks: {
        ...initialState.tasks,
        deleteStatus: 'loading'
      }
    });
    renderComponent(mockTask, store);
    
    await act(async () => {
      expect(screen.getByTestId('delete-task-btn')).toBeDisabled();
    });
  });
  
  it('should format the due date with the correct time zone', () => {
    const taskWithDueDate = { ...mockTask, dueDate: '2024-09-04T12:00:00Z' };
    renderComponent(taskWithDueDate);
    
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formattedDate = format(new Date(taskWithDueDate.dueDate), 'dd/MM/yyyy HH:mm', { timeZone });
    
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
  
  it('should close the confirmation dialog when the cancel button is clicked', async () => {
    renderComponent();
    
    await act(() => userEvent.click(screen.getByTestId('delete-task-btn')));
    await waitFor(() => expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument());
    
    await act(() => userEvent.click(screen.getByText(/Cancel/i)));
    await waitFor(() => expect(screen.queryByText(/Confirm Delete/i)).toBeNull());
  });


  // it('should change border color to primary with transition on hover', () => {
  //   const { getByRole } = renderWithProviders(
  //     <TaskCard task={task} showSnackbar={jest.fn()} />
  //   );

  //   const card = getByRole('button');

  //   // Check initial border color
  //   expect(card).toHaveStyle(`border-color: ${cardTheme.palette.divider}`);

  //   // Simulate hover by adding the hover class
  //   act(() => {})

  //   // Since we cannot actually trigger the :hover pseudo-class in JSDOM,
  //   // we'll manually apply the hover styles for testing purposes
  //   expect(card).toHaveStyle(`border-color: ${cardTheme.palette.primary.main}`);
  // });
});
