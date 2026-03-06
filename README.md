# Kanban Task Management

[![CI](https://github.com/shazamcodes64/gdg-srm-kanban/actions/workflows/ci.yml/badge.svg)](https://github.com/shazamcodes64/gdg-srm-kanban/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, responsive kanban board application for organizing tasks across three workflow stages: To Do, In Progress, and Done. Built with React, TypeScript, and drag-and-drop functionality for intuitive task management.

## 📸 Screenshots

<div align="center">
  <img src="screenshots/kanban-demo.png?v=2" alt="Kanban Board Demo" width="800">
  <p><em>Modern Kanban board with professional UI polish, icon buttons, and toast notifications</em></p>
</div>

## ✨ Highlights

- 🎨 **Professional UI Design** - Modern SaaS-style interface with 8px spacing system and design tokens
- 🎯 **Drag-and-Drop Interface** - Intuitive task management with smooth animations
- 🔔 **Toast Notifications** - Real-time feedback for all user actions (create, edit, delete, move)
- 💾 **Auto-Save** - Never lose your work with automatic LocalStorage persistence
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ♿ **Accessible** - WCAG compliant with keyboard navigation and screen reader support
- ⚡ **Fast & Lightweight** - Built with Vite for optimal performance
- 🧪 **100% Test Coverage** - Comprehensive unit and property-based tests

## Features

- **Visual Task Organization**: Three-column kanban board (To Do, In Progress, Done)
- **Drag-and-Drop**: Intuitive task movement between columns and reordering within columns
- **Task Management**: Create, edit, and delete tasks with titles, descriptions, priorities, and due dates
- **Priority Levels**: Color-coded priority badges (Low, Medium, High, Urgent)
- **Due Date Tracking**: Set due dates with visual overdue indicators
- **Toast Notifications**: Real-time feedback for create, edit, delete, and move operations
- **Icon Buttons**: Clean, modern icon-based actions using Lucide React
- **Search Functionality**: Quick task search across all columns
- **Dark Mode**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Press 'N' to create tasks, 'Esc' to close modals
- **Local Persistence**: Automatic saving to browser LocalStorage
- **Responsive Design**: Optimized for desktop (horizontal layout) and mobile (vertical layout)
- **Accessibility**: Keyboard navigation, semantic HTML, and ARIA labels
- **Touch Support**: Full touch gesture support for mobile devices

## Technology Stack

### Core Technologies
- **React 19**: UI framework with functional components and hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with Grid and Flexbox

### Key Libraries
- **@hello-pangea/dnd**: Drag-and-drop functionality (maintained fork of react-beautiful-dnd)
- **Lucide React**: Modern icon library for clean UI elements
- **Sonner**: Beautiful toast notifications for user feedback
- **fast-check**: Property-based testing for robust validation
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Component testing utilities

## Installation

### Prerequisites
- Node.js 18+ and npm

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd gdg-srm-kanban

# Install dependencies
npm install
```

## Usage

### Development Server
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Build for Production
Create an optimized production build:
```bash
npm run build
```
The build output will be in the `dist/` directory.

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

### Run Tests
Execute the test suite:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

Run tests with UI:
```bash
npm run test:ui
```

### Linting
Check code quality:
```bash
npm run lint
```

## Architecture Overview

### Component Structure
```
ErrorBoundary (error handling wrapper)
└── App (root component, state management)
    ├── Board (drag-and-drop context)
    │   ├── Column (To Do)
    │   │   └── Task[]
    │   ├── Column (In Progress)
    │   │   └── Task[]
    │   └── Column (Done)
    │       └── Task[]
    └── TaskForm (create/edit modal)
```

### State Management
- Single source of truth in App component using React hooks
- Task state persists automatically to LocalStorage
- Synchronous state updates with immediate UI feedback

### Data Model
```typescript
interface Task {
  id: string;              // UUID
  title: string;           // 1-200 characters
  description: string;     // 0-200 characters
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;        // Optional ISO 8601 date
  createdAt: string;       // ISO 8601 timestamp
}
```

### File Structure
```
src/
├── components/
│   ├── App.tsx              # Root component, state management
│   ├── Board.tsx            # Drag-and-drop context wrapper
│   ├── Column.tsx           # Column container with progress bars
│   ├── Task.tsx             # Individual task card with icon buttons
│   ├── TaskForm.tsx         # Create/edit modal form
│   └── ErrorBoundary.tsx    # Error boundary wrapper
├── utils/
│   └── dragDropUtils.ts     # Drag-and-drop helper functions
├── types/
│   └── index.ts             # TypeScript interfaces
├── styles/
│   ├── App.css              # App layout and header styles
│   ├── Board.css            # Board grid layout
│   ├── Column.css           # Column and progress bar styles
│   ├── Task.css             # Task card and icon button styles
│   └── TaskForm.css         # Modal form styles
├── test/
│   └── [test files]         # Comprehensive test suite
├── main.tsx                 # Application entry point
└── index.css                # Global styles and design tokens
```

## Key Features Explained

### 🎨 Professional UI Design

The application features a modern, polished interface built with professional SaaS design principles:

#### Design System
- **8px Spacing System**: Consistent spacing using design tokens (--space-1 through --space-8)
- **Border Radius Tokens**: Standardized corner radii (--radius-sm, --radius-md, --radius-lg)
- **Color Tokens**: Theme-aware CSS variables for seamless light/dark mode switching
- **Utility Classes**: Reusable spacing utilities (p-2, p-4, mb-3, gap-4, etc.)

#### Modern UI Elements
- **Icon Buttons**: Clean, minimal icon-based actions using Lucide React (Edit2, Trash2)
- **Toast Notifications**: Real-time feedback using Sonner for all user actions
- **Progress Bars**: Visual progress indicators in each column showing task distribution
- **Gradient Headers**: Eye-catching gradient backgrounds with smooth transitions
- **Hover Effects**: Subtle animations and elevation changes for better interactivity
- **Empty States**: Helpful messages and icons when columns are empty

#### Priority System
- **🟢 Low**: Nice-to-have items or future considerations
- **🔵 Medium**: Standard tasks with moderate priority
- **🟠 High**: Important tasks with near-term deadlines
- **🔴 Urgent**: Critical issues requiring immediate attention

#### Due Date Management
- **Date Picker**: Easy-to-use date selection for task deadlines
- **Visual Indicators**: Calendar emoji (📅) shows due dates at a glance
- **Overdue Alerts**: Red border and warning emoji (⚠️) for overdue tasks
- **Automatic Detection**: System automatically checks and highlights overdue tasks

### Drag-and-Drop
- Powered by @hello-pangea/dnd for smooth, accessible interactions
- Supports mouse, touch, and keyboard navigation
- Visual feedback during drag operations with scale and shadow effects
- Automatic status updates when tasks move between columns
- Toast notifications confirm successful task moves

### Local Persistence
- All changes automatically saved to browser LocalStorage
- Data persists across browser sessions
- Graceful error handling for storage failures
- No backend required

### Responsive Design
- **Desktop (≥768px)**: Horizontal three-column layout
- **Mobile (<768px)**: Vertical stacked columns
- Touch-optimized for mobile devices
- Minimum 44x44px touch targets

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels for screen readers
- Visible focus indicators
- Error messages for form validation

## Browser Support

- Modern browsers with ES6+ support
- LocalStorage API required
- Recommended: Chrome, Firefox, Safari, Edge (latest versions)

## Development Notes

### Testing Strategy
The project uses a dual testing approach:
- **Unit Tests**: Specific examples and edge cases
- **Property-Based Tests**: Universal properties across randomized inputs

Key properties tested:
- All tasks have unique IDs
- Drag-and-drop updates status correctly
- Task validation invariants are maintained
- LocalStorage round-trip preserves state

### Error Handling
- Form validation with inline error messages
- LocalStorage failure recovery
- Error boundary for runtime errors
- Graceful degradation when features unavailable

## Project Scope

This is a frontend-focused demonstration project emphasizing:
- Professional UI/UX design with modern SaaS patterns
- Core CRUD operations with real-time feedback
- Drag-and-drop interaction with accessibility support
- Local persistence with automatic saving
- Responsive design for all device sizes
- Clean, maintainable, and well-tested code
- Comprehensive test coverage (100 tests passing)

## License

This project is for demonstration purposes.
