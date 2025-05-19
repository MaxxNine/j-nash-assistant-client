import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, error, isLoading, clearError } = useAuth();
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        setFormError(null);
        if (password.length < 6) {
            setFormError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setFormError('As senhas não coincidem.');
            return;
        }
        await register(username, password);
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form-john-nash"> {/* Classe para estilização */}
            <h2>Junte-se à Equipe Nash</h2>
            <p className="auth-subtitle">Crie sua conta para começar a organizar.</p>

            {error && <p className="error-message">{error}</p>}
            {formError && <p className="error-message">{formError}</p>}

            <div>
                <label htmlFor="register-username">Escolha um Nome de Usuário:</label>
                <input
                    id="register-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: alan_turing"
                    required
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="register-password">Crie uma Senha Forte:</label>
                <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="register-confirm-password">Confirme Sua Senha:</label>
                <input
                    id="register-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    disabled={isLoading}
                />
            </div>

            <button type="submit" disabled={isLoading} className="auth-button">
                {isLoading ? 'Criando Conta...' : 'Registrar e Organizar'}
            </button>

            <p className="auth-switch-link">
                Já faz parte? <Link to="/login">Faça o login!</Link>
            </p>
        </form>
    );
};

export default RegisterForm;