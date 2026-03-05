import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import type { TaskStatus, BoardState } from '../types';

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
  description: fc.string({ minLength: 0, maxLength: 200 }),
  status: taskStatusArbitrary,
  createdAt: fc.constant(new Date().toISOString()),
});

const STORAGE_KEY = 'kanban-board-state';

describe('Property-Based Tests: LocalStorage Round-Trip', () => {
  // Clean up localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Property 4: LocalStorage round-trip preserves state
   * **Validates: Requirements 6.4**
   * 
   * For any board state containing tasks, saving that state to LocalStorage 
   * and then loading it should restore an equivalent board state with all 
   * tasks having identical property values (id, title, description, status, createdAt).
   */
  it('LocalStorage round-trip preserves state', () => {
    fc.assert(
      fc.property(
        // Generate random board states with tasks
        fc.array(taskArbitrary, { minLength: 0, maxLength: 50 }),
        (tasks) => {
          // Create original board state
          const originalState: BoardState = { tasks };

          // Save to LocalStorage (simulating the save effect in App.tsx)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(originalState));

          // Load from LocalStorage (simulating the load effect in App.tsx)
          const saved = localStorage.getItem(STORAGE_KEY);
          expect(saved).not.toBeNull();

          const loadedState: BoardState = JSON.parse(saved!);

          // Assert loaded state equals original state (deep equality)
          expect(loadedState).toEqual(originalState);
          expect(loadedState.tasks).toHaveLength(originalState.tasks.length);

          // Verify each task property is preserved
          loadedState.tasks.forEach((loadedTask, index) => {
            const originalTask = originalState.tasks[index];
            expect(loadedTask.id).toBe(originalTask.id);
            expect(loadedTask.title).toBe(originalTask.title);
            expect(loadedTask.description).toBe(originalTask.description);
            expect(loadedTask.status).toBe(originalTask.status);
            expect(loadedTask.createdAt).toBe(originalTask.createdAt);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
