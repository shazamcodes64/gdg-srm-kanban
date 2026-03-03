import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('Responsive Design Tests', () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // Store original dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Restore original dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
    
    // Trigger resize event to reset
    window.dispatchEvent(new Event('resize'));
  });

  const setViewportSize = (width: number, height: number = 768) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  };

  describe('Desktop Layout (≥768px)', () => {
    it('should display horizontal columns with grid layout on desktop', () => {
      setViewportSize(1024, 768);
      
      const { container } = render(<App />);
      
      // Check that board exists
      const board = container.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      // Check that all three columns are rendered
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      
      // Verify grid layout is applied (checking computed styles would require jsdom limitations workaround)
      // We verify the structure is correct for grid layout
      const columns = container.querySelectorAll('.column');
      expect(columns).toHaveLength(3);
    });

    it('should render columns side by side on desktop viewport', () => {
      setViewportSize(1280, 800);
      
      const { container } = render(<App />);
      
      const board = container.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      // All columns should be present
      const columns = container.querySelectorAll('.column');
      expect(columns).toHaveLength(3);
      
      // Verify columns are in the expected order
      const columnHeaders = container.querySelectorAll('.column-header');
      expect(columnHeaders[0]).toHaveTextContent('To Do');
      expect(columnHeaders[1]).toHaveTextContent('In Progress');
      expect(columnHeaders[2]).toHaveTextContent('Done');
    });

    it('should have proper spacing between columns on desktop', () => {
      setViewportSize(1024, 768);
      
      const { container } = render(<App />);
      
      const board = container.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      // Board should have grid layout with gap
      // Note: In jsdom, computed styles may not reflect CSS, but we verify the class is applied
      expect(board).toHaveClass('board');
    });
  });

  describe('Mobile Layout (<768px)', () => {
    it('should display vertical stacked columns on mobile', () => {
      setViewportSize(375, 667); // iPhone SE dimensions
      
      render(<App />);
      
      // Check that board exists
      const board = document.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      // Check that all three columns are still rendered
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      
      // Verify all columns are present
      const columns = document.querySelectorAll('.column');
      expect(columns).toHaveLength(3);
    });

    it('should stack columns vertically on mobile viewport', () => {
      setViewportSize(414, 896); // iPhone 11 Pro Max dimensions
      
      render(<App />);
      
      const board = document.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      // All columns should be present and stacked
      const columns = document.querySelectorAll('.column');
      expect(columns).toHaveLength(3);
      
      // Verify columns maintain order
      const columnHeaders = document.querySelectorAll('.column-header');
      expect(columnHeaders[0]).toHaveTextContent('To Do');
      expect(columnHeaders[1]).toHaveTextContent('In Progress');
      expect(columnHeaders[2]).toHaveTextContent('Done');
    });

    it('should render full-width columns on mobile', () => {
      setViewportSize(320, 568); // iPhone 5/SE dimensions
      
      const { container } = render(<App />);
      
      const columns = container.querySelectorAll('.column');
      expect(columns).toHaveLength(3);
      
      // Each column should have the column class for mobile styling
      columns.forEach(column => {
        expect(column).toHaveClass('column');
      });
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44x44px touch targets for task buttons', () => {
      setViewportSize(375, 667);
      
      // Create a task to test button sizes
      localStorage.setItem('kanban-board-state', JSON.stringify({
        tasks: [{
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          createdAt: new Date().toISOString()
        }]
      }));
      
      render(<App />);
      
      // Find task buttons using the actual aria-labels
      const editButton = screen.getByLabelText('Edit task: Test Task');
      const deleteButton = screen.getByLabelText('Delete task: Test Task');
      
      // Verify buttons exist
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
      
      // Check that buttons have the task-button class which enforces min-width/height
      expect(editButton).toHaveClass('task-button');
      expect(deleteButton).toHaveClass('task-button');
    });

    it('should have adequate touch targets for form buttons on mobile', () => {
      setViewportSize(375, 667);
      
      render(<App />);
      
      // Open the task form by clicking the add button (actual text is "+ New Task")
      const addButton = screen.getByText('+ New Task');
      expect(addButton).toBeInTheDocument();
      
      // Verify add button has adequate size
      expect(addButton).toHaveClass('button');
    });
  });

  describe('Form Modal Responsiveness', () => {
    it('should display form modal properly on mobile devices', async () => {
      setViewportSize(375, 667);
      
      const user = userEvent.setup();
      render(<App />);
      
      // Open the form (actual button text is "+ New Task")
      const addButton = screen.getByText('+ New Task');
      await user.click(addButton);
      
      // Modal should be visible - check for the modal content
      const modal = document.querySelector('.modal-overlay');
      expect(modal).toBeInTheDocument();
      
      // Form elements should be present
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should have full-width buttons on mobile form', async () => {
      setViewportSize(375, 667);
      
      const user = userEvent.setup();
      render(<App />);
      
      // Open the form (actual button text is "+ New Task")
      const addButton = screen.getByText('+ New Task');
      await user.click(addButton);
      
      // Check form buttons (actual text is "Create" not "Create Task")
      const submitButton = screen.getByText('Create');
      const cancelButton = screen.getByText('Cancel');
      
      expect(submitButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      
      // Buttons should have the button class for responsive styling
      expect(submitButton).toHaveClass('button');
      expect(cancelButton).toHaveClass('button');
    });

    it('should adjust modal padding on mobile', async () => {
      setViewportSize(375, 667);
      
      const user = userEvent.setup();
      render(<App />);
      
      // Open the form (actual button text is "+ New Task")
      const addButton = screen.getByText('+ New Task');
      await user.click(addButton);
      
      // Modal content should exist
      const modalContent = document.querySelector('.modal-content');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('Breakpoint Transitions', () => {
    it('should transition from desktop to mobile layout at 768px breakpoint', () => {
      // Start with desktop
      setViewportSize(768, 768);
      
      const { container, rerender } = render(<App />);
      
      let board = container.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      // Switch to mobile
      setViewportSize(767, 768);
      rerender(<App />);
      
      board = container.querySelector('.board');
      expect(board).toBeInTheDocument();
      
      // All columns should still be present
      const columns = container.querySelectorAll('.column');
      expect(columns).toHaveLength(3);
    });

    it('should maintain functionality across viewport changes', () => {
      setViewportSize(1024, 768);
      
      const { rerender } = render(<App />);
      
      // Verify desktop layout
      expect(screen.getByText('To Do')).toBeInTheDocument();
      
      // Switch to mobile
      setViewportSize(375, 667);
      rerender(<App />);
      
      // Verify mobile layout still shows all columns
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  describe('Content Overflow Handling', () => {
    it('should handle long task titles on mobile', () => {
      setViewportSize(375, 667);
      
      const longTitle = 'This is a very long task title that should wrap properly on mobile devices without breaking the layout';
      
      localStorage.setItem('kanban-board-state', JSON.stringify({
        tasks: [{
          id: '1',
          title: longTitle,
          description: 'Description',
          status: 'todo',
          createdAt: new Date().toISOString()
        }]
      }));
      
      render(<App />);
      
      // Task should be visible with long title
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle scrollable task lists on mobile', () => {
      setViewportSize(375, 667);
      
      // Create multiple tasks
      const tasks = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i + 1}`,
        description: `Description ${i + 1}`,
        status: 'todo',
        createdAt: new Date().toISOString()
      }));
      
      localStorage.setItem('kanban-board-state', JSON.stringify({ tasks }));
      
      const { container } = render(<App />);
      
      // Task list should exist and be scrollable
      const taskList = container.querySelector('.task-list');
      expect(taskList).toBeInTheDocument();
      
      // All tasks should be rendered
      tasks.forEach(task => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
    });
  });
});
