import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import api from '../api';

export default function Faculties() {
  const [faculties, setFaculties] = useState([]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/faculties');
      setFaculties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/faculties/${editingId}`, { name, department, phone });
        setEditingId(null);
      } else {
        await api.post('/faculties', { name, department, phone });
      }
      setName('');
      setDepartment('');
      setPhone('');
      fetchFaculties();
    } catch (err) {
      alert(editingId ? 'Error updating faculty' : 'Error adding faculty');
    }
  };

  const startEdit = (faculty) => {
    setEditingId(faculty._id);
    setName(faculty.name);
    setDepartment(faculty.department);
    setPhone(faculty.phone);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setDepartment('');
    setPhone('');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/faculties/${id}`);
      fetchFaculties();
    } catch (err) {
      alert('Error deleting faculty');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Faculties</h1>
      </div>

      <div className="glass-card mb-6">
        <div className="flex justify-between items-center">
          <h3>{editingId ? 'Edit Faculty' : 'Add New Faculty'}</h3>
          {editingId && (
            <button className="action-btn" onClick={cancelEdit}><X size={18} /></button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4 mt-4 items-center flex-wrap">
          <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: '200px' }}>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
            <input type="text" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
            <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary whitespace-nowrap">
            {editingId ? 'Update Faculty' : <><Plus size={18} /> Add Faculty</>}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map(faculty => (
                <tr key={faculty._id}>
                  <td>{faculty.name}</td>
                  <td>{faculty.department}</td>
                  <td>{faculty.phone}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="action-btn" onClick={() => startEdit(faculty)} style={{ color: 'var(--text-muted)' }}><Pencil size={18} /></button>
                      <button className="action-btn" onClick={() => handleDelete(faculty._id)}><Trash2 size={18} /></button>
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
