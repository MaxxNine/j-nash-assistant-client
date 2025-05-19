import React from 'react';
import TaskColumn from './TaskColumn';
import { Task, TaskStatus } from '../../types';

interface KanbanBoardProps {
    tasks: Task[];
    onEditTask: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onEditTask }) => {
    const getTasksByStatus = (status: TaskStatus): Task[] => {
        return tasks.filter(task => task.status === status);
    };

    const pendingTasks = getTasksByStatus('pending');
    const inProgressTasks = getTasksByStatus('in_progress');
    const completedTasks = getTasksByStatus('completed');

    return (
        <div className="kanban-board-john-nash">
            <TaskColumn status="pending" tasks={pendingTasks} title="A Fazer" onEditTask={onEditTask} />
            <TaskColumn status="in_progress" tasks={inProgressTasks} title="Em Andamento" onEditTask={onEditTask} />
            <TaskColumn status="completed" tasks={completedTasks} title="Concluídas" onEditTask={onEditTask} />
        </div>
    );
};

export default KanbanBoard;