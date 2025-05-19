import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm';

const RegisterPage: React.FC = () => {
    return (
        // A classe auth-page-john-nash deve estar no elemento pai para centralizar o form
        <div className="auth-page-john-nash">
            <RegisterForm />
        </div>
    );
};

export default RegisterPage;