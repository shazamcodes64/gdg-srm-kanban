import { useState, useEffect, useCallback } from 'react';
import type { Task, BoardState } from '../types';
import { Board } from './Board';
import { TaskForm } from './TaskForm';
import { handleDragEnd as boardHandleDragEnd } from './Board';
import type { DropResult } from '@hello-pangea/dnd';
import '../styles/App.css';

/**
 * Generates a unique ID for tasks
 * Uses crypto.randomUUID() with fallback to timestamp + random
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const STORAGE_KEY = 'kanban-board-state';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load theme from LocalStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('kanban-theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }, []);

  // Keyboard shortcut: N to create new task
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea and not in a modal
      if (
        e.key === 'n' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !isCreating &&
        !editingTask
      ) {
        e.preventDefault();
        setIsCreating(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCreating, editingTask]);

  // Load tasks from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: BoardState = JSON.parse(saved);
        setTasks(state.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load board state:', error);
      setTasks([]);
      setError('Could not load saved board');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save tasks to LocalStorage on tasks change (debounced)
  useEffect(() => {
    // Skip saving on initial mount before data is loaded
    if (!isInitialized) return;

    setSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      try {
        const state: BoardState = { tasks };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1200);
      } catch (error) {
        setSaveStatus('idle');
        setError('Failed to save board state');
        console.error('LocalStorage save error:', error);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [tasks, isInitialized]);

  /**
   * Handles task creation
   * Validates input, generates ID, adds to state
   */
  const handleCreateTask = useCallback((title: string, description: string) => {
    // Validation is handled by TaskForm component
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [...prev, newTask]);
    setIsCreating(false);
  }, []);

  /**
   * Handles task editing
   * Validates input, updates task in state
   */
  const handleEditTask = useCallback((title: string, description: string) => {
    if (!editingTask) return;

    const taskId = editingTask.id;
    // Validation is handled by TaskForm component
    setTasks(prev =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, title, description }
          : t
      )
    );
    setEditingTask(null);
  }, [editingTask]);

  /**
   * Handles task deletion with confirmation
   * Filters task from state
   */
  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      const taskTitle = task ? task.title : 'this task';
      
      if (window.confirm(`Delete "${taskTitle}"? This cannot be undone.`)) {
        return prev.filter((t) => t.id !== id);
      }
      return prev;
    });
  }, []);

  /**
   * Handles drag end event
   * Delegates to Board component logic
   */
  const handleDragEnd = useCallback((result: DropResult) => {
    boardHandleDragEnd(result, tasks, setTasks);
  }, [tasks]);

  /**
   * Opens task for editing
   */
  const handleEditTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  /**
   * Closes error banner
   */
  const handleCloseError = () => {
    setError(null);
  };

  /**
   * Opens create task form
   */
  const handleOpenCreate = () => {
    setIsCreating(true);
  };

  /**
   * Closes task form
   */
  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingTask(null);
  };

  /**
   * Toggles dark mode
   */
  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('kanban-theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <div className="app">
      {/* Error banner */}
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button
            onClick={handleCloseError}
            className="error-close"
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Header with create button */}
      <header className="app-header">
        <div className="app-header-left">
          <h1>Kanban Task Management</h1>
          <button
            onClick={handleToggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="save-indicator" aria-live="polite">
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : ''}
          </span>
        </div>
        <button
          onClick={handleOpenCreate}
          className="button button-create"
          aria-label="Create new task"
          title="Create new task (Press N)"
        >
          + New Task
        </button>
      </header>

      {/* Board */}
      <Board
        tasks={tasks}
        onDragEnd={handleDragEnd}
        onEditTask={handleEditTaskClick}
        onDeleteTask={handleDeleteTask}
      />

      {/* Task form modal */}
      {(isCreating || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={isCreating ? handleCreateTask : handleEditTask}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}
