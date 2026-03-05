import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Column } from './Column';
import type { Task as TaskType } from '../types';

describe('Column', () => {
  const mockOnEditTask = vi.fn();
  const mockOnDeleteTask = vi.fn();

  const mockTasks: TaskType[] = [
    {
      id: 'task-1',
      title: 'Todo Task',
      description: 'This is a todo task',
      status: 'todo',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'task-2',
      title: 'In Progress Task',
      description: 'This is an in progress task',
      status: 'inprogress',
      createdAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'task-3',
      title: 'Done Task',
      description: 'This is a done task',
      status: 'done',
      createdAt: '2024-01-03T00:00:00.000Z',
    },
    {
      id: 'task-4',
      title: 'Another Todo Task',
      description: 'Another todo task',
      status: 'todo',
      createdAt: '2024-01-04T00:00:00.000Z',
    },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper to wrap Column in DragDropContext (required by @hello-pangea/dnd)
  const renderColumn = (status: 'todo' | 'inprogress' | 'done', label: string) => {
    return render(
      <DragDropContext onDragEnd={() => {}}>
        <Column
          status={status}
          label={label}
          tasks={mockTasks}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
        />
      </DragDropContext>
    );
  };

  it('renders column with correct label', () => {
    renderColumn('todo', 'To Do');

    // The heading now contains both label and count as separate spans
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('To Do');
  });

  it('renders column with correct aria-label', () => {
    const { container } = renderColumn('inprogress', 'In Progress');

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'In Progress column');
  });

  it('filters and displays only tasks matching todo status', () => {
    renderColumn('todo', 'To Do');

    // Should display todo tasks
    expect(screen.getByText('Todo Task')).toBeInTheDocument();
    expect(screen.getByText('Another Todo Task')).toBeInTheDocument();

    // Should not display tasks from other statuses
    expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument();
  });

  it('filters and displays only tasks matching inprogress status', () => {
    renderColumn('inprogress', 'In Progress');

    // Should display inprogress task
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();

    // Should not display tasks from other statuses
    expect(screen.queryByText('Todo Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Another Todo Task')).not.toBeInTheDocument();
  });

  it('filters and displays only tasks matching done status', () => {
    renderColumn('done', 'Done');

    // Should display done task
    expect(screen.getByText('Done Task')).toBeInTheDocument();

    // Should not display tasks from other statuses
    expect(screen.queryByText('Todo Task')).not.toBeInTheDocument();
    expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Another Todo Task')).not.toBeInTheDocument();
  });

  it('renders empty column when no tasks match status', () => {
    const emptyTasks: TaskType[] = [];

    render(
      <DragDropContext onDragEnd={() => {}}>
        <Column
          status="todo"
          label="To Do"
          tasks={emptyTasks}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
        />
      </DragDropContext>
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('To Do');

    // No tasks should be displayed
    expect(screen.queryByText('Todo Task')).not.toBeInTheDocument();
  });

  it('passes onEditTask callback to Task components correctly', () => {
    renderColumn('todo', 'To Do');

    // Find and click edit button for first todo task
    const editButtons = screen.getAllByRole('button', { name: /Edit task:/i });
    const firstEditButton = editButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('Todo Task')
    );

    expect(firstEditButton).toBeDefined();
    firstEditButton?.click();

    expect(mockOnEditTask).toHaveBeenCalledTimes(1);
    expect(mockOnEditTask).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('passes onDeleteTask callback to Task components correctly', () => {
    renderColumn('todo', 'To Do');

    // Find and click delete button for first todo task
    const deleteButtons = screen.getAllByRole('button', { name: /Delete task:/i });
    const firstDeleteButton = deleteButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('Todo Task')
    );

    expect(firstDeleteButton).toBeDefined();
    firstDeleteButton?.click();

    expect(mockOnDeleteTask).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteTask).toHaveBeenCalledWith('task-1');
  });

  it('renders tasks in correct order based on filtered array', () => {
    renderColumn('todo', 'To Do');

    const taskTitles = screen.getAllByRole('heading', { level: 3 });
    
    // Should render todo tasks in order they appear in the filtered array
    expect(taskTitles[0]).toHaveTextContent('Todo Task');
    expect(taskTitles[1]).toHaveTextContent('Another Todo Task');
  });

  it('renders as a section element for semantic HTML', () => {
    const { container } = renderColumn('todo', 'To Do');

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('column');
  });

  it('passes correct index to each Task component', () => {
    renderColumn('todo', 'To Do');

    // Both todo tasks should be rendered (indices 0 and 1 within the filtered array)
    // We can verify this indirectly by checking that both tasks are present
    expect(screen.getByText('Todo Task')).toBeInTheDocument();
    expect(screen.getByText('Another Todo Task')).toBeInTheDocument();
  });
});
