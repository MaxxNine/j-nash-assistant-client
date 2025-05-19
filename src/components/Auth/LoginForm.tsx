import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading, clearError } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        await login(username, password);
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form-john-nash"> {/* Classe para estilização */}
            <h2>Bem-vindo a John Nash</h2>
            <p className="auth-subtitle">Seu assistente doméstico inteligente.</p>

            {error && <p className="error-message">{error}</p>}

            <div>
                <label htmlFor="login-username">Seu Nome de Usuário:</label>
                <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: ada_lovelace"
                    required
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="login-password">Sua Senha Secreta:</label>
                <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                />
            </div>

            <button type="submit" disabled={isLoading} className="auth-button">
                {isLoading ? 'Conectando...' : 'Entrar no Universo Nash'}
            </button>

            <p className="auth-switch-link">
                Primeira vez por aqui? <Link to="/register">Crie sua conta!</Link>
            </p>
        </form>
    );
};

export default LoginForm;