import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserBasicInfo as User, AuthResponse } from '../types';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('authUser');
                localStorage.removeItem('authToken');
                setToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    const handleAuthResponse = (response: AuthResponse) => {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('authUser', JSON.stringify(response.user));
        setError(null);
    };

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.loginUser(username, password);
            handleAuthResponse(response);
            navigate('/'); // Navegar para o dashboard após login
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha no login.');
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.registerUser(username, password);
            handleAuthResponse(response);
            navigate('/'); // Navegar para o dashboard após registro
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Falha no registro.');
            console.error("Register error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        navigate('/login');
        // Adicionar lógica para fechar WebSocket se estiver aberto
    };

    const clearError = () => {
        setError(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                register,
                logout,
                error,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};