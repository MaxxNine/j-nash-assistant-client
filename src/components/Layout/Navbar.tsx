import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Usar NavLink para active states
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav className="navbar-john-nash">
            <div className="logo">
                <Link to="/">John Nash</Link>
            </div>
            <div className="nav-links">
                {isAuthenticated && user ? (
                    <>
                        <span className="nav-user-greeting">Olá, {user.username}!</span>
                        {/* Adicionar NavLinks para outras seções se necessário */}
                        {/* <NavLink to="/dashboard" className={({isActive}) => isActive ? "active-link" : ""}>Quadro</NavLink> */}
                        <button onClick={logout} className="nav-button logout-button">Sair</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" className={({ isActive }) => isActive ? "nav-button active-link" : "nav-button"}>
                            Login
                        </NavLink>
                        <NavLink to="/register" className={({ isActive }) => isActive ? "nav-button active-link" : "nav-button"}>
                            Registrar
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;