// pwa-client/src/contexts/TaskContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react'; // Adicionado useRef
import { Task, NewTaskPayload, UpdateTaskPayload, WebSocketMessage, UserBasicInfo } from '../types';
import * as taskService from '../services/taskService';
import * as userService from '../services/userService';
import { WebSocketService } from '../services/websocketService';
import { AuthContext } from './AuthContext';

// ... TaskViewMode e TaskContextType ... (sem mudanças aqui)
export type TaskViewMode = 'my_personal' | 'general_tasks' | 'user_tasks'; // Re-declarando se TaskContextType não for exportado

interface TaskContextType {
    allTasks: Task[];
    myTasks: Task[];
    generalTasks: Task[];
    tasksForUser: (userId: number) => Task[];
    users: UserBasicInfo[];

    isLoadingTasks: boolean;
    isLoadingUsers: boolean;
    error: string | null;

    fetchInitialData: () => Promise<void>;
    addTask: (taskData: NewTaskPayload) => Promise<Task | null>;
    updateTask: (taskId: number, taskData: UpdateTaskPayload) => Promise<Task | null>;
    deleteTask: (taskId: number) => Promise<boolean>;

    // wsService: WebSocketService | null; // Removido da exportação do contexto, gerenciado internamente
}


export const TaskContext = createContext<TaskContextType | undefined>(undefined);

console.log("TaskContext: Script loaded (outside provider)");

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const authContext = useContext(AuthContext);
    const currentUser = authContext?.user;

    const [rawHouseholdTasks, setRawHouseholdTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<UserBasicInfo[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true); // Começa como true
    const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true); // Começa como true
    const [error, setError] = useState<string | null>(null);

    // Usar useRef para o WebSocketService para evitar que ele seja uma dependência de useEffect que o modifica.
    const wsServiceRef = useRef<WebSocketService | null>(null);

    console.log("TaskContext: Provider rendering. isLoadingTasks:", isLoadingTasks, "Token from AuthContext:", authContext?.token ? "Exists" : "null");

    const myTasks = React.useMemo(() =>
        currentUser ? rawHouseholdTasks.filter(t => t.user_id === currentUser.id && !t.is_general) : [],
        [rawHouseholdTasks, currentUser]);

    const generalTasks = React.useMemo(() =>
        rawHouseholdTasks.filter(t => t.is_general),
        [rawHouseholdTasks]);

    const tasksForUser = useCallback((userId: number) =>
        rawHouseholdTasks.filter(t => t.user_id === userId && !t.is_general),
        [rawHouseholdTasks]);

    const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
        console.log('TaskContext: WebSocket message received:', message.type, message.payload);
        const affectedTaskPayload = message.payload;

        switch (message.type) {
            case 'TASK_CREATED':
                if (affectedTaskPayload && typeof affectedTaskPayload === 'object' && 'id' in affectedTaskPayload) {
                    setRawHouseholdTasks(prevTasks => {
                        // Evitar duplicatas se a ação já foi refletida por uma chamada de API otimista
                        if (prevTasks.find(task => task.id === (affectedTaskPayload as Task).id)) {
                            return prevTasks.map(task => task.id === (affectedTaskPayload as Task).id ? (affectedTaskPayload as Task) : task);
                        }
                        return [...prevTasks, affectedTaskPayload as Task];
                    });
                }
                break;
            case 'TASK_UPDATED':
                if (affectedTaskPayload && typeof affectedTaskPayload === 'object' && 'id' in affectedTaskPayload) {
                    setRawHouseholdTasks(prevTasks =>
                        prevTasks.map(task => (task.id === (affectedTaskPayload as Task).id ? (affectedTaskPayload as Task) : task))
                    );
                }
                break;
            case 'TASK_DELETED':
                if (affectedTaskPayload && typeof affectedTaskPayload === 'object' && 'id' in affectedTaskPayload) {
                    setRawHouseholdTasks(prevTasks => prevTasks.filter(task => task.id !== (affectedTaskPayload as { id: number }).id));
                }
                break;
            case 'AUTH_SUCCESS': // Mensagem do nosso backend WebSocket
                console.log("TaskContext: WebSocket authentication successful via message.");
                break;
            case 'AUTH_FAIL':
                console.error("TaskContext: WebSocket authentication failed via message. Token might be invalid.");
                // Poderia deslogar o usuário aqui se o token for consistentemente inválido
                // authContext?.logout();
                break;
            default:
                console.log('TaskContext: Unhandled WebSocket message type:', message.type);
        }
    }, []); // Nenhuma dependência, estável.

    useEffect(() => {
        console.log("TaskContext: WebSocket effect running. Token:", authContext?.token ? "Exists" : "null", "wsServiceRef.current:", wsServiceRef.current ? "Exists" : "null");
        if (authContext?.token) {
            if (!wsServiceRef.current) { // Só conectar se não houver instância ativa
                console.log("TaskContext: Token available and no active WebSocket service. Creating and connecting...");
                const service = new WebSocketService(authContext.token, handleWebSocketMessage);
                service.connect();
                wsServiceRef.current = service;
            } else {
                console.log("TaskContext: Token available and WebSocket service already exists. Ensuring it's connected (or connecting).");
                // Se já existe, e se desconectou por algum motivo (ex: erro de rede, não auth),
                // o próprio serviço tentará reconectar. Se a conexão foi fechada por token inválido (1008),
                // ele não reconectará. Se o token mudou (ex: re-login), precisamos de uma nova instância.
                // A lógica atual de criar uma NOVA instância se o token mudar pode estar no lugar errado.
                // Esta lógica é mais para quando o token *aparece*.
            }
        } else { // Sem token
            if (wsServiceRef.current) {
                console.log("TaskContext: No token. Disconnecting existing WebSocket service.");
                wsServiceRef.current.disconnect();
                wsServiceRef.current = null;
            } else {
                console.log("TaskContext: No token and no active WebSocket service. Nothing to do.");
            }
        }

        // Cleanup quando o componente TaskProvider é desmontado ou ANTES que o effect rode novamente se token mudar.
        return () => {
            console.log("TaskContext: WebSocket effect cleanup. Current service:", wsServiceRef.current ? "Exists" : "null");
            if (wsServiceRef.current) {
                console.log("TaskContext: Disconnecting WebSocket service from cleanup.");
                wsServiceRef.current.disconnect();
                wsServiceRef.current = null; // Importante para permitir nova conexão se o token voltar
            }
        };
        // Cuidado aqui: se authContext.token for a ÚNICA dependência, e ele for estável, ok.
        // handleWebSocketMessage é estável por causa do useCallback([]).
        // Se o objeto authContext em si mudar a cada render (mesmo que o token não mude), isso causaria problemas.
        // Mas como estamos pegando authContext?.token, deve ser seguro.
    }, [authContext?.token, handleWebSocketMessage]);


    const fetchInitialData = useCallback(async () => {
        if (!authContext?.isAuthenticated) {
            console.log("TaskContext: fetchInitialData - Not authenticated, skipping fetch.");
            setRawHouseholdTasks([]);
            setUsers([]);
            setIsLoadingTasks(false); // Garantir que loading seja false
            setIsLoadingUsers(false);
            return;
        }

        console.log("TaskContext: fetchInitialData - Authenticated, fetching data...");
        setIsLoadingTasks(true);
        setIsLoadingUsers(true);
        setError(null);

        try {
            const [fetchedTasks, fetchedUsers] = await Promise.all([
                taskService.getAllHouseholdTasks(),
                userService.getAllUsers()
            ]);
            console.log("TaskContext: fetchInitialData - Data fetched successfully. Tasks:", fetchedTasks.length, "Users:", fetchedUsers.length);
            setRawHouseholdTasks(fetchedTasks);
            setUsers(fetchedUsers);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Falha ao buscar dados iniciais.';
            setError(errorMessage);
            console.error("TaskContext: fetchInitialData - Error:", errorMessage, err);
            setRawHouseholdTasks([]);
            setUsers([]);
        } finally {
            setIsLoadingTasks(false);
            setIsLoadingUsers(false);
            console.log("TaskContext: fetchInitialData - Finished.");
        }
    }, [authContext?.isAuthenticated]); // Depende apenas de isAuthenticated

    useEffect(() => {
        console.log("TaskContext: Effect for fetchInitialData running. isAuthenticated:", authContext?.isAuthenticated);
        // A lógica de `WorkspaceInitialData` já verifica `isAuthenticated`
        fetchInitialData();
    }, [fetchInitialData]); // `WorkspaceInitialData` é estável se `isAuthenticated` for estável.

    const addTask = useCallback(async (taskData: NewTaskPayload): Promise<Task | null> => {
        if (!authContext?.isAuthenticated) {
            console.error("TaskContext: addTask - Not authenticated.");
            setError("Não autenticado para adicionar tarefa.");
            return null;
        }
        setError(null);
        console.log("TaskContext: addTask - Adding task:", taskData.content);
        try {
            const newTask = await taskService.createTask(taskData);
            console.log("TaskContext: addTask - Task added successfully via API:", newTask?.id);
            // A atualização do estado de `rawHouseholdTasks` deve vir via WebSocket.
            // Se precisar de update otimista aqui, pode ser feito, mas cuidado com duplicatas.
            return newTask;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || 'Falha ao adicionar tarefa.';
            setError(errMsg);
            console.error("TaskContext: addTask - Error:", errMsg, err);
            return null;
        }
    }, [authContext?.isAuthenticated]);

    const updateTask = useCallback(async (taskId: number, taskData: UpdateTaskPayload): Promise<Task | null> => {
        if (!authContext?.isAuthenticated) {
            console.error("TaskContext: updateTask - Not authenticated.");
            setError("Não autenticado para atualizar tarefa.");
            return null;
        }
        setError(null);
        console.log("TaskContext: updateTask - Updating task:", taskId);
        try {
            const updatedTask = await taskService.updateTaskById(taskId, taskData);
            console.log("TaskContext: updateTask - Task updated successfully via API:", updatedTask?.id);
            // Atualização via WebSocket.
            return updatedTask;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || 'Falha ao atualizar tarefa.';
            setError(errMsg);
            console.error("TaskContext: updateTask - Error:", errMsg, err);
            return null;
        }
    }, [authContext?.isAuthenticated]);

    const deleteTask = useCallback(async (taskId: number): Promise<boolean> => {
        if (!authContext?.isAuthenticated) {
            console.error("TaskContext: deleteTask - Not authenticated.");
            setError("Não autenticado para deletar tarefa.");
            return false;
        }
        setError(null);
        console.log("TaskContext: deleteTask - Deleting task:", taskId);
        try {
            await taskService.deleteTaskById(taskId);
            console.log("TaskContext: deleteTask - Task deleted successfully via API:", taskId);
            // Atualização via WebSocket.
            return true;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || 'Falha ao deletar tarefa.';
            setError(errMsg);
            console.error("TaskContext: deleteTask - Error:", errMsg, err);
            return false;
        }
    }, [authContext?.isAuthenticated]);


    return (
        <TaskContext.Provider
            value={{
                allTasks: rawHouseholdTasks,
                myTasks,
                generalTasks,
                tasksForUser,
                users,
                isLoadingTasks,
                isLoadingUsers,
                error,
                fetchInitialData, // Expor para pull-to-refresh, por exemplo
                addTask,
                updateTask,
                deleteTask,
                // wsService: wsServiceRef.current, // Não expor diretamente se não for necessário para os consumidores
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};