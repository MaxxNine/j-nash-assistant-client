import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { useTasks } from '../../hooks/useTasks';

interface TaskItemProps {
    task: Task;
    onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
    // Corrigido para usar isLoadingTasks do contexto
    const { deleteTask, updateTask, isLoadingTasks } = useTasks();

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja arquivar a tarefa "${task.content}"?`)) {
            setIsDeleting(true);
            await deleteTask(task.id);
            // Não é necessário setIsDeleting(false) aqui se a tarefa for removida da lista,
            // pois o componente será desmontado ou re-renderizado sem esse estado local.
            // Mas se houver erro e a tarefa permanecer, é bom resetar:
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as TaskStatus;
        setIsUpdatingStatus(true);
        await updateTask(task.id, { status: newStatus });
        setIsUpdatingStatus(false);
    };

    // Combina o loading do contexto com os loadings locais para desabilitar botões
    const currentOperationIsLoading = isLoadingTasks || isUpdatingStatus || isDeleting;

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (dateString.length === 10 && dateString.includes('-')) {
                const [year, month, day] = dateString.split('-').map(Number);
                // new Date(year, monthIndex, day) - monthIndex é 0-11
                return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            }
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            return dateString;
        }
    }

    return (
        <div className={`task-item-john-nash status-${task.status}`}>
            <h4>{task.content}</h4>
            <div className="task-details">
                {task.username && !task.is_general && <p className="task-user"><strong>Colaborador:</strong> {task.username}</p>}
                {task.is_general && <p className="task-user"><strong>Tipo:</strong> Tarefa Geral</p>}
                <p><strong>Recorrência:</strong> {task.recurrence}</p>
                <p><strong>Prazo:</strong> {formatDate(task.due_date)}</p>
                <p className="task-status-display">
                    <strong>Status:</strong>
                    <select
                        value={task.status}
                        onChange={handleStatusChange}
                        disabled={currentOperationIsLoading}
                        className="status-select"
                    >
                        <option value="pending">A Fazer</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="completed">Concluída</option>
                    </select>
                </p>
            </div>
            <div className="actions">
                <button
                    onClick={() => onEdit(task)}
                    disabled={currentOperationIsLoading}
                    className="edit-button"
                >
                    Revisar
                </button>
                <button
                    onClick={handleDelete}
                    disabled={currentOperationIsLoading}
                    className="delete-button"
                >
                    Arquivar
                </button>
            </div>
        </div>
    );
};

export default TaskItem;