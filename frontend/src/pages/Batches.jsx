import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import api from '../api';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [room, setRoom] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/batches');
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/batches/${editingId}`, { name, semester, room });
        setEditingId(null);
      } else {
        await api.post('/batches', { name, semester, room });
      }
      setName('');
      setSemester('');
      setRoom('');
      fetchBatches();
    } catch (err) {
      alert(editingId ? 'Error updating batch' : 'Error adding batch');
    }
  };

  const startEdit = (batch) => {
    setEditingId(batch._id);
    setName(batch.name);
    setSemester(batch.semester);
    setRoom(batch.room || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setSemester('');
    setRoom('');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/batches/${id}`);
      fetchBatches();
    } catch (err) {
      alert('Error deleting batch');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Batches</h1>
      </div>

      <div className="glass-card mb-6">
        <div className="flex justify-between items-center">
          <h3>{editingId ? 'Edit Batch' : 'Add New Batch'}</h3>
          {editingId && (
            <button className="action-btn" onClick={cancelEdit}><X size={18} /></button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4 mt-4 items-center">
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <input type="text" placeholder="Batch Name (e.g. B.Tech CSE 2024)" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <input type="number" placeholder="Semester" value={semester} onChange={e => setSemester(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <input type="text" placeholder="Rooms (comma separated, e.g. 101, 102)" value={room} onChange={e => setRoom(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update Batch' : <><Plus size={18} /> Add Batch</>}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Semester</th>
                <th>Rooms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch._id}>
                  <td>{batch.name}</td>
                  <td>{batch.semester}</td>
                  <td>{batch.room || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="action-btn" onClick={() => startEdit(batch)} style={{ color: 'var(--text-muted)' }}><Pencil size={18} /></button>
                      <button className="action-btn" onClick={() => handleDelete(batch._id)}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
