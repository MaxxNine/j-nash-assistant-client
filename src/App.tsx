import { Outlet } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';

function App() {
  return (
    // AuthProvider deve envolver TaskProvider se TaskProvider depende de AuthContext
    <AuthProvider>
      <TaskProvider>
        <Navbar />
        <main>
          <Outlet /> {/* Rotas aninhadas serão renderizadas aqui */}
        </main>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;