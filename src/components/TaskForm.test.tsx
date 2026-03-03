import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskForm } from './TaskForm';
import type { Task } from '../types';

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    createdAt: new Date().toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders create mode with empty fields', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task title/i)).toHaveValue('');
    expect(screen.getByLabelText(/Task description/i)).toHaveValue('');
  });

  it('renders edit mode with existing task values', () => {
    render(<TaskForm task={mockTask} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task title/i)).toHaveValue('Test Task');
    expect(screen.getByLabelText(/Task description/i)).toHaveValue('Test Description');
  });

  it('displays validation error for empty title', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByRole('button', { name: /Create task/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays validation error for title exceeding 200 characters', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const titleInput = screen.getByLabelText(/Task title/i);
    const longTitle = 'a'.repeat(201);
    fireEvent.change(titleInput, { target: { value: longTitle } });
    
    const submitButton = screen.getByRole('button', { name: /Create task/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Title must be 200 characters or less')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('displays validation error for description exceeding 200 characters', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const titleInput = screen.getByLabelText(/Task title/i);
    const descriptionInput = screen.getByLabelText(/Task description/i);
    const longDescription = 'a'.repeat(201);
    
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.change(descriptionInput, { target: { value: longDescription } });
    
    const submitButton = screen.getByRole('button', { name: /Create task/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Description must be 200 characters or less')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with trimmed values on valid submission', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const titleInput = screen.getByLabelText(/Task title/i);
    const descriptionInput = screen.getByLabelText(/Task description/i);
    
    fireEvent.change(titleInput, { target: { value: '  Valid Title  ' } });
    fireEvent.change(descriptionInput, { target: { value: '  Valid Description  ' } });
    
    const submitButton = screen.getByRole('button', { name: /Create task/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Valid Title', 'Valid Description');
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('closes modal on Escape key press', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('includes aria-label attributes for all inputs', () => {
    render(<TaskForm task={null} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/Task title/i)).toHaveAttribute('aria-label', 'Task title');
    expect(screen.getByLabelText(/Task description/i)).toHaveAttribute('aria-label', 'Task description');
  });
});
