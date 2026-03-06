import { memo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
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
  // Format due date for display
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if task is overdue
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const overdue = isOverdue(task.dueDate);

  return (
    <article className={`task-card ${overdue ? 'overdue' : ''}`} title={`Created: ${new Date(task.createdAt).toLocaleString()}`}>
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
      
      {task.dueDate && (
        <p className={`task-date ${overdue ? 'overdue-text' : ''}`}>
          📅 {formatDueDate(task.dueDate)}
          {overdue && ' ⚠️'}
        </p>
      )}
      
      <div className="task-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onEdit(task)}
          aria-label={`Edit task: ${task.title}`}
          title="Edit task"
        >
          <Edit2 size={16} />
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete task: ${task.title}`}
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
});
