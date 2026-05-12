import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Faculties from './pages/Faculties';
import Subjects from './pages/Subjects';
import RoutineBuilder from './pages/RoutineBuilder';
import FacultyRoutine from './pages/FacultyRoutine';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);
  
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {role === 'main_admin' ? (
              <>
                <Route path="faculties" element={<Faculties />} />
                <Route path="subjects" element={<Subjects />} />
              </>
            ) : (
              <>
                <Route path="batches" element={<Batches />} />
                <Route path="routine-builder" element={<RoutineBuilder />} />
                <Route path="faculty-routine" element={<FacultyRoutine />} />
              </>
            )}
            
            <Route path="*" element={<Dashboard />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
