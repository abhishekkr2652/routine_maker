import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import api from '../api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [type, setType] = useState('Theory');
  const [credit, setCredit] = useState('');
  const [color, setColor] = useState('#E2E8F0');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, { name, code, abbreviation, department, semester: Number(semester), type, credit: Number(credit), color });
        setEditingId(null);
      } else {
        await api.post('/subjects', { name, code, abbreviation, department, semester: Number(semester), type, credit: Number(credit), color });
      }
      setName('');
      setCode('');
      setAbbreviation('');
      setDepartment('');
      setSemester('');
      setType('Theory');
      setCredit('');
      setColor('#E2E8F0');
      fetchSubjects();
    } catch (err) {
      alert(editingId ? 'Error updating subject' : 'Error adding subject');
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject._id);
    setName(subject.name);
    setCode(subject.code);
    setAbbreviation(subject.abbreviation);
    setDepartment(subject.department || '');
    setSemester(subject.semester || '');
    setType(subject.type);
    setCredit(subject.credit);
    setColor(subject.color || '#E2E8F0');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setAbbreviation('');
    setDepartment('');
    setSemester('');
    setType('Theory');
    setCredit('');
    setColor('#E2E8F0');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert('Error deleting subject');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Subjects</h1>
      </div>

      <div className="glass-card mb-6">
        <div className="flex justify-between items-center">
          <h3>{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
          {editingId && (
            <button className="action-btn" onClick={cancelEdit}><X size={18} /></button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4 mt-4 items-center flex-wrap">
          <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: '200px' }}>
            <input type="text" placeholder="Subject Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '100px' }}>
            <input type="text" placeholder="Subject Code" value={code} onChange={e => setCode(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '100px' }}>
            <input type="text" placeholder="Abbrev (e.g. MOOC-1)" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '100px' }}>
            <input type="text" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '80px' }}>
            <input type="number" placeholder="Semester" value={semester} onChange={e => setSemester(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '80px' }}>
            <input type="number" placeholder="Credit" value={credit} onChange={e => setCredit(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '100px' }}>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="Theory">Theory</option>
              <option value="Lab">Lab</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 0, minWidth: '50px' }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ padding: '0.2rem', height: '100%', cursor: 'pointer' }} title="Highlight Color" />
          </div>
          <button type="submit" className="btn btn-primary whitespace-nowrap">
            {editingId ? 'Update Subject' : <><Plus size={18} /> Add Subject</>}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Abbreviation</th>
                <th>Dept</th>
                <th>Sem</th>
                <th>Type</th>
                <th>Credit</th>
                <th>Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject._id}>
                  <td>{subject.name}</td>
                  <td>{subject.code}</td>
                  <td>{subject.abbreviation}</td>
                  <td>{subject.department || '-'}</td>
                  <td>{subject.semester || '-'}</td>
                  <td>{subject.type}</td>
                  <td>{subject.credit}</td>
                  <td>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: subject.color || '#E2E8F0', border: '1px solid var(--border)' }}></div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="action-btn" onClick={() => startEdit(subject)} style={{ color: 'var(--text-muted)' }}><Pencil size={18} /></button>
                      <button className="action-btn" onClick={() => handleDelete(subject._id)}><Trash2 size={18} /></button>
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
