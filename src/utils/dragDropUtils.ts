import type { Task, TaskStatus } from '../types';
import type { DraggableLocation, DropResult } from '@hello-pangea/dnd';

/**
 * Reorders tasks array after a drag-and-drop operation
 * Implements deterministic reconstruction: [...todoTasks, ...inprogressTasks, ...doneTasks]
 */
export function reorderTasks(
  tasks: Task[],
  source: DraggableLocation,
  destination: DraggableLocation,
  movedTask: Task,
  newStatus: TaskStatus
): Task[] {
  // Filter tasks by status to get column subsets
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inprogressTasks = tasks.filter(t => t.status === 'inprogress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Get source and destination column arrays
  const sourceColumn = 
    source.droppableId === 'todo' ? todoTasks :
    source.droppableId === 'inprogress' ? inprogressTasks :
    doneTasks;

  const destColumn = 
    newStatus === 'todo' ? todoTasks :
    newStatus === 'inprogress' ? inprogressTasks :
    doneTasks;

  // Remove task from source column
  sourceColumn.splice(source.index, 1);

  // Update task status
  const updatedTask = { ...movedTask, status: newStatus };

  // Insert into destination column at new index
  destColumn.splice(destination.index, 0, updatedTask);

  // Reconstruct global array in deterministic order
  return [...todoTasks, ...inprogressTasks, ...doneTasks];
}

/**
 * Handles drag end event and updates task status and position
 */
export function handleDragEnd(
  result: DropResult,
  tasks: Task[],
  setTasks: (tasks: Task[]) => void,
  onMove?: (taskTitle: string, newStatus: string) => void
): void {
  // Extract source and destination
  const { source, destination, draggableId } = result;

  // Ignore if dropped outside droppable
  if (!destination) return;

  // Ignore if dropped in same position
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  // Find the task being moved
  const task = tasks.find(t => t.id === draggableId);
  if (!task) return;

  // Update task status based on destination column
  const newStatus = destination.droppableId as TaskStatus;

  // Reorder tasks array
  const updatedTasks = reorderTasks(
    tasks,
    source,
    destination,
    task,
    newStatus
  );

  setTasks(updatedTasks);
  
  // Notify about the move if callback provided
  if (onMove && source.droppableId !== destination.droppableId) {
    const statusLabels: Record<TaskStatus, string> = {
      todo: 'To Do',
      inprogress: 'In Progress',
      done: 'Done'
    };
    onMove(task.title, statusLabels[newStatus]);
  }
}
