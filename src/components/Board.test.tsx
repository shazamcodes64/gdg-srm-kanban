import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Board } from './Board';
import { reorderTasks, handleDragEnd } from '../utils/dragDropUtils';
import type { Task } from '../types';
import type { DropResult, DraggableLocation } from '@hello-pangea/dnd';

describe('Board', () => {
  const mockOnDragEnd = vi.fn();
  const mockOnEditTask = vi.fn();
  const mockOnDeleteTask = vi.fn();

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'todo',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'task-2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'inprogress',
      createdAt: '2024-01-02T00:00:00.000Z',
    },
    {
      id: 'task-3',
      title: 'Task 3',
      description: 'Description 3',
      status: 'done',
      createdAt: '2024-01-03T00:00:00.000Z',
    },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Board component', () => {
    it('renders three columns with correct labels', () => {
      render(
        <Board
          tasks={mockTasks}
          onDragEnd={mockOnDragEnd}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('renders tasks in their respective columns', () => {
      render(
        <Board
          tasks={mockTasks}
          onDragEnd={mockOnDragEnd}
          onEditTask={mockOnEditTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
    });
  });

  describe('handleDragEnd', () => {
    it('updates task status when dropped in different column', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const setTasks = vi.fn();

      const result: DropResult = {
        draggableId: 'task-1',
        type: 'DEFAULT',
        source: {
          droppableId: 'todo',
          index: 0,
        },
        destination: {
          droppableId: 'inprogress',
          index: 0,
        },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      handleDragEnd(result, tasks, setTasks);

      expect(setTasks).toHaveBeenCalledTimes(1);
      const updatedTasks = setTasks.mock.calls[0][0];
      expect(updatedTasks[0].status).toBe('inprogress');
      expect(updatedTasks[0].id).toBe('task-1');
    });

    it('maintains position when dropped in same column', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'todo',
          createdAt: '2024-01-02T00:00:00.000Z',
        },
      ];

      const setTasks = vi.fn();

      const result: DropResult = {
        draggableId: 'task-1',
        type: 'DEFAULT',
        source: {
          droppableId: 'todo',
          index: 0,
        },
        destination: {
          droppableId: 'todo',
          index: 1,
        },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      handleDragEnd(result, tasks, setTasks);

      expect(setTasks).toHaveBeenCalledTimes(1);
      const updatedTasks = setTasks.mock.calls[0][0];
      expect(updatedTasks[0].id).toBe('task-2');
      expect(updatedTasks[1].id).toBe('task-1');
      expect(updatedTasks[0].status).toBe('todo');
      expect(updatedTasks[1].status).toBe('todo');
    });

    it('ignores drops outside droppable areas', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const setTasks = vi.fn();

      const result: DropResult = {
        draggableId: 'task-1',
        type: 'DEFAULT',
        source: {
          droppableId: 'todo',
          index: 0,
        },
        destination: null,
        reason: 'CANCEL',
        mode: 'FLUID',
        combine: null,
      };

      handleDragEnd(result, tasks, setTasks);

      expect(setTasks).not.toHaveBeenCalled();
    });

    it('ignores drops in same position', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const setTasks = vi.fn();

      const result: DropResult = {
        draggableId: 'task-1',
        type: 'DEFAULT',
        source: {
          droppableId: 'todo',
          index: 0,
        },
        destination: {
          droppableId: 'todo',
          index: 0,
        },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      handleDragEnd(result, tasks, setTasks);

      expect(setTasks).not.toHaveBeenCalled();
    });

    it('handles task not found gracefully', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const setTasks = vi.fn();

      const result: DropResult = {
        draggableId: 'non-existent-task',
        type: 'DEFAULT',
        source: {
          droppableId: 'todo',
          index: 0,
        },
        destination: {
          droppableId: 'inprogress',
          index: 0,
        },
        reason: 'DROP',
        mode: 'FLUID',
        combine: null,
      };

      handleDragEnd(result, tasks, setTasks);

      expect(setTasks).not.toHaveBeenCalled();
    });
  });

  describe('reorderTasks', () => {
    it('correctly reorders tasks within same column', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'todo',
          createdAt: '2024-01-02T00:00:00.000Z',
        },
        {
          id: 'task-3',
          title: 'Task 3',
          description: 'Description 3',
          status: 'todo',
          createdAt: '2024-01-03T00:00:00.000Z',
        },
      ];

      const source: DraggableLocation = {
        droppableId: 'todo',
        index: 0,
      };

      const destination: DraggableLocation = {
        droppableId: 'todo',
        index: 2,
      };

      const movedTask = tasks[0];

      const result = reorderTasks(tasks, source, destination, movedTask, 'todo');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('task-2');
      expect(result[1].id).toBe('task-3');
      expect(result[2].id).toBe('task-1');
      expect(result[2].status).toBe('todo');
    });

    it('correctly moves task to different column', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'inprogress',
          createdAt: '2024-01-02T00:00:00.000Z',
        },
      ];

      const source: DraggableLocation = {
        droppableId: 'todo',
        index: 0,
      };

      const destination: DraggableLocation = {
        droppableId: 'inprogress',
        index: 1,
      };

      const movedTask = tasks[0];

      const result = reorderTasks(tasks, source, destination, movedTask, 'inprogress');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('task-2');
      expect(result[0].status).toBe('inprogress');
      expect(result[1].id).toBe('task-1');
      expect(result[1].status).toBe('inprogress');
    });

    it('reconstructs array in deterministic order (todo, inprogress, done)', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'done',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'todo',
          createdAt: '2024-01-02T00:00:00.000Z',
        },
        {
          id: 'task-3',
          title: 'Task 3',
          description: 'Description 3',
          status: 'inprogress',
          createdAt: '2024-01-03T00:00:00.000Z',
        },
      ];

      const source: DraggableLocation = {
        droppableId: 'done',
        index: 0,
      };

      const destination: DraggableLocation = {
        droppableId: 'todo',
        index: 1,
      };

      const movedTask = tasks[0];

      const result = reorderTasks(tasks, source, destination, movedTask, 'todo');

      expect(result).toHaveLength(3);
      // Verify deterministic order: todo tasks first
      expect(result[0].status).toBe('todo');
      expect(result[1].status).toBe('todo');
      // Then inprogress tasks
      expect(result[2].status).toBe('inprogress');
      // Verify specific order
      expect(result[0].id).toBe('task-2');
      expect(result[1].id).toBe('task-1');
      expect(result[2].id).toBe('task-3');
    });

    it('handles moving task from middle position', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'todo',
          createdAt: '2024-01-02T00:00:00.000Z',
        },
        {
          id: 'task-3',
          title: 'Task 3',
          description: 'Description 3',
          status: 'todo',
          createdAt: '2024-01-03T00:00:00.000Z',
        },
      ];

      const source: DraggableLocation = {
        droppableId: 'todo',
        index: 1,
      };

      const destination: DraggableLocation = {
        droppableId: 'done',
        index: 0,
      };

      const movedTask = tasks[1];

      const result = reorderTasks(tasks, source, destination, movedTask, 'done');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('task-1');
      expect(result[0].status).toBe('todo');
      expect(result[1].id).toBe('task-3');
      expect(result[1].status).toBe('todo');
      expect(result[2].id).toBe('task-2');
      expect(result[2].status).toBe('done');
    });

    it('preserves task properties except status when moving', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'todo',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const source: DraggableLocation = {
        droppableId: 'todo',
        index: 0,
      };

      const destination: DraggableLocation = {
        droppableId: 'done',
        index: 0,
      };

      const movedTask = tasks[0];

      const result = reorderTasks(tasks, source, destination, movedTask, 'done');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task-1');
      expect(result[0].title).toBe('Task 1');
      expect(result[0].description).toBe('Description 1');
      expect(result[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(result[0].status).toBe('done');
    });
  });
});
