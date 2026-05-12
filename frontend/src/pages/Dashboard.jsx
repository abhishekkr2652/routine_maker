import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, Calendar, LayoutDashboard, ArrowRight } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    batches: 0,
    faculties: 0,
    subjects: 0,
    classes: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [batchesRes, facultiesRes, subjectsRes, routinesRes] = await Promise.all([
          api.get('/batches'),
          api.get('/faculties'),
          api.get('/subjects'),
          api.get('/routines')
        ]);
        setStats({
          batches: batchesRes.data.length,
          faculties: facultiesRes.data.length,
          subjects: subjectsRes.data.length,
          classes: routinesRes.data.length
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', border: 'none', marginBottom: '3.5rem' }}>
        <h2 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 600 }}>Welcome to NIT Jamshedpur Class Routine Management</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '800px', lineHeight: '1.6' }}>
          Streamline your institution's scheduling process. Manage batches, faculties, and subjects efficiently, and automatically detect conflicts while building comprehensive timetables.
        </p>
      </div>

      <h3 className="mb-4 text-xl font-semibold">System Overview</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '4px solid #F59E0B' }}>
          <div style={{ padding: '1rem', background: '#FEF3C7', color: '#D97706', borderRadius: '8px' }}>
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted m-0">Total Batches</p>
            <h3 className="text-3xl font-bold m-0">{isLoading ? '-' : stats.batches}</h3>
          </div>
        </div>

        <div className="glass-card hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '4px solid #10B981' }}>
          <div style={{ padding: '1rem', background: '#D1FAE5', color: '#059669', borderRadius: '8px' }}>
            <UserCheck size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted m-0">Active Faculties</p>
            <h3 className="text-3xl font-bold m-0">{isLoading ? '-' : stats.faculties}</h3>
          </div>
        </div>

        <div className="glass-card hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '4px solid #3B82F6' }}>
          <div style={{ padding: '1rem', background: '#DBEAFE', color: '#2563EB', borderRadius: '8px' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted m-0">Total Subjects</p>
            <h3 className="text-3xl font-bold m-0">{isLoading ? '-' : stats.subjects}</h3>
          </div>
        </div>

        <div className="glass-card hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '4px solid #8B5CF6' }}>
          <div style={{ padding: '1rem', background: '#EDE9FE', color: '#7C3AED', borderRadius: '8px' }}>
            <Calendar size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted m-0">Scheduled Classes</p>
            <h3 className="text-3xl font-bold m-0">{isLoading ? '-' : stats.classes}</h3>
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        <Link to="/routine-builder" style={{ textDecoration: 'none' }}>
          <div className="glass-card hover-lift" style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '8px' }}>
                <LayoutDashboard size={24} />
              </div>
              <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Build Routine</h4>
            <p className="text-sm text-muted m-0">Create or modify class schedules for batches with automatic conflict detection.</p>
          </div>
        </Link>

        <Link to="/batches" style={{ textDecoration: 'none' }}>
          <div className="glass-card hover-lift" style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--secondary)', color: 'white', borderRadius: '8px' }}>
                <Users size={24} />
              </div>
              <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Manage Batches</h4>
            <p className="text-sm text-muted m-0">Register new academic batches, assign semesters, and set default rooms.</p>
          </div>
        </Link>

        <Link to="/subjects" style={{ textDecoration: 'none' }}>
          <div className="glass-card hover-lift" style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#059669', color: 'white', borderRadius: '8px' }}>
                <BookOpen size={24} />
              </div>
              <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Subject Config</h4>
            <p className="text-sm text-muted m-0">Add new subjects, set credit points, and assign distinct highlighting colors.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
