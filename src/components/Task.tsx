import { memo } from 'react';
import type { Task as TaskType } from '../types';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../types';
import '../styles/Task.css';

export interface TaskProps {
  task: TaskType;
  index: number;
  onEdit: (task: TaskType) => void;
  onDelete: (id: string) => void;
}

export const Task = memo(function Task({ task, onEdit, onDelete }: TaskProps) {
  return (
    <article className="task-card" title={`Created: ${new Date(task.createdAt).toLocaleString()}`}>
      <div className="task-content">
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <span 
            className="priority-badge" 
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
            title={`Priority: ${PRIORITY_LABELS[task.priority]}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>
      <div className="task-actions">
        <button
          type="button"
          className="task-button task-button-edit"
          onClick={() => onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="task-button task-button-delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task: ${task.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
});
