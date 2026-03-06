import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Task, TaskPriority } from '../types';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../types';
import { predictTaskPriority } from '../ml/taskPrioritization';
import '../styles/TaskForm.css';

export interface TaskFormProps {
  task: Task | null; // null for create, Task for edit
  onSubmit: (title: string, description: string, priority: TaskPriority, dueDate?: string) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [mlSuggestion, setMlSuggestion] = useState<{
    priority: TaskPriority;
    confidence: number;
    reasoning: string[];
  } | null>(null);
  const [showMlInsights, setShowMlInsights] = useState(false);

  // Initialize form with task data for edit mode
  useEffect(() => {
    if (task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
    setErrors({});
    setMlSuggestion(null);
    setShowMlInsights(false);
  }, [task]);

  // ML-powered priority prediction when title or description changes
  useEffect(() => {
    if (title.trim().length > 3) {
      const prediction = predictTaskPriority(title, description);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMlSuggestion(prediction);
    } else {
      setMlSuggestion(null);
    }
  }, [title, description]);

  // Auto-apply ML suggestion for new tasks with high confidence
  useEffect(() => {
    if (!task && mlSuggestion && mlSuggestion.confidence >= 0.7) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPriority(mlSuggestion.priority);
    }
  }, [mlSuggestion, task]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation: required and ≤200 chars
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Title is required';
    } else if (trimmedTitle.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    // Description validation: ≤200 chars
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(title.trim(), description.trim(), priority, dueDate || undefined);
      // Reset form after successful submit
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setErrors({});
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setErrors({});
    onCancel();
  };

  // Prevent clicks on overlay from closing modal (only explicit cancel/escape)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" role="dialog" aria-labelledby="form-title">
        <h2 id="form-title">{task ? 'Edit Task' : 'Create New Task'}</h2>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="task-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Task title"
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && (
              <span id="title-error" className="error-message" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Task description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className={errors.description ? 'input-error' : ''}
              rows={4}
            />
            {errors.description && (
              <span id="description-error" className="error-message" role="alert">
                {errors.description}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              aria-label="Task priority"
              className="priority-select"
            >
              {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
            
            {/* ML Priority Suggestion */}
            {mlSuggestion && mlSuggestion.priority !== priority && (
              <div className="ml-suggestion">
                <div className="ml-suggestion-header">
                  <span className="ml-icon">🤖</span>
                  <span className="ml-text">
                    AI suggests: <strong style={{ color: PRIORITY_COLORS[mlSuggestion.priority] }}>
                      {PRIORITY_LABELS[mlSuggestion.priority]}
                    </strong>
                    <span className="ml-confidence"> ({Math.round(mlSuggestion.confidence * 100)}% confident)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPriority(mlSuggestion.priority)}
                    className="ml-apply-btn"
                    aria-label="Apply AI suggestion"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMlInsights(!showMlInsights)}
                    className="ml-info-btn"
                    aria-label="Show AI reasoning"
                  >
                    {showMlInsights ? '▼' : '▶'}
                  </button>
                </div>
                
                {showMlInsights && (
                  <div className="ml-insights">
                    <p className="ml-insights-title">AI Reasoning:</p>
                    <ul className="ml-insights-list">
                      {mlSuggestion.reasoning.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="task-due-date">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Task due date"
              className="priority-select"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="button button-cancel"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-submit"
              aria-label={task ? 'Save changes' : 'Create task'}
            >
              {task ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
