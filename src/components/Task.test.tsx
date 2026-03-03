import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from './Task';
import type { Task as TaskType } from '../types';

describe('Task', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const mockTask: TaskType = {
    id: 'task-1',
    title: 'Test Task Title',
    description: 'Test task description',
    status: 'todo',
    createdAt: new Date().toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders task with title and description', () => {
    render(
      <Task
        task={mockTask}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByText('Test task description')).toBeInTheDocument();
  });

  it('renders task with title only when description is empty', () => {
    const taskWithoutDescription: TaskType = {
      ...mockTask,
      description: '',
    };

    render(
      <Task
        task={taskWithoutDescription}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.queryByText('Test task description')).not.toBeInTheDocument();
  });

  it('triggers onEdit callback when edit button is clicked', () => {
    render(
      <Task
        task={mockTask}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit task: Test Task Title/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('triggers onDelete callback when delete button is clicked', () => {
    render(
      <Task
        task={mockTask}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete task: Test Task Title/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('task-1');
  });

  it('has accessible button labels with task title', () => {
    render(
      <Task
        task={mockTask}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit task: Test Task Title/i });
    const deleteButton = screen.getByRole('button', { name: /Delete task: Test Task Title/i });

    expect(editButton).toHaveAttribute('aria-label', 'Edit task: Test Task Title');
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete task: Test Task Title');
  });

  it('renders as an article element for semantic HTML', () => {
    const { container } = render(
      <Task
        task={mockTask}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass('task-card');
  });

  it('renders task title as h3 element', () => {
    render(
      <Task
        task={mockTask}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const heading = screen.getByRole('heading', { level: 3, name: 'Test Task Title' });
    expect(heading).toBeInTheDocument();
  });

  it('does not call callbacks when task is rendered', () => {
    render(
      <Task
        task={mockTask}
        index={0}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(mockOnEdit).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
