import React, { JSX } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from '../App'; // O componente App será o layout principal
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/Common/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// Componente para redirecionar se já estiver autenticado
const PublicRouteOnly: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div>Carregando...</div>; // Ou loader
    return !isAuthenticated ? children : <Navigate to="/" replace />;
};


export const AppRouter: React.FC = () => {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <App />, // App.tsx será o layout com Navbar
            children: [
                {
                    element: <ProtectedRoute />, // Protege as rotas aninhadas
                    children: [
                        { index: true, element: <DashboardPage /> },
                        // Adicione outras rotas protegidas aqui
                    ],
                },
                {
                    path: 'login',
                    element: <PublicRouteOnly><LoginPage /></PublicRouteOnly>,
                },
                {
                    path: 'register',
                    element: <PublicRouteOnly><RegisterPage /></PublicRouteOnly>,
                },
            ],
        },
        // Rota catch-all para redirecionar para o dashboard se autenticado, ou login se não
        {
            path: '*',
            element: <Navigate to="/" replace />,
        }
    ]);
    return <RouterProvider router={router} />;
}