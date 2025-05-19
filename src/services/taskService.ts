import api from './api';
import { Task, NewTaskPayload, UpdateTaskPayload } from '../types';

const API_BASE = '/api/tasks';

export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>(API_BASE);
  return response.data;
};

export const getTaskById = async (taskId: number): Promise<Task> => {
  const response = await api.get<Task>(`${API_BASE}/${taskId}`);
  return response.data;
};

// Modificar createTask e updateTaskById para usar 'recurrence'
export const createTask = async (taskData: NewTaskPayload): Promise<Task> => {
  // taskData já deve ter 'recurrence' conforme NewTaskPayload
  const response = await api.post<Task>(API_BASE, taskData);
  return response.data;
};

export const updateTaskById = async (taskId: number, taskData: UpdateTaskPayload): Promise<Task> => {
  // taskData pode ter 'recurrence'
  const response = await api.put<Task>(`${API_BASE}/${taskId}`, taskData);
  return response.data;
};

// NOVO: Buscar todas as tarefas para a visão "household"
export const getAllHouseholdTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>(`${API_BASE}/all-household`);
  return response.data;
};

export const deleteTaskById = async (taskId: number): Promise<void> => {
  await api.delete(`${API_BASE}/${taskId}`);
};