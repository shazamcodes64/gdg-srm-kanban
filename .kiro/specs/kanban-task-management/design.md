# Design Document: Kanban Task Management

## Overview

This design specifies a React-based kanban board application with three workflow columns (To Do, In Progress, Done), drag-and-drop task management, and LocalStorage persistence. The architecture prioritizes simplicity, maintainability, and implementability within the 15-20 hour scope.

The application uses React 18+ with functional components and hooks for state management, @hello-pangea/dnd for drag-and-drop functionality, and vanilla CSS for responsive styling. All data persists to browser LocalStorage as a single JSON object.

Key design decisions:
- Single-component architecture to minimize complexity
- Inline state management (no Redux/Context) for rapid development
- Inline LocalStorage and ID generation logic (no separate utils) for simplicity
- CSS Grid/Flexbox for responsive layout without external UI libraries
- Synchronous LocalStorage operations (acceptable for datasets <200 tasks)
- React's built-in XSS protection for security
- Minimal property-based testing (4 properties) to stay within scope
- Inline error banners (no toast component) to reduce implementation overhead

This design deliberately avoids over-engineering to ensure the implementation can be completed with high quality within the time constraint.

## Architecture

### Component Structure

The application follows a simple hierarchical component structure:

```
ErrorBoundary (error handling wrapper)
└── App (root component)
    ├── Board (main container)
    │   ├── Column (To Do)
    │   │   └── Task[]
    │   ├── Column (In Progress)
    │   │   └── Task[]
    │   └── Column (Done)
    │       └── Task[]
    └── TaskForm (create/edit modal)
```

Component responsibilities:

**ErrorBoundary Component**
- Wraps the entire application
- Catches rendering errors in component tree
- Displays fallback UI on error
- Prevents entire app crash

**App Component**
- Root application container
- Manages global state (tasks array)
- Handles LocalStorage persistence
- Renders Board and TaskForm

**Board Component**
- Wraps @hello-pangea/dnd DragDropContext
- Renders three Column components
- Handles drag-and-drop events
- Passes task data and callbacks to columns

**Column Component**
- Wraps @hello-pangea/dnd Droppable
- Renders column header with status label
- Filters and displays tasks for specific status
- Maps tasks to Task components

**Task Component**
- Wraps @hello-pangea/dnd Draggable
- Displays task title and description
- Provides edit and delete buttons
- Handles click events for editing

**TaskForm Component**
- Modal dialog for creating/editing tasks
- Controlled form inputs for title and description
- Validation logic
- Submit and cancel handlers

### Technology Stack

- **React 18+**: UI framework with functional components and hooks
- **@hello-pangea/dnd**: Drag-and-drop library (maintained fork of react-beautiful-dnd)
- **Vite**: Build tool and development server
- **CSS3**: Styling with Grid, Flexbox, and media queries
- **LocalStorage API**: Browser-native persistence
- **crypto.randomUUID()**: Unique ID generation with fallback

### State Management

Single source of truth in App component using useState:

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  createdAt: string; // ISO 8601 timestamp
}

const [tasks, setTasks] = useState<Task[]>([]);
```

State update patterns:
- Create: Append new task to tasks array
- Edit: Map over tasks, replace matching id
- Delete: Filter out task by id
- Move: Update status and reorder within status group

All state updates trigger LocalStorage sync via useEffect.

## Components and Interfaces

### Data Models

**Task Interface**
```typescript
interface Task {
  id: string;              // UUID from crypto.randomUUID()
  title: string;           // 1-200 characters, required
  description: string;     // 0-200 characters, optional
  status: TaskStatus;      // Workflow stage
  createdAt: string;       // ISO 8601 timestamp
}

type TaskStatus = 'todo' | 'inprogress' | 'done';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done'
};
```

**Board State**
```typescript
interface BoardState {
  tasks: Task[];
}
```

### Component Interfaces

**App Component**
```typescript
function App(): JSX.Element

State:
- tasks: Task[]
- editingTask: Task | null
- error: string | null

Effects:
- Load tasks from LocalStorage on mount
- Save tasks to LocalStorage on tasks change

Handlers:
- handleCreateTask(title: string, description: string): void
- handleEditTask(id: string, title: string, description: string): void
- handleDeleteTask(id: string): void
- handleDragEnd(result: DropResult): void
```

**Board Component**
```typescript
interface BoardProps {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

function Board(props: BoardProps): JSX.Element
```

**Column Component**
```typescript
interface ColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

function Column(props: ColumnProps): JSX.Element
```

**Task Component**
```typescript
interface TaskProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function Task(props: TaskProps): JSX.Element
```

**TaskForm Component**
```typescript
interface TaskFormProps {
  task: Task | null;        // null for create, Task for edit
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

function TaskForm(props: TaskFormProps): JSX.Element

State:
- title: string
- description: string
- errors: { title?: string; description?: string }

Validation:
- Title: Required, 1-200 characters
- Description: Optional, 0-200 characters

Modal Behavior:
- Modal prevents background interaction (overlay blocks clicks)
- Closes on Cancel button or successful submit
- Closes on Escape key press
```

### Drag-and-Drop Integration

Using @hello-pangea/dnd library structure:

```typescript
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="todo">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {todoTasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <Task task={task} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

**handleDragEnd Logic**
```typescript
function handleDragEnd(result: DropResult): void {
  // Extract source and destination
  const { source, destination, draggableId } = result;
  
  // Ignore if dropped outside droppable
  if (!destination) return;
  
  // Ignore if dropped in same position
  if (source.droppableId === destination.droppableId && 
      source.index === destination.index) return;
  
  // Find the task being moved
  const task = tasks.find(t => t.id === draggableId);
  
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
}

function reorderTasks(
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
  
  // Update moved task status and remove from source column subset
  const updatedTask = { ...movedTask, status: newStatus };
  const sourceColumn = [todoTasks, inprogressTasks, doneTasks].find(col => 
    col.some(t => t.id === movedTask.id)
  );
  sourceColumn.splice(source.index, 1);
  
  // Insert into destination column subset at new index
  const destColumn = newStatus === 'todo' ? todoTasks : 
                     newStatus === 'inprogress' ? inprogressTasks : doneTasks;
  destColumn.splice(destination.index, 0, updatedTask);
  
  // Reconstruct global array in deterministic order
  return [...todoTasks, ...inprogressTasks, ...doneTasks];
}
```

**Task Ordering Design Note**

The tasks array does not maintain cross-column relative ordering. Column order is derived by filtering tasks by status and using their index position within that filtered array. When reordering:
1. Filter tasks by status to get the column's task subset
2. Apply the reorder operation within that subset
3. Update the tasks array with the reordered subset
4. Other columns are unaffected by the reorder operation

**Reconstruction Strategy**: The global tasks array is reconstructed as `[...todoTasks, ...inprogressTasks, ...doneTasks]` after each reorder to ensure deterministic ordering. This explicit concatenation order guarantees consistent task positioning across all operations.

## Data Models

### Task Entity

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  createdAt: string;
}
```

Field specifications:
- **id**: Generated by `crypto.randomUUID()` or fallback `Date.now() + Math.random()`
- **title**: Non-empty string, max 200 characters, trimmed
- **description**: String, max 200 characters, can be empty, trimmed
- **status**: Enum value mapping to column position
- **createdAt**: ISO 8601 string from `new Date().toISOString()`

### LocalStorage Schema

**Storage Key**: `kanban-board-state`

**Storage Format**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implement drag and drop",
      "description": "Use @hello-pangea/dnd library",
      "status": "inprogress",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Data Flow

**Task Creation Flow**
1. User fills TaskForm and submits
2. Validate title (non-empty, ≤200 chars) and description (≤200 chars)
3. Generate unique ID
4. Create Task object with status='todo' and current timestamp
5. Update state: `setTasks([...tasks, newTask])`
6. useEffect triggers LocalStorage save
7. React re-renders Board with new task in To Do column

**Task Edit Flow**
1. User clicks task, opens TaskForm with existing values
2. User modifies fields and submits
3. Validate title and description
4. Update state: `setTasks(tasks.map(t => t.id === id ? {...t, title, description} : t))`
5. useEffect triggers LocalStorage save
6. React re-renders task with updated values

**Task Delete Flow**
1. User clicks delete button
2. Update state: `setTasks(tasks.filter(t => t.id !== id))`
3. useEffect triggers LocalStorage save
4. React re-renders Board without deleted task

**Task Move Flow**
1. User drags task to different column
2. onDragEnd handler receives DropResult
3. Calculate new status from destination.droppableId
4. Reorder tasks array maintaining column order
5. Update state with reordered tasks
6. useEffect triggers LocalStorage save
7. React re-renders Board with task in new position

**LocalStorage Persistence**

Given the expected dataset size, synchronous LocalStorage operations are acceptable for small single-user datasets.

```typescript
// Save effect
useEffect(() => {
  try {
    const state: BoardState = { tasks };
    localStorage.setItem('kanban-board-state', JSON.stringify(state));
  } catch (error) {
    setError('Failed to save board state');
    console.error('LocalStorage save error:', error);
  }
}, [tasks]);

// Load effect
useEffect(() => {
  try {
    const saved = localStorage.getItem('kanban-board-state');
    if (saved) {
      const state: BoardState = JSON.parse(saved);
      setTasks(state.tasks || []);
    }
  } catch (error) {
    console.error('LocalStorage load error:', error);
    setTasks([]);
  }
}, []);

// ID generation inline in App.tsx
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Responsive Design Strategy

**Breakpoint**: 768px (tablet/desktop threshold)

**Desktop Layout (≥768px)**
- Horizontal three-column layout using CSS Grid
- Fixed column widths with gap spacing
- Columns fill viewport height
- Scrollable task lists within columns

```css
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  height: calc(100vh - 4rem);
}

.column {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.task-list {
  overflow-y: auto;
  flex: 1;
}
```

**Mobile Layout (<768px)**
- Vertical stacked columns using Flexbox
- Full-width columns
- Each column shows all tasks
- Scrollable page

```css
@media (max-width: 767px) {
  .board {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: auto;
  }
  
  .column {
    width: 100%;
  }
}
```

**Touch Support**
- @hello-pangea/dnd provides built-in touch event handling
- Increased touch target sizes (min 44x44px)
- Visual feedback for drag operations on mobile

### File Structure

```
kanban-task-management/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── Board.tsx
│   │   ├── Column.tsx
│   │   ├── Task.tsx
│   │   ├── TaskForm.tsx
│   │   └── ErrorBoundary.tsx
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   ├── App.css
│   │   ├── Board.css
│   │   ├── Column.css
│   │   ├── Task.css
│   │   └── TaskForm.css
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

**File Responsibilities**

`components/App.tsx`: Root component, state management, inline LocalStorage logic, inline ID generation
`components/Board.tsx`: DragDropContext wrapper, column rendering
`components/Column.tsx`: Droppable wrapper, task filtering and display
`components/Task.tsx`: Draggable wrapper, task card UI
`components/TaskForm.tsx`: Modal form for create/edit operations
`components/ErrorBoundary.tsx`: Error boundary wrapper for runtime error handling

`types/index.ts`: TypeScript interfaces (Task, TaskStatus, BoardState)

`styles/*.css`: Component-specific styles with BEM naming convention


## Correctness Properties

For a 15-20 hour recruitment demo, we focus on core properties that validate the most critical system behaviors. The following properties will be implemented as property-based tests:

### Property 1: All tasks have unique IDs

For any set of task titles, when creating tasks using the application's generateId() function, each task should have a unique id property that differs from all other task IDs.

Note: ID generation using timestamp + random is probabilistic. For a single-user application with <200 tasks, collision probability is negligible and acceptable.

**Validates: Requirements 7.1**

### Property 2: Dropping tasks in different columns updates status correctly

For any task dragged from one column and dropped in a different column, the task's status property should be updated to match the target column's status value ("todo" for To Do column, "inprogress" for In Progress column, "done" for Done column).

**Validates: Requirements 5.3**

### Property 3: Task validation invariants are maintained

For any task in the application state:
- Its title property should be a non-empty string with length ≤ 200 characters
- Its description property should be a string with length ≤ 200 characters (can be empty)
- Its status property should be one of: "todo", "inprogress", or "done"

**Validates: Requirements 7.2, 7.3, 7.4**

### Property 4: LocalStorage round-trip preserves state

For any board state containing tasks, saving that state to LocalStorage and then loading it should restore an equivalent board state with all tasks having identical property values (id, title, description, status, createdAt).

**Validates: Requirements 6.4**

## Error Handling

### Validation Errors

**Title Validation**
- Empty or whitespace-only titles: Display "Title is required" message
- Titles exceeding 200 characters: Display "Title must be 200 characters or less" message
- Validation occurs on form submission, not on input change
- Invalid submissions do not close the form or modify state

**Description Validation**
- Descriptions exceeding 200 characters: Display "Description must be 200 characters or less" message
- Validation occurs on form submission
- Empty descriptions are valid

**Error Display**
- Validation errors appear inline near the relevant form field
- Errors are styled with red text and error icon
- Errors clear when user corrects the input
- Multiple errors can display simultaneously

### LocalStorage Errors

**Save Failures**
- Catch exceptions from `localStorage.setItem()`
- Display inline error banner at top of board: "Failed to save board state"
- Log error to console for debugging
- Application continues functioning with in-memory state
- Common causes: Storage quota exceeded, private browsing mode

**Load Failures**
- Catch exceptions from `localStorage.getItem()` and `JSON.parse()`
- Log error to console
- Initialize with empty board state
- Display inline error banner: "Could not load saved board"
- Common causes: Corrupted data, invalid JSON

**Error Display**
- Error banner appears at top of board with red background and close button
- Clicking close button dismisses the error

**Error Recovery**
```typescript
try {
  const saved = localStorage.getItem('kanban-board-state');
  if (saved) {
    const state = JSON.parse(saved);
    setTasks(state.tasks || []);
  }
} catch (error) {
  console.error('Failed to load board state:', error);
  setTasks([]);
  setError('Could not load saved board');
}
```

### Drag-and-Drop Errors

**Invalid Drop Targets**
- @hello-pangea/dnd handles invalid drops automatically
- Dropping outside droppable areas returns task to original position
- No error message needed (expected behavior)

### Concurrent Modifications

**State Centralization**
- State updates are centralized in the App component, reducing risk of inconsistent state
- Single source of truth prevents conflicting updates
- No optimistic updates that could fail

### Runtime Errors

**Error Boundary**
- ErrorBoundary component wraps the entire App component at the root level
- Catches rendering errors in component tree
- Display fallback UI: "Something went wrong. Please refresh the page."
- Log error details to console
- Prevents entire app crash
- Implemented in components/ErrorBoundary.tsx

```typescript
// In main.tsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

### ID Generation Fallback

**crypto.randomUUID() Unavailable**
- Check for `crypto.randomUUID` availability
- Fallback to `Date.now() + Math.random()` concatenation
- Collision risk is acceptable for single-user application
- No error message needed (transparent fallback)
- Implementation is inline in App.tsx component

```typescript
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

## Testing Strategy

### Dual Testing Approach

This application requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** verify specific examples, edge cases, and integration points:
- Specific task creation with known values
- Form validation with specific invalid inputs (empty title, 201-character description)
- LocalStorage integration with mocked storage
- Component rendering with specific props
- Error boundary behavior with thrown errors
- Drag-and-drop operations with specific source/destination combinations

**Property-Based Tests** verify universal properties across randomized inputs:
- ID uniqueness across any set of tasks
- Status updates work correctly for any column transition
- Validation invariants hold for any task in state
- LocalStorage round-trip preserves any board state

Both approaches are complementary and necessary. Unit tests catch concrete bugs and verify specific behaviors, while property tests verify general correctness across the input space.

### Testing Focus for 15-20 Hour Scope

Testing focuses on core integration tests (create, edit, delete, move flows) and 2-3 property tests (ID uniqueness, validation invariants). Additional edge case tests are added as time permits.

This honest scope ensures deliverable, high-quality tests rather than an incomplete comprehensive suite.

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: kanban-task-management, Property {number}: {property_text}`

**Example Property Test Structure**:
```typescript
import fc from 'fast-check';

// Feature: kanban-task-management, Property 1: All tasks have unique IDs
test('all tasks have unique IDs', () => {
  fc.assert(
    fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 200 })),
      (titles) => {
        // Use the actual generateId() function from the app
        const tasks = titles.map(title => ({
          id: generateId(),
          title,
          description: '',
          status: 'todo' as const,
          createdAt: new Date().toISOString()
        }));
        
        const ids = tasks.map(t => t.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Component Tests** (React Testing Library):
- Render each component with various props
- Verify DOM structure and content
- Simulate user interactions (click, drag, input)
- Assert state changes and callbacks

**Integration Tests**:
- Full App component with LocalStorage mocked
- Complete user flows (create → edit → delete)
- Drag-and-drop operations across columns
- Form validation and error display

**Edge Cases**:
- Empty board state
- LocalStorage quota exceeded
- Corrupted LocalStorage data
- Missing crypto.randomUUID
- Very long task titles/descriptions (boundary testing at 200 chars)

### Test Coverage Goals

Critical user flows shall be covered by automated tests:
- Task creation flow (form validation → state update → LocalStorage save → UI render)
- Task editing flow (open form → modify → save → update)
- Task deletion flow (click delete → remove from state)
- Task movement flow (drag → drop → status update → reorder)
- LocalStorage persistence (save on change → load on mount)
