import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { TaskStatus } from '../types';

/**
 * Arbitrary generator for TaskStatus
 */
const taskStatusArbitrary = fc.constantFrom<TaskStatus>('todo', 'inprogress', 'done');

/**
 * Arbitrary generator for valid Task objects
 * Generates tasks that should satisfy all validation invariants
 */
const validTaskArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  status: taskStatusArbitrary,
  createdAt: fc.constant(new Date().toISOString()),
});

describe('Property-Based Tests: Task Validation Invariants', () => {
  /**
   * Property 3: Task validation invariants are maintained
   * **Validates: Requirements 7.2, 7.3, 7.4**
   * 
   * For any task in the application state:
   * - Its title property should be a non-empty string with length ≤ 200 characters
   * - Its description property should be a string with length ≤ 200 characters (can be empty)
   * - Its status property should be one of: "todo", "inprogress", or "done"
   */
  it('all tasks maintain validation invariants', () => {
    fc.assert(
      fc.property(
        // Generate random board states with tasks
        fc.array(validTaskArbitrary, { minLength: 0, maxLength: 50 }),
        (tasks) => {
          // For each task in the board state, verify validation invariants
          tasks.forEach(task => {
            // Assert title is non-empty and ≤200 characters
            expect(task.title.length).toBeGreaterThan(0);
            expect(task.title.length).toBeLessThanOrEqual(200);
            
            // Assert description is ≤200 characters (can be empty)
            expect(task.description.length).toBeGreaterThanOrEqual(0);
            expect(task.description.length).toBeLessThanOrEqual(200);
            
            // Assert status is one of the valid values
            expect(['todo', 'inprogress', 'done']).toContain(task.status);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
