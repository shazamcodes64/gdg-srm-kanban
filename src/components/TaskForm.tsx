import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Task, TaskPriority } from '../types';
import { PRIORITY_LABELS } from '../types';
import '../styles/TaskForm.css';

export interface TaskFormProps {
  task: Task | null; // null for create, Task for edit
  onSubmit: (title: string, description: string, priority: TaskPriority) => void;
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
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form with task data for edit mode
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
    setErrors({});
  }, [task]);

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
      onSubmit(title.trim(), description.trim(), priority);
      // Reset form after successful submit
      setTitle('');
      setDescription('');
      setPriority('medium');
      setErrors({});
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
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
