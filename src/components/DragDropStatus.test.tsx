import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { TaskStatus } from '../types';
import type { DraggableLocation } from '@hello-pangea/dnd';
import { reorderTasks } from '../utils/dragDropUtils';

/**
 * Arbitrary generator for TaskStatus
 */
const taskStatusArbitrary = fc.constantFrom<TaskStatus>('todo', 'inprogress', 'done');

/**
 * Arbitrary generator for Task objects
 */
const taskArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ maxLength: 200 }),
  status: taskStatusArbitrary,
  createdAt: fc.constant(new Date().toISOString()),
});

/**
 * Arbitrary generator for DraggableLocation
 */
// Unused but kept for potential future use
// const draggableLocationArbitrary = (status: TaskStatus, maxIndex: number) =>
//   fc.record({
//     droppableId: fc.constant(status),
//     index: fc.integer({ min: 0, max: Math.max(0, maxIndex) }),
//   });

describe('Property-Based Tests: Drag-and-Drop Status Updates', () => {
  /**
   * Property 2: Dropping tasks in different columns updates status correctly
   * **Validates: Requirements 5.3**
   * 
   * For any task dragged from one column and dropped in a different column, 
   * the task's status property should be updated to match the target column's 
   * status value ("todo" for To Do column, "inprogress" for In Progress column, 
   * "done" for Done column).
   */
  it('dropping tasks in different columns updates status correctly', () => {
    fc.assert(
      fc.property(
        // Generate an array of tasks
        fc.array(taskArbitrary, { minLength: 1, maxLength: 20 }),
        // Generate source and destination statuses (must be different)
        taskStatusArbitrary,
        taskStatusArbitrary,
        (tasks, sourceStatus, destStatus) => {
          // Skip if source and destination are the same (not testing same-column moves)
          if (sourceStatus === destStatus) return true;

          // Filter tasks by source status to get the source column
          const sourceColumnTasks = tasks.filter(t => t.status === sourceStatus);
          
          // Skip if source column is empty
          if (sourceColumnTasks.length === 0) return true;

          // Pick a random task from the source column
          const sourceIndex = Math.floor(Math.random() * sourceColumnTasks.length);
          const movedTask = sourceColumnTasks[sourceIndex];

          // Create source and destination locations
          const source: DraggableLocation = {
            droppableId: sourceStatus,
            index: sourceIndex,
          };

          const destColumnTasks = tasks.filter(t => t.status === destStatus);
          const destIndex = Math.floor(Math.random() * (destColumnTasks.length + 1));
          
          const destination: DraggableLocation = {
            droppableId: destStatus,
            index: destIndex,
          };

          // Simulate drag-and-drop operation using reorderTasks
          const updatedTasks = reorderTasks(
            tasks,
            source,
            destination,
            movedTask,
            destStatus
          );

          // Find the moved task in the updated tasks array
          const updatedTask = updatedTasks.find(t => t.id === movedTask.id);

          // Assert the task status matches the destination column status
          expect(updatedTask).toBeDefined();
          expect(updatedTask?.status).toBe(destStatus);
        }
      ),
      { numRuns: 100 }
    );
  });
});
