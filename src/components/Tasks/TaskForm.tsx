import React, { useState, FormEvent, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { NewTaskPayload, Task, TaskStatus, UpdateTaskPayload, TaskRecurrence, TASK_RECURRENCES } from '../../types';

interface TaskFormProps {
    taskToEdit?: Task | null;
    onFormClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ taskToEdit, onFormClose }) => {
    const [content, setContent] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [recurrence, setRecurrence] = useState<TaskRecurrence>('Esporádicas');
    const [isGeneral, setIsGeneral] = useState(false);
    const [status, setStatus] = useState<TaskStatus>('pending');

    // Corrigido para usar isLoadingTasks do contexto
    const { addTask, updateTask, isLoadingTasks, error: taskContextError } = useTasks();

    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading local para a submissão do form

    useEffect(() => {
        if (taskToEdit) {
            setContent(taskToEdit.content);
            setDueDate(taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '');
            setRecurrence(taskToEdit.recurrence);
            setIsGeneral(taskToEdit.is_general);
            setStatus(taskToEdit.status);
        } else {
            setContent('');
            setDueDate('');
            setRecurrence('Esporádicas');
            setIsGeneral(false);
            setStatus('pending');
        }
    }, [taskToEdit]);

    useEffect(() => {
        if (taskContextError) {
            setFormError(taskContextError);
        } else {
            // Não limpar o formError aqui diretamente, pois pode ser um erro local do form
            // Apenas se o erro do contexto for resolvido, poderíamos considerar limpar
            // Mas é mais seguro deixar o erro do form ser tratado pelo próprio form
        }
    }, [taskContextError]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!content.trim()) {
            setFormError('O conteúdo da tarefa é obrigatório.');
            return;
        }

        setIsSubmitting(true);

        const payload: NewTaskPayload | UpdateTaskPayload = {
            content,
            due_date: dueDate || undefined,
            recurrence: recurrence,
            is_general: isGeneral,
            status: status,
        };

        let success = false;
        try {
            if (taskToEdit) {
                const result = await updateTask(taskToEdit.id, payload);
                if (result) success = true;
            } else {
                const result = await addTask(payload as NewTaskPayload);
                if (result) success = true;
            }

            // Verifica se a operação foi bem-sucedida E se não há erro pendente do contexto
            if (success && !taskContextError) {
                onFormClose();
            } else if (taskContextError) { // Se houve erro no contexto durante a operação
                setFormError(taskContextError); // Exibe o erro do contexto no formulário
            }
        } catch (err: any) {
            setFormError(err.message || "Ocorreu um erro inesperado ao submeter o formulário.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Combina o loading do contexto (isLoadingTasks) com o loading local (isSubmitting)
    const currentOperationIsLoading = isLoadingTasks || isSubmitting;

    return (
        <form onSubmit={handleSubmit} className="task-form-john-nash">
            <h3>{taskToEdit ? 'Analisar Equação (Editar Tarefa)' : 'Nova Hipótese (Nova Tarefa)'}</h3>
            {/* Exibe erro local do form ou erro do contexto se não houver erro local */}
            {(formError || taskContextError) && <p className="error-message">{formError || taskContextError}</p>}

            <div>
                <label htmlFor="task-content">Descrição da Tarefa:</label>
                <textarea
                    id="task-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ex: Resolver o enigma do universo ou comprar pão..."
                    rows={3}
                    required
                    disabled={currentOperationIsLoading}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="task-due-date">Prazo Final (Opcional):</label>
                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        disabled={currentOperationIsLoading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="task-recurrence">Recorrência:</label>
                    <select
                        id="task-recurrence"
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
                        disabled={currentOperationIsLoading}
                        required
                    >
                        {TASK_RECURRENCES.map(rec => (
                            <option key={rec} value={rec}>{rec}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="task-status">Status Atual:</label>
                    <select
                        id="task-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                        disabled={currentOperationIsLoading}
                    >
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="completed">Concluída</option>
                    </select>
                </div>
                <div className="form-group checkbox-group">
                    <label htmlFor="task-is-general">
                        <input
                            id="task-is-general"
                            type="checkbox"
                            checked={isGeneral}
                            onChange={(e) => setIsGeneral(e.target.checked)}
                            disabled={currentOperationIsLoading}
                        />
                        Tarefa Geral (visível para todos na casa)
                    </label>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" disabled={currentOperationIsLoading} className="submit-button">
                    {currentOperationIsLoading ? 'Processando...' : (taskToEdit ? 'Atualizar Teorema' : 'Registrar Hipótese')}
                </button>
                <button type="button" onClick={onFormClose} disabled={currentOperationIsLoading} className="cancel-button">
                    Arquivar Ideia (Cancelar)
                </button>
            </div>
        </form>
    );
};

export default TaskForm;