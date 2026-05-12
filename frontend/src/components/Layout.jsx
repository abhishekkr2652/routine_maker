import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, Users, BookOpen, Layers, UserCircle, Home } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const role = localStorage.getItem('role') || 'department';

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('department');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('auth-change'));
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/National_Institute_of_Technology%2C_Jamshedpur_Logo.svg/1200px-National_Institute_of_Technology%2C_Jamshedpur_Logo.svg.png" 
            alt="NIT Jamshedpur Logo" 
            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <span style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>NIT Jamshedpur</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Routine Management</span>
        </div>
        
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            <Home size={20} /> Dashboard
          </Link>
          
          {role === 'main_admin' ? (
            <>
              <Link to="/faculties" className={`nav-item ${isActive('/faculties')}`}>
                <UserCircle size={20} /> Manage Faculties
              </Link>
              <Link to="/subjects" className={`nav-item ${isActive('/subjects')}`}>
                <BookOpen size={20} /> Manage Subjects
              </Link>
            </>
          ) : (
            <>
              <Link to="/batches" className={`nav-item ${isActive('/batches')}`}>
                <Users size={20} /> Batches
              </Link>
              <Link to="/routine-builder" className={`nav-item ${isActive('/routine-builder')}`}>
                <Calendar size={20} /> Routine Builder
              </Link>
              <Link to="/faculty-routine" className={`nav-item ${isActive('/faculty-routine')}`}>
                <UserCircle size={20} /> Faculty Timetable
              </Link>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', fontSize: '0.9rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>{role === 'main_admin' ? 'Role' : 'Department'}</div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{localStorage.getItem('department')}</div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', paddingLeft: '1rem' }} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', paddingLeft: '1rem', color: '#ef4444' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
