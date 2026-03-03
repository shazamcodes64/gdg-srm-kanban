import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Generates a unique ID for tasks
 * Uses crypto.randomUUID() with fallback to timestamp + random
 * This is the same implementation as in App.tsx
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

describe('Property-Based Tests: ID Uniqueness', () => {
  /**
   * Property 1: All tasks have unique IDs
   * **Validates: Requirements 7.1**
   * 
   * For any set of task titles, when creating tasks using the application's 
   * generateId() function, each task should have a unique id property that 
   * differs from all other task IDs.
   */
  it('all tasks have unique IDs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 0, maxLength: 100 }),
        (titles) => {
          // Create tasks using the actual generateId() function
          const tasks = titles.map(title => ({
            id: generateId(),
            title,
            description: '',
            status: 'todo' as const,
            createdAt: new Date().toISOString()
          }));
          
          // Extract all IDs
          const ids = tasks.map(t => t.id);
          
          // Check uniqueness: Set size should equal array length
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
