import React from 'react';
import ReactDOM from 'react-dom/client';
// App.tsx não é mais o ponto de entrada direto do router, mas sim um componente de layout
// import App from './App.tsx' <= Remover esta linha
import { AppRouter } from './router'; // Importa o AppRouter
import './index.css';
import './theme.css';
import './auth.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter /> {/* Renderiza o AppRouter que contém o AuthProvider e TaskProvider via App.tsx */}
  </React.StrictMode>
);