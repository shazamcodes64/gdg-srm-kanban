# Implementation Plan: Kanban Task Management

## Overview

This plan implements a React-based kanban board with drag-and-drop functionality, LocalStorage persistence, and responsive design. The implementation follows a bottom-up approach: project setup → core components → drag-and-drop integration → persistence → styling → testing. Tasks are sequenced to enable incremental validation and early user feedback.

## Tasks

- [-] 1. Project setup and configuration
  - Initialize Vite + React + TypeScript project
  - Install dependencies: @hello-pangea/dnd, fast-check, @testing-library/react, vitest
  - Configure TypeScript (tsconfig.json) with strict mode
  - Configure Vite (vite.config.ts) with test environment
  - Create file structure: src/components/, src/types/, src/styles/
  - Set up basic index.html and main.tsx entry point
  - _Requirements: All (foundation for implementation)_

- [x] 2. Define core data types and interfaces
  - Create src/types/index.ts with Task interface, TaskStatus type, BoardState interface
  - Define STATUS_LABELS constant mapping status values to display labels
  - Export all types for use across components
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 3. Implement ErrorBoundary component
  - Create src/components/ErrorBoundary.tsx as class component
  - Implement getDerivedStateFromError and componentDidCatch lifecycle methods
  - Display fallback UI with error message and refresh instruction
  - Log errors to console for debugging
  - _Requirements: 8.5 (error handling foundation)_

- [ ] 4. Implement Task component
  - [x] 4.1 Create src/components/Task.tsx with TaskProps interface
    - Display task title and description as plain text
    - Render edit and delete buttons with accessible labels
    - Handle onClick events for edit and delete actions
    - Use semantic HTML (article element for task card)
    - _Requirements: 1.4, 3.1, 4.1, 9.1, 9.2, 9.3, 10.1_
  
  - [x] 4.2 Create src/styles/Task.css with responsive card styling
    - Style task card with border, padding, and shadow
    - Style buttons with hover states and focus indicators
    - Ensure minimum 44x44px touch targets for mobile
    - _Requirements: 10.2, 10.5_
  
  - [x] 4.3 Write unit tests for Task component
    - Test task rendering with title and description
    - Test edit button click triggers onEdit callback
    - Test delete button click triggers onDelete callback
    - Test accessible button labels
    - _Requirements: 3.1, 4.1_

- [ ] 5. Implement TaskForm component
  - [x] 5.1 Create src/components/TaskForm.tsx with controlled form inputs
    - Implement modal dialog with overlay
    - Create controlled inputs for title (required) and description (optional)
    - Add form validation: title non-empty and ≤200 chars, description ≤200 chars
    - Display inline validation errors near form fields
    - Handle submit (validate → callback) and cancel (close modal) actions
    - Support Escape key to close modal
    - Include aria-label attributes for all inputs
    - _Requirements: 2.1, 2.2, 2.3, 3.2, 3.3, 3.4, 3.6, 8.6, 10.3, 10.4_
  
  - [x] 5.2 Create src/styles/TaskForm.css with modal styling
    - Style modal overlay to block background interaction
    - Style form with clear visual hierarchy
    - Style validation error messages in red with error icon
    - Ensure form is responsive on mobile devices
    - _Requirements: 8.6_
  
  - [x] 5.3 Write unit tests for TaskForm component
    - Test form renders with empty fields for create mode
    - Test form renders with existing values for edit mode
    - Test validation errors display for empty title
    - Test validation errors display for title >200 chars
    - Test validation errors display for description >200 chars
    - Test successful submit calls onSubmit with trimmed values
    - Test cancel button calls onCancel without submitting
    - Test Escape key closes modal
    - _Requirements: 2.2, 2.3, 3.3, 3.4, 3.6_

- [ ] 6. Implement Column component
  - [x] 6.1 Create src/components/Column.tsx with Droppable wrapper
    - Wrap column content in @hello-pangea/dnd Droppable component
    - Filter tasks by status prop and render Task components
    - Pass onEditTask and onDeleteTask callbacks to Task components
    - Display column header with status label
    - Use semantic HTML (section element for column)
    - _Requirements: 1.1, 1.4, 5.5_
  
  - [x] 6.2 Create src/styles/Column.css with flexbox layout
    - Style column header with background color
    - Style task list container with scrollable overflow
    - Apply responsive layout adjustments for mobile
    - _Requirements: 1.2, 1.3_
  
  - [x] 6.3 Write unit tests for Column component
    - Test column renders with correct label
    - Test column filters and displays only tasks matching status
    - Test column passes callbacks to Task components correctly
    - _Requirements: 1.1, 1.4_

- [ ] 7. Implement Board component with drag-and-drop
  - [x] 7.1 Create src/components/Board.tsx with DragDropContext
    - Wrap board in @hello-pangea/dnd DragDropContext
    - Render three Column components for todo, inprogress, done statuses
    - Implement handleDragEnd to update task status and reorder tasks
    - Implement reorderTasks helper function with deterministic reconstruction
    - Pass tasks, onEditTask, onDeleteTask props to columns
    - Provide visual feedback during drag operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [x] 7.2 Create src/styles/Board.css with CSS Grid layout
    - Use CSS Grid for horizontal three-column layout on desktop (≥768px)
    - Use Flexbox for vertical stacked layout on mobile (<768px)
    - Set board height to fill viewport with scrollable columns
    - Add gap spacing between columns
    - _Requirements: 1.2, 1.3_
  
  - [x] 7.3 Write unit tests for Board drag-and-drop logic
    - Test handleDragEnd updates task status when dropped in different column
    - Test handleDragEnd maintains position when dropped in same column
    - Test handleDragEnd ignores drops outside droppable areas
    - Test reorderTasks correctly reorders tasks within column
    - Test reorderTasks reconstructs array in deterministic order
    - _Requirements: 5.3, 5.4, 5.5_

- [ ] 8. Implement App component with state management
  - [x] 8.1 Create src/components/App.tsx with core state and handlers
    - Initialize tasks state with useState<Task[]>
    - Initialize editingTask state for form modal control
    - Initialize error state for error banner display
    - Implement generateId function with crypto.randomUUID and fallback
    - Implement handleCreateTask: validate → generate ID → add to state
    - Implement handleEditTask: validate → update task in state
    - Implement handleDeleteTask: filter task from state
    - Implement handleDragEnd: delegate to Board component logic
    - Render Board component with tasks and callbacks
    - Render TaskForm component conditionally based on editingTask state
    - Display error banner when error state is set
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 8.2 Add LocalStorage persistence with useEffect hooks
    - Implement useEffect to load tasks from LocalStorage on mount
    - Implement useEffect to save tasks to LocalStorage on tasks change
    - Use storage key "kanban-board-state" with BoardState JSON format
    - Handle save errors: catch exception, set error state, log to console
    - Handle load errors: catch exception, initialize empty board, log to console
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 8.3 Create src/styles/App.css with global layout and error banner
    - Style app container with full viewport height
    - Style error banner with red background and close button
    - Apply global font and color scheme
    - Ensure responsive layout on all screen sizes
    - _Requirements: 8.5, 8.6_
  
  - [x] 8.4 Write integration tests for App component
    - Test task creation flow: open form → submit → task appears in To Do column
    - Test task editing flow: click task → modify → save → task updates
    - Test task deletion flow: click delete → task removed from board
    - Test LocalStorage save on task creation (mock localStorage)
    - Test LocalStorage load on mount restores tasks (mock localStorage)
    - Test LocalStorage save error displays error banner
    - Test LocalStorage load error initializes empty board
    - Test generateId fallback when crypto.randomUUID unavailable
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 3.1, 3.5, 4.2, 4.3, 6.1, 6.3, 6.4, 6.6, 6.7, 2.8_

- [ ] 9. Implement property-based tests
  - [x] 9.1 Write property test for ID uniqueness
    - **Property 1: All tasks have unique IDs**
    - **Validates: Requirements 7.1**
    - Generate array of random task titles using fast-check
    - Create tasks using generateId() function
    - Assert all task IDs are unique (Set size equals array length)
    - Run with minimum 100 iterations
  
  - [x] 9.2 Write property test for drag-and-drop status updates
    - **Property 2: Dropping tasks in different columns updates status correctly**
    - **Validates: Requirements 5.3**
    - Generate random tasks with random source and destination columns
    - Simulate drag-and-drop operation using handleDragEnd logic
    - Assert task status matches destination column status
    - Run with minimum 100 iterations
  
  - [x] 9.3 Write property test for task validation invariants
    - **Property 3: Task validation invariants are maintained**
    - **Validates: Requirements 7.2, 7.3, 7.4**
    - Generate random board states with tasks
    - Assert all tasks have non-empty title ≤200 chars
    - Assert all tasks have description ≤200 chars
    - Assert all tasks have valid status (todo, inprogress, or done)
    - Run with minimum 100 iterations
  
  - [x] 9.4 Write property test for LocalStorage round-trip
    - **Property 4: LocalStorage round-trip preserves state**
    - **Validates: Requirements 6.4**
    - Generate random board states with tasks
    - Save to LocalStorage and load back
    - Assert loaded state equals original state (deep equality)
    - Run with minimum 100 iterations

- [ ] 10. Finalize styling and accessibility
  - [x] 10.1 Create src/index.css with global styles and CSS reset
    - Apply CSS reset for consistent cross-browser rendering
    - Set global font family, size, and line height
    - Define color palette variables
    - Set box-sizing: border-box globally
    - _Requirements: All (visual foundation)_
  
  - [x] 10.2 Enhance accessibility features across all components
    - Verify all interactive elements have visible focus indicators
    - Verify all form inputs have aria-label or label elements
    - Verify semantic HTML usage (section, article, button elements)
    - Test keyboard navigation: Tab through all interactive elements
    - Test keyboard task creation, editing, and deletion
    - Verify @hello-pangea/dnd keyboard drag-and-drop works
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 10.3 Test responsive design on multiple screen sizes
    - Test desktop layout (≥768px): horizontal columns with grid
    - Test mobile layout (<768px): vertical stacked columns
    - Test touch drag-and-drop on mobile devices
    - Verify touch targets are minimum 44x44px
    - Test form modal on mobile devices
    - _Requirements: 1.2, 1.3, 5.7_

- [ ] 11. Create documentation and deployment preparation
  - [x] 11.1 Write README.md with project overview and setup instructions
    - Document project purpose and features
    - Provide installation instructions (npm install)
    - Provide development server instructions (npm run dev)
    - Provide build instructions (npm run build)
    - Provide test instructions (npm test)
    - Document technology stack and architecture overview
    - _Requirements: All (project documentation)_
  
  - [x] 11.2 Verify production build and deployment readiness
    - Run production build (npm run build)
    - Test production build locally (npm run preview)
    - Verify all features work in production build
    - Verify no console errors in production build
    - Ensure build output is optimized and minified
    - _Requirements: All (deployment readiness)_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Run all unit tests and property tests
  - Verify all features work end-to-end
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on mobile devices or browser dev tools
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and integration flows
- Implementation uses TypeScript, React 18+, and @hello-pangea/dnd as specified in design
- LocalStorage operations are synchronous (acceptable for <200 tasks)
- Drag-and-drop library provides built-in keyboard and touch support