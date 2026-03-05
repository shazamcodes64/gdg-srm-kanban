import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { STATUS_LABELS } from '../types';
import type { Task } from '../types';
import { Column } from './Column';
import '../styles/Board.css';

export interface BoardProps {
  tasks: Task[];
  onDragEnd: (result: DropResult) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function Board({ tasks, onDragEnd, onEditTask, onDeleteTask }: BoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        <Column
          status="todo"
          label={STATUS_LABELS.todo}
          tasks={tasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <Column
          status="inprogress"
          label={STATUS_LABELS.inprogress}
          tasks={tasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <Column
          status="done"
          label={STATUS_LABELS.done}
          tasks={tasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </div>
    </DragDropContext>
  );
}
