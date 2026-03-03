/**
 * Task status enum representing workflow stages
 */
export type TaskStatus = 'todo' | 'inprogress' | 'done';

/**
 * Task entity representing a work item in the kanban board
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string; // ISO 8601 timestamp
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
