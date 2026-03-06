import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { Task as TaskType, TaskStatus } from '../types';
import { Task } from './Task';
import '../styles/Column.css';

export interface ColumnProps {
  status: TaskStatus;
  label: string;
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (id: string) => void;
}

export function Column({ status, label, tasks, onEditTask, onDeleteTask }: ColumnProps) {
  // Filter tasks by status
  const columnTasks = tasks.filter(task => task.status === status);
  
  // Calculate progress percentage (this column's tasks / total tasks)
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((columnTasks.length / totalTasks) * 100) : 0;

  return (
    <section className="column" aria-label={`${label} column`}>
      <h2 className="column-header">
        <span>{label}</span>
        <span className="column-count">{columnTasks.length}</span>
      </h2>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
          title={`${progressPercentage}% of all tasks`}
        />
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {columnTasks.length === 0 ? (
              <div className="column-empty">
                <span className="empty-icon">✨</span>
                <p>No tasks yet</p>
                <p className="empty-hint">Drag tasks here or click "New Task"</p>
              </div>
            ) : (
              columnTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'dragging' : ''}
                    >
                      <Task
                        task={task}
                        index={index}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}
