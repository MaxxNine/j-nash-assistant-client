import api from './api';
import { UserBasicInfo } from '../types';

export const getAllUsers = async (): Promise<UserBasicInfo[]> => {
  const response = await api.get<UserBasicInfo[]>('/api/users');
  return response.data;
};