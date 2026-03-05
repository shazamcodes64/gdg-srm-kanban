/**
 * Task status enum representing workflow stages
 */
export type TaskStatus = 'todo' | 'inprogress' | 'done';

/**
 * Task priority levels (ML-enhanced)
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task entity representing a work item in the kanban board
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string; // ISO 8601 timestamp
  priority: TaskPriority;
}

/**
 * Board state containing all tasks
 */
export interface BoardState {
  tasks: Task[];
}

/**
 * Status labels for display
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};

/**
 * Priority labels for display
 */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

/**
 * Priority colors for visual distinction
 */
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#10b981',    // green
  medium: '#f59e0b', // orange
  high: '#ef4444',   // red
  urgent: '#dc2626', // dark red
};
