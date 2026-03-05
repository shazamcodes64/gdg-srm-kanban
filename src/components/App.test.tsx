import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from './App';
import type { BoardState } from '../types';

describe('App Integration Tests', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    // Mock crypto.randomUUID
    if (!global.crypto) {
      Object.defineProperty(global, 'crypto', {
        value: {},
        writable: true,
        configurable: true,
      });
    }
    
    global.crypto.randomUUID = vi.fn(() => `test-uuid-${Math.random()}`);
    
    // Mock window.confirm to always return true
    global.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Creation Flow', () => {
    it('creates a task and displays it in To Do column', async () => {
      render(<App />);

      // Open create task form
      const createButton = screen.getByRole('button', { name: /Create new task/i });
      fireEvent.click(createButton);

      // Wait for lazy-loaded TaskForm
      await waitFor(() => {
        expect(screen.getByLabelText(/Task title/i)).toBeInTheDocument();
      });

      // Fill in form
      const titleInput = screen.getByLabelText(/Task title/i);
      const descriptionInput = screen.getByLabelText(/Task description/i);
      
      fireEvent.change(titleInput, { target: { value: 'New Test Task' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(submitButton);

      // Verify task appears in To Do column
      await waitFor(() => {
        expect(screen.getByText('New Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
      });

      // Verify task is in To Do column
      const todoColumn = screen.getByText('To Do').closest('section');
      expect(todoColumn).toContainElement(screen.getByText('New Test Task'));
    });

    it('saves task to LocalStorage after creation', async () => {
      render(<App />);

      // Create a task
      const createButton = screen.getByRole('button', { name: /Create new task/i });
      fireEvent.click(createButton);

      // Wait for lazy-loaded TaskForm
      await waitFor(() => {
        expect(screen.getByLabelText(/Task title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Task title/i);
      fireEvent.change(titleInput, { target: { value: 'Task to Save' } });

      const submitButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(submitButton);

      // Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText('Task to Save')).toBeInTheDocument();
      });

      // Verify localStorage.setItem was called
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'kanban-board-state',
          expect.stringContaining('Task to Save')
        );
      });

      // Verify saved data structure
      const savedData = localStorageMock['kanban-board-state'];
      expect(savedData).toBeDefined();
      
      const parsedData: BoardState = JSON.parse(savedData);
      expect(parsedData.tasks).toHaveLength(1);
      expect(parsedData.tasks[0].title).toBe('Task to Save');
      expect(parsedData.tasks[0].status).toBe('todo');
    });
  });

  describe('Task Editing Flow', () => {
    it('edits a task and updates it on the board', async () => {
      // Pre-populate localStorage with a task
      const initialState: BoardState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Original Title',
            description: 'Original description',
            status: 'todo',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      localStorageMock['kanban-board-state'] = JSON.stringify(initialState);

      render(<App />);

      // Wait for task to load
      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByRole('button', { name: /Edit task: Original Title/i });
      fireEvent.click(editButton);

      // Modify task - use more specific selectors
      const titleInput = screen.getByRole('textbox', { name: /Task title/i });
      const descriptionInput = screen.getByRole('textbox', { name: /Task description/i });
      
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

      // Save changes
      const saveButton = screen.getByRole('button', { name: /Save changes/i });
      fireEvent.click(saveButton);

      // Verify task is updated
      await waitFor(() => {
        expect(screen.getByText('Updated Title')).toBeInTheDocument();
        expect(screen.getByText('Updated description')).toBeInTheDocument();
        expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
      });
    });

    it('saves edited task to LocalStorage', async () => {
      const initialState: BoardState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Task to Edit',
            description: 'Original',
            status: 'todo',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      localStorageMock['kanban-board-state'] = JSON.stringify(initialState);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task to Edit')).toBeInTheDocument();
      });

      // Edit task
      const editButton = screen.getByRole('button', { name: /Edit task: Task to Edit/i });
      fireEvent.click(editButton);

      const titleInput = screen.getByRole('textbox', { name: /Task title/i });
      fireEvent.change(titleInput, { target: { value: 'Edited Task' } });

      const saveButton = screen.getByRole('button', { name: /Save changes/i });
      fireEvent.click(saveButton);

      // Verify localStorage was updated
      await waitFor(() => {
        const savedData = localStorageMock['kanban-board-state'];
        const parsedData: BoardState = JSON.parse(savedData);
        expect(parsedData.tasks[0].title).toBe('Edited Task');
      });
    });
  });

  describe('Task Deletion Flow', () => {
    it('deletes a task and removes it from the board', async () => {
      const initialState: BoardState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Task to Delete',
            description: 'Will be deleted',
            status: 'todo',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      localStorageMock['kanban-board-state'] = JSON.stringify(initialState);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task to Delete')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /Delete task: Task to Delete/i });
      fireEvent.click(deleteButton);

      // Verify task is removed
      await waitFor(() => {
        expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
      });
    });

    it('updates LocalStorage after task deletion', async () => {
      const initialState: BoardState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Task 1',
            description: '',
            status: 'todo',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'task-2',
            title: 'Task 2',
            description: '',
            status: 'todo',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      localStorageMock['kanban-board-state'] = JSON.stringify(initialState);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Delete first task
      const deleteButton = screen.getByRole('button', { name: /Delete task: Task 1/i });
      fireEvent.click(deleteButton);

      // Verify localStorage was updated
      await waitFor(() => {
        const savedData = localStorageMock['kanban-board-state'];
        const parsedData: BoardState = JSON.parse(savedData);
        expect(parsedData.tasks).toHaveLength(1);
        expect(parsedData.tasks[0].title).toBe('Task 2');
      });
    });
  });

  describe('LocalStorage Load on Mount', () => {
    it('restores tasks from LocalStorage on mount', async () => {
      const savedState: BoardState = {
        tasks: [
          {
            id: 'task-1',
            title: 'Saved Task 1',
            description: 'Description 1',
            status: 'todo',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'task-2',
            title: 'Saved Task 2',
            description: 'Description 2',
            status: 'inprogress',
            createdAt: '2024-01-02T00:00:00.000Z',
          },
          {
            id: 'task-3',
            title: 'Saved Task 3',
            description: 'Description 3',
            status: 'done',
            createdAt: '2024-01-03T00:00:00.000Z',
          },
        ],
      };
      localStorageMock['kanban-board-state'] = JSON.stringify(savedState);

      render(<App />);

      // Verify all tasks are restored
      await waitFor(() => {
        expect(screen.getByText('Saved Task 1')).toBeInTheDocument();
        expect(screen.getByText('Saved Task 2')).toBeInTheDocument();
        expect(screen.getByText('Saved Task 3')).toBeInTheDocument();
      });

      // Verify tasks are in correct columns
      const todoColumn = screen.getByText('To Do').closest('section');
      const inProgressColumn = screen.getByText('In Progress').closest('section');
      const doneColumn = screen.getByText('Done').closest('section');

      expect(todoColumn).toContainElement(screen.getByText('Saved Task 1'));
      expect(inProgressColumn).toContainElement(screen.getByText('Saved Task 2'));
      expect(doneColumn).toContainElement(screen.getByText('Saved Task 3'));
    });

    it('displays empty board when LocalStorage is empty', async () => {
      render(<App />);

      // Verify no tasks are displayed
      await waitFor(() => {
        const todoColumn = screen.getByText('To Do').closest('section');
        const inProgressColumn = screen.getByText('In Progress').closest('section');
        const doneColumn = screen.getByText('Done').closest('section');

        // Columns should exist but be empty
        expect(todoColumn).toBeInTheDocument();
        expect(inProgressColumn).toBeInTheDocument();
        expect(doneColumn).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Error Handling', () => {
    it('displays error banner when LocalStorage save fails', async () => {
      // Mock setItem to throw error
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(<App />);

      // Create a task to trigger save
      const createButton = screen.getByRole('button', { name: /Create new task/i });
      fireEvent.click(createButton);

      const titleInput = screen.getByLabelText(/Title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });

      const submitButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(submitButton);

      // Verify error banner is displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Failed to save board state')).toBeInTheDocument();
      });
    });

    it('initializes empty board when LocalStorage load fails', async () => {
      // Mock getItem to throw error
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Failed to read storage');
      });

      render(<App />);

      // Verify error banner is displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Could not load saved board')).toBeInTheDocument();
      });

      // Verify board is empty but functional
      const todoColumn = screen.getByText('To Do').closest('section');
      expect(todoColumn).toBeInTheDocument();
    });

    it('closes error banner when close button is clicked', async () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Failed to read storage');
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByRole('button', { name: /Close error message/i });
      fireEvent.click(closeButton);

      // Verify error banner is removed
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('ID Generation Fallback', () => {
    it('uses fallback ID generation when crypto.randomUUID is unavailable', async () => {
      // Override the beforeEach mock to return undefined, simulating unavailable crypto.randomUUID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.crypto.randomUUID = undefined as any;

      render(<App />);

      // Create a task
      const createButton = screen.getByRole('button', { name: /Create new task/i });
      fireEvent.click(createButton);

      const titleInput = screen.getByLabelText(/Title/i);
      fireEvent.change(titleInput, { target: { value: 'Fallback ID Task' } });

      const submitButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(submitButton);

      // Wait for task to appear
      await waitFor(() => {
        expect(screen.getByText('Fallback ID Task')).toBeInTheDocument();
      });

      // Verify task was saved with fallback ID format (timestamp-random)
      await waitFor(() => {
        const savedData = localStorageMock['kanban-board-state'];
        const parsedData: BoardState = JSON.parse(savedData);
        // Fallback format is: timestamp-randomstring
        expect(parsedData.tasks[0].id).toMatch(/^\d+-[a-z0-9]+$/);
      });
    });

    it('generates unique IDs with fallback method', async () => {
      // Override the beforeEach mock to return undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.crypto.randomUUID = undefined as any;

      render(<App />);

      // Create multiple tasks
      for (let i = 1; i <= 3; i++) {
        const createButton = screen.getByRole('button', { name: /Create new task/i });
        fireEvent.click(createButton);

        const titleInput = screen.getByLabelText(/Title/i);
        fireEvent.change(titleInput, { target: { value: `Task ${i}` } });

        const submitButton = screen.getByRole('button', { name: /Create Task/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(`Task ${i}`)).toBeInTheDocument();
        });
      }

      // Verify all IDs are unique
      await waitFor(() => {
        const savedData = localStorageMock['kanban-board-state'];
        const parsedData: BoardState = JSON.parse(savedData);
        const ids = parsedData.tasks.map(t => t.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(3);
      });
    });
  });
});
