import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { toast, Toaster } from 'sonner';
import type { Task, BoardState, TaskPriority } from '../types';
import { Board } from './Board';
import { handleDragEnd as boardHandleDragEnd } from '../utils/dragDropUtils';
import type { DropResult } from '@hello-pangea/dnd';
import '../styles/App.css';

// Lazy load TaskForm for better initial load performance
const TaskForm = lazy(() => import('./TaskForm').then(module => ({ default: module.TaskForm })));

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);

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
        toast.error('Failed to save board state');
        console.error('LocalStorage save error:', error);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [tasks, isInitialized]);

  /**
   * Handles task creation
   * Validates input, generates ID, adds to state
   */
  const handleCreateTask = useCallback((title: string, description: string, priority: TaskPriority, dueDate?: string) => {
    // Validation is handled by TaskForm component
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      status: 'todo',
      createdAt: new Date().toISOString(),
      priority,
      dueDate,
    };

    setTasks(prev => [...prev, newTask]);
    setIsCreating(false);
    toast.success('Task created', {
      description: title,
    });
  }, []);

  /**
   * Handles task editing
   * Validates input, updates task in state
   */
  const handleEditTask = useCallback((title: string, description: string, priority: TaskPriority, dueDate?: string) => {
    if (!editingTask) return;

    const taskId = editingTask.id;
    // Validation is handled by TaskForm component
    setTasks(prev =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, title, description, priority, dueDate }
          : t
      )
    );
    setEditingTask(null);
    toast.success('Task updated', {
      description: title,
    });
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
        toast.success('Task deleted', {
          description: taskTitle,
        });
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
    boardHandleDragEnd(result, tasks, setTasks, (taskTitle, newStatus) => {
      toast.success('Task moved', {
        description: `"${taskTitle}" → ${newStatus}`,
      });
    });
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

  /**
   * Filter tasks based on search query
   */
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <Toaster position="top-right" richColors />
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
        <div className="app-header-right">
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search tasks"
          />
          <button
            onClick={handleOpenCreate}
            className="button button-create"
            aria-label="Create new task"
            title="Create new task (Press N)"
          >
            + New Task
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="button button-help"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts"
          >
            ?
          </button>
        </div>
      </header>

      {/* Board */}
      <Board
        tasks={filteredTasks}
        onDragEnd={handleDragEnd}
        onEditTask={handleEditTaskClick}
        onDeleteTask={handleDeleteTask}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>
          "Productivity is never an accident. It is always the result of commitment to excellence." • {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
        </p>
      </footer>

      {/* Task form modal */}
      {(isCreating || editingTask) && (
        <Suspense fallback={<div className="modal-overlay"><div className="modal-content">Loading...</div></div>}>
          <TaskForm
            task={editingTask}
            onSubmit={isCreating ? handleCreateTask : handleEditTask}
            onCancel={handleCancelForm}
          />
        </Suspense>
      )}

      {/* Keyboard shortcuts help modal */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div className="shortcuts-grid">
              <div className="shortcut-item">
                <div className="shortcut-key">N</div>
                <span>Create new task</span>
              </div>
              <div className="shortcut-item">
                <div className="shortcut-key">Esc</div>
                <span>Close modal</span>
              </div>
              <div className="shortcut-item">
                <div className="shortcut-key">Tab</div>
                <span>Focus on task</span>
              </div>
              <div className="shortcut-item">
                <div className="shortcut-key">Space</div>
                <span>Pick up / Drop task</span>
              </div>
              <div className="shortcut-item">
                <div className="shortcut-key">↑ ↓</div>
                <span>Move task up/down</span>
              </div>
            </div>
            <div className="help-tip-box">
              💡 <strong>Tip:</strong> Arrow keys only work in keyboard drag mode. Press <kbd>Tab</kbd> to focus a task → <kbd>Space</kbd> to pick it up → use arrow keys to move → press <kbd>Space</kbd> again to drop.
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="button button-submit"
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Sonner toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
