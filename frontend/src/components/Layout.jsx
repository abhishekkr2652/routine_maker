import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, Users, BookOpen, Layers, UserCircle, Home } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Layers className="text-primary" size={32} color="#4F46E5" />
          <span>NITJSR Routine</span>
        </div>
        
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/batches" className={`nav-item ${isActive('/batches')}`}>
            <Users size={20} /> Batches
          </Link>
          <Link to="/faculties" className={`nav-item ${isActive('/faculties')}`}>
            <UserCircle size={20} /> Faculties
          </Link>
          <Link to="/subjects" className={`nav-item ${isActive('/subjects')}`}>
            <BookOpen size={20} /> Subjects
          </Link>
          <Link to="/routine-builder" className={`nav-item ${isActive('/routine-builder')}`}>
            <Calendar size={20} /> Routine Builder
          </Link>
          <Link to="/faculty-routine" className={`nav-item ${isActive('/faculty-routine')}`}>
            <UserCircle size={20} /> Faculty Timetable
          </Link>
        </nav>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
