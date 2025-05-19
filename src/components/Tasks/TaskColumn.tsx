import React from 'react';
import { Task, TaskStatus } from '../../types';
import TaskItem from './TaskItem';

interface TaskColumnProps {
    status: TaskStatus; // Status que esta coluna representa
    tasks: Task[];     // Tarefas filtradas para esta coluna
    title: string;
    onEditTask: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ tasks, title, onEditTask }) => {
    return (
        <div className="task-column-john-nash">
            <h3>{title} <span className="task-count">({tasks.length})</span></h3>
            <div className="task-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskItem key={task.id} task={task} onEdit={onEditTask} />
                    ))
                ) : (
                    <p className="empty-column-message">Nenhuma tarefa por aqui... por enquanto!</p>
                )}
            </div>
        </div>
    );
};

export default TaskColumn;