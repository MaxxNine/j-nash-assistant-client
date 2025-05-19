import React from 'react';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
    return (
        // A classe auth-page-john-nash deve estar no elemento pai para centralizar o form
        <div className="auth-page-john-nash">
            <LoginForm />
        </div>
    );
};

export default LoginPage;