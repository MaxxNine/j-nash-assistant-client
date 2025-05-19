// Espelhando os modelos do backend, mas podemos adaptar para o frontend
export interface UserBasicInfo {
  id: number;
  username: string;
  // Não armazenamos password_hash no frontend
}

// Novas categorias de tarefas
export type TaskRecurrence = 'Diárias' | 'Semanais' | 'Quinzenais' | 'Mensais' | 'Anuais' | 'Esporádicas';
export const TASK_RECURRENCES: TaskRecurrence[] = ['Diárias', 'Semanais', 'Quinzenais', 'Mensais', 'Anuais', 'Esporádicas'];


export interface Task {
  id: number;
  user_id: number | null;
  username?: string; // Nome do usuário dono da tarefa
  content: string;
  due_date?: string | null;
  // category?: string | null; // REMOVIDO
  recurrence: TaskRecurrence; // NOVO CAMPO
  status: 'pending' | 'in_progress' | 'completed';
  is_general: boolean;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface NewTaskPayload {
  content: string;
  due_date?: string;
  // category?: string; // REMOVIDO
  recurrence: TaskRecurrence; // OBRIGATÓRIO
  is_general?: boolean;
  status?: TaskStatus;
}

export interface UpdateTaskPayload extends Partial<Omit<NewTaskPayload, 'recurrence'>> { // recurrence é opcional ao atualizar, mas se presente, deve ser do tipo TaskRecurrence
    recurrence?: TaskRecurrence;
    status?: TaskStatus;
}

export interface AuthResponse {
  user: UserBasicInfo;
  token: string;
}

// Mensagem WebSocket
export interface WebSocketMessage {
  type: string; // Ex: 'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'AUTH_SUCCESS', 'ERROR'
  payload?: any;
  message?: string;
}