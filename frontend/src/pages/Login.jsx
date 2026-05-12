import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Building2 } from 'lucide-react';
import api from '../api';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('department', res.data.user.department);
        localStorage.setItem('username', res.data.user.username);
        localStorage.setItem('role', res.data.user.role);
        // Dispatch custom event to let App.jsx know auth state changed
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
      } else {
        const res = await api.post('/auth/register', { username, password, department });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('department', res.data.user.department);
        localStorage.setItem('username', res.data.user.username);
        localStorage.setItem('role', res.data.user.role);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-blob blob-1"></div>
      <div className="login-blob blob-2"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Building2 size={32} />
          </div>
          <h1 className="login-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="login-subtitle">Class Routine Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label>Username</label>
            <input 
              type="text" 
              className="login-input"
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              placeholder="e.g. cse_admin"
            />
          </div>

          <div className="login-input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="login-input"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div className="login-input-group">
              <label>Department Name</label>
              <input 
                type="text" 
                className="login-input"
                value={department} 
                onChange={e => setDepartment(e.target.value)} 
                required 
                placeholder="e.g. Computer Science"
              />
            </div>
          )}

          <button type="submit" className="login-btn">
            {isLogin ? <><LogIn size={18} /> Sign In</> : <><UserPlus size={18} /> Register Department</>}
          </button>
        </form>

        <div className="login-toggle">
          {isLogin ? "Need an account?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register here" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
