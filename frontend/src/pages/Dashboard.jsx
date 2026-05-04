export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      
      <div className="glass-card">
        <h2>Welcome to NIT Jamshedpur Class Routine Management</h2>
        <p className="mt-4 text-muted" style={{ color: 'var(--text-muted)' }}>
          Manage your institution's batches, faculties, subjects, and automatically check for conflicts while building the timetable.
        </p>
      </div>

      <div className="mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="glass-card">
          <h3>Quick Stats</h3>
          <p className="mt-4" style={{ color: 'var(--text-muted)' }}>Easily navigate from the sidebar to start creating the schedule.</p>
        </div>
      </div>
    </div>
  );
}
