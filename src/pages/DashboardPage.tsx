import React, { useState, useMemo, useEffect } from 'react';
import KanbanBoard from '../components/Tasks/KanbanBoard';
import TaskForm from '../components/Tasks/TaskForm';
import { Task, TaskRecurrence, TASK_RECURRENCES } from '../types'; // Importar TaskRecurrence e TASK_RECURRENCES
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';

type ViewMode = 'my_personal' | 'all_general' | 'user_specific';

const DashboardPage: React.FC = () => {
    const {
        myTasks,
        generalTasks,
        tasksForUser,
        users,
        isLoadingTasks,
        isLoadingUsers,
        error,
        fetchInitialData
    } = useTasks();
    const { user: currentUser } = useAuth();

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const [currentView, setCurrentView] = useState<ViewMode>('my_personal');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(
        currentUser ? currentUser.id : null
    );
    const [filterUsername, setFilterUsername] = useState<string>("Minhas Tarefas");

    // NOVO: Estado para o filtro de recorrência
    const [selectedRecurrence, setSelectedRecurrence] = useState<TaskRecurrence | 'All'>('All');

    useEffect(() => {
        if (!isLoadingTasks && !isLoadingUsers && currentUser) {
            // Se não estiver carregando e o usuário estiver logado, buscar dados.
            // Isso ajuda a garantir que temos o currentUser.id para o filtro inicial.
            fetchInitialData();
            if (currentView === 'my_personal' && !selectedUserId && currentUser) {
                setSelectedUserId(currentUser.id); // Garante que selectedUserId seja setado para my_personal
                setFilterUsername("Minhas Tarefas Pessoais");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]); // Dependência em currentUser para setar o filtro inicial corretamente

    const handleOpenNewTaskForm = () => {
        setTaskToEdit(null);
        setShowTaskForm(true);
    };

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setShowTaskForm(true);
    };

    const handleFormClose = () => {
        setShowTaskForm(false);
        setTaskToEdit(null);
    };

    const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        setFilterUsername(selectedOption.text); // Atualiza o nome do filtro para o título

        if (value === 'my_personal' && currentUser) {
            setCurrentView('my_personal');
            setSelectedUserId(currentUser.id);
        } else if (value === 'all_general') {
            setCurrentView('all_general');
            setSelectedUserId(null);
        } else if (value.startsWith('user_')) {
            setCurrentView('user_specific');
            setSelectedUserId(Number(value.split('_')[1]));
        }
    };

    const tasksToDisplay = useMemo(() => {
        let baseTasks: Task[] = [];
        if (currentView === 'my_personal' && selectedUserId && currentUser && selectedUserId === currentUser.id) {
            baseTasks = myTasks.filter(t => !t.is_general);
            // console.log("Filtering: My Personal Tasks", baseTasks);
        } else if (currentView === 'all_general') {
            baseTasks = generalTasks;
            // console.log("Filtering: All General Tasks", baseTasks);
        } else if (currentView === 'user_specific' && selectedUserId) {
            baseTasks = tasksForUser(selectedUserId).filter(t => !t.is_general);
            // console.log(`Filtering: User ${selectedUserId} Tasks`, baseTasks);
        }

        // Aplicar filtro de recorrência
        let recurrenceFilteredTasks = baseTasks;
        if (selectedRecurrence !== 'All') {
            recurrenceFilteredTasks = baseTasks.filter(task => task.recurrence === selectedRecurrence);
            // console.log(`Filtering by recurrence ${selectedRecurrence}:`, recurrenceFilteredTasks);
        }

        return recurrenceFilteredTasks.map(task => ({
            ...task,
            username: task.user_id ? (users.find(u => u.id === task.user_id)?.username || "Desconhecido") : (task.is_general ? "Geral" : "Sistema")
        }));

    }, [currentView, selectedUserId, selectedRecurrence, myTasks, generalTasks, tasksForUser, users, currentUser]);


    if (isLoadingTasks || isLoadingUsers) {
        return <div className="container john-nash-loading">Analisando o cosmos de tarefas...</div>;
    }
    // Não mostrar erro global se houver tarefas (o erro pode ser de users, por exemplo)
    if (error && tasksToDisplay.length === 0) {
        return <div className="container error-message">Erro ao consultar o oráculo de Nash: {error}</div>;
    }
    if (!currentUser) {
        return <div className="container">Por favor, faça login para ver o quadro.</div>;
    }

    return (
        <div className="container dashboard-john-nash">
            <header className="dashboard-header">
                <div className="header-title-section">
                    <h2>Quadro de {filterUsername}</h2>
                    {selectedRecurrence !== 'All' && <p className='header-subtitle-recurrence'>Recorrência: {selectedRecurrence}</p>}
                    <p className="header-subtitle">Organize suas ideias e colabore com a equipe Nash.</p>
                </div>
                <div className="controls-section">
                    <div className="view-selector">
                        <label htmlFor="view-mode-select">Visualizar Tarefas De:</label>
                        <select
                            id="view-mode-select"
                            value={currentView === 'user_specific' && selectedUserId ? `user_${selectedUserId}` : currentView}
                            onChange={handleViewChange}
                        >
                            <option value="my_personal">Minhas Tarefas Pessoais</option>
                            <option value="all_general">Todas Tarefas Gerais</option>
                            {users
                                .filter(u => u.id !== currentUser.id) // Não mostrar o próprio usuário novamente se "Minhas Tarefas" já o cobre
                                .map(u => (
                                    <option key={u.id} value={`user_${u.id}`}>
                                        Tarefas de {u.username}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* NOVO: Dropdown para filtro de recorrência */}
                    <div className="view-selector">
                        <label htmlFor="recurrence-filter-select">Filtrar por Recorrência:</label>
                        <select
                            id="recurrence-filter-select"
                            value={selectedRecurrence}
                            onChange={(e) => setSelectedRecurrence(e.target.value as TaskRecurrence | 'All')}
                        >
                            <option value="All">Todas Recorrências</option>
                            {TASK_RECURRENCES.map(rec => (
                                <option key={rec} value={rec}>{rec}</option>
                            ))}
                        </select>
                    </div>

                    {!showTaskForm && (
                        <button onClick={handleOpenNewTaskForm} className="add-task-button">
                            Nova Anotação
                        </button>
                    )}
                </div>
            </header>

            {showTaskForm && <TaskForm taskToEdit={taskToEdit} onFormClose={handleFormClose} />}

            <KanbanBoard tasks={tasksToDisplay} onEditTask={handleEditTask} />
        </div>
    );
};

export default DashboardPage;