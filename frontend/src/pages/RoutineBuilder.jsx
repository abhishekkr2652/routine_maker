import { useState, useEffect } from 'react';
import { Save, Undo, Download, FileText, Plus, Trash2, Calendar } from 'lucide-react';
import api from '../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, PageOrientation, TextRun, AlignmentType, BorderStyle, ShadingType, ImageRun } from 'docx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:30-9:25 AM', '9:30-10:25 AM', '10:30-11:25 AM', '11:30-12:25 PM',
  '12:30-1:55 PM', '2:00-2:55 PM', '3:00-3:55 PM', '4:00-4:55 PM', '5:00-5:55 PM'
];

export default function RoutineBuilder() {
  const [batches, setBatches] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  
  // routine is an object where key is `${day}-${timeSlot}` and value is { subjectId, facultyId, room }
  const [routine, setRoutine] = useState({});
  const [history, setHistory] = useState([]); // Array of routine states for Undo
  
  const [showModal, setShowModal] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [exportWithColors, setExportWithColors] = useState(true);
  
  const [formData, setFormData] = useState({ department: '', subjectId: '', facultyId: '', room: '' });
  const [isDirty, setIsDirty] = useState(false);

  const currentBatch = batches.find(b => b._id === selectedBatch);
  const roomOptions = currentBatch?.room 
    ? currentBatch.room.split(',').map(r => r.trim()).filter(r => r) 
    : [];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadRoutineForBatch(selectedBatch);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (!isDirty || !selectedBatch) return;
    const timer = setTimeout(() => {
      const entries = Object.keys(routine).map(key => {
        const [day, timeSlot] = key.split('|');
        const item = routine[key];
        return {
          day,
          timeSlot,
          subjectId: item.subjectId,
          facultyId: item.facultyId,
          room: item.room
        };
      });
      api.post('/routines/bulk', { batchId: selectedBatch, entries })
        .then(() => setIsDirty(false))
        .catch(err => console.error('Auto-save failed', err));
    }, 1000);
    return () => clearTimeout(timer);
  }, [routine, isDirty, selectedBatch]);

  const fetchData = async () => {
    try {
      const [batchRes, facRes, subRes] = await Promise.all([
        api.get('/batches'),
        api.get('/faculties'),
        api.get('/subjects')
      ]);
      setBatches(batchRes.data);
      setFaculties(facRes.data);
      setSubjects(subRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRoutineForBatch = async (batchId) => {
    try {
      const res = await api.get(`/routines?batchId=${batchId}`);
      const formattedRoutine = {};
      res.data.forEach(item => {
        formattedRoutine[`${item.day}|${item.timeSlot}`] = {
          subjectId: item.subjectId._id,
          facultyId: item.facultyId._id,
          room: item.room,
          subjectDetails: item.subjectId,
          facultyDetails: item.facultyId
        };
      });
      setRoutine(formattedRoutine);
      setHistory([]); // Reset history when loading a new batch
    } catch (err) {
      console.error('Error loading routine', err);
    }
  };

  const openModal = (day, timeSlot) => {
    setCurrentSlot({ day, timeSlot });
    setFormData({ department: '', subjectId: '', facultyId: '', room: '' });
    setShowModal(true);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return alert('Please select a batch first');

    try {
      // Check conflict
      const conflictRes = await api.post('/routines/check-conflict', {
        batchId: selectedBatch,
        day: currentSlot.day,
        timeSlot: currentSlot.timeSlot,
        facultyId: formData.facultyId,
        room: formData.room
      });

      if (conflictRes.data.hasConflict) {
        return alert(conflictRes.data.message);
      }

      // Save to state and push to history
      setHistory(prev => [...prev, { ...routine }]);
      
      const subDetails = subjects.find(s => s._id === formData.subjectId);
      const facDetails = faculties.find(f => f._id === formData.facultyId);

      setRoutine(prev => ({
        ...prev,
        [`${currentSlot.day}|${currentSlot.timeSlot}`]: {
          ...formData,
          subjectDetails: subDetails,
          facultyDetails: facDetails
        }
      }));

      setIsDirty(true);
      setShowModal(false);
    } catch (err) {
      console.error('Error checking conflict', err);
    }
  };

  const handleRemoveSlot = (day, timeSlot) => {
    setRoutine(prevRoutine => {
      setHistory(prevHistory => [...prevHistory, { ...prevRoutine }]);
      const newRoutine = { ...prevRoutine };
      delete newRoutine[`${day}|${timeSlot}`];
      return newRoutine;
    });
    setIsDirty(true);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setRoutine(previousState);
    setHistory(prev => prev.slice(0, -1));
    setIsDirty(true);
  };

  const handleSaveRoutine = async () => {
    if (!selectedBatch) return;
    
    // Convert object back to array
    const entries = Object.keys(routine).map(key => {
      const [day, timeSlot] = key.split('|');
      const item = routine[key];
      return {
        day,
        timeSlot,
        subjectId: item.subjectId,
        facultyId: item.facultyId,
        room: item.room
      };
    });

    try {
      await api.post('/routines/bulk', { batchId: selectedBatch, entries });
      alert('Routine saved successfully!');
      setHistory([]); // clear undo history after save
    } catch (err) {
      alert('Error saving routine');
    }
  };

  const getLogoBase64 = async () => {
    try {
      const response = await fetch('/logo.png');
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) return null;
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };

  const getLogoArrayBuffer = async () => {
    try {
      const response = await fetch('/logo.png');
      if (!response.ok) return null;
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) return null;
      return await blob.arrayBuffer();
    } catch (e) {
      return null;
    }
  };

  const hexToRgb = (hex) => {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
  };

  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    const batch = batches.find(b => b._id === selectedBatch);
    const batchName = batch?.name || 'Routine';
    
    // Add Logo
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      // position logo on left
      doc.addImage(logoBase64, 'PNG', 20, 10, 30, 30);
    }

    // Header Text
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("National Institute of Technology Jamshedpur", doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Jamshedpur - 831014, Jharkhand, India", doc.internal.pageSize.width / 2, 28, { align: 'center' });
    doc.text("(An Institution of National Importance under MoE, Govt. of India)", doc.internal.pageSize.width / 2, 34, { align: 'center' });
    
    doc.line(14, 40, doc.internal.pageSize.width - 14, 40);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Time Table of ${batchName}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Room Number: ${batch?.room || '-'}`, doc.internal.pageSize.width - 14, 60, { align: 'right' });

    const tableData = [];
    DAYS.forEach(day => {
      const row = [day];
      TIME_SLOTS.forEach(time => {
        const cell = routine[`${day}|${time}`];
        if (cell) {
          const content = cell.subjectDetails?.abbreviation || cell.subjectDetails?.code;
          const colorHex = cell.subjectDetails?.color;
          if (exportWithColors && colorHex) {
             const rgb = hexToRgb(colorHex);
             row.push(rgb ? { content, styles: { fillColor: rgb } } : content);
          } else {
             row.push(content);
          }
        } else {
          row.push('');
        }
      });
      tableData.push(row);
    });

    autoTable(doc, {
      head: [['', ...TIME_SLOTS]],
      body: tableData,
      startY: 65,
      styles: { fontSize: 10, cellWidth: 'wrap', halign: 'center', valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [230, 208, 184], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
      columnStyles: { 0: { fillColor: [230, 208, 184], fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });

    // Aggregate Subjects
    const uniqueSubjects = {};
    Object.values(routine).forEach(cell => {
      if (cell && cell.subjectDetails) {
        uniqueSubjects[cell.subjectId] = cell;
      }
    });

    const bottomTableData = Object.values(uniqueSubjects).map(cell => [
      cell.subjectDetails?.code,
      cell.subjectDetails?.abbreviation,
      cell.subjectDetails?.name,
      `${cell.facultyDetails?.name} (${cell.facultyDetails?.phone || '-'})`,
      cell.subjectDetails?.credit || '-'
    ]);

    autoTable(doc, {
      head: [['Course Code', 'Abbreviation', 'Course Name', 'Faculty Name', 'Credit']],
      body: bottomTableData,
      startY: doc.lastAutoTable.finalY + 15,
      styles: { fontSize: 10, halign: 'center', valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [230, 208, 184], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });

    doc.save(`${batchName}_Routine.pdf`);
  };

  const exportWord = async () => {
    const batch = batches.find(b => b._id === selectedBatch);
    const batchName = batch?.name || 'Routine';

    const cellPadding = { top: 100, bottom: 100, left: 100, right: 100 };
    const headerShading = { fill: "E6D0B8", type: ShadingType.CLEAR, color: "auto" };

    // Timetable Top Table
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          ...TIME_SLOTS.map(time => new TableCell({ children: [new Paragraph({ text: time, alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }))
        ]
      })
    ];

    DAYS.forEach(day => {
      const cells = [new TableCell({ children: [new Paragraph({ text: day, alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding })];
      TIME_SLOTS.forEach(time => {
        const cell = routine[`${day}|${time}`];
        const cellText = cell ? (cell.subjectDetails?.abbreviation || cell.subjectDetails?.code) : "";
        const colorHex = cell?.subjectDetails?.color;
        
        let shadingProps = undefined;
        if (exportWithColors && colorHex && cellText) {
          shadingProps = { fill: colorHex.replace('#', ''), type: ShadingType.CLEAR, color: "auto" };
        }
        
        cells.push(new TableCell({ 
          children: [new Paragraph({ text: cellText, alignment: AlignmentType.CENTER })], 
          margins: cellPadding,
          shading: shadingProps
        }));
      });
      tableRows.push(new TableRow({ children: cells }));
    });

    // Subject Detail Bottom Table
    const uniqueSubjects = {};
    Object.values(routine).forEach(cell => {
      if (cell && cell.subjectDetails) uniqueSubjects[cell.subjectId] = cell;
    });

    const bottomTableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Course Code", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Abbreviation", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Course Name", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Faculty Name", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Credit", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding })
        ]
      })
    ];

    Object.values(uniqueSubjects).forEach(cell => {
      bottomTableRows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: cell.subjectDetails?.code || '', alignment: AlignmentType.CENTER })], margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: cell.subjectDetails?.abbreviation || '', alignment: AlignmentType.CENTER })], margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: cell.subjectDetails?.name || '', alignment: AlignmentType.CENTER })], margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: `${cell.facultyDetails?.name} (${cell.facultyDetails?.phone || '-'})`, alignment: AlignmentType.CENTER })], margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: String(cell.subjectDetails?.credit || '-'), alignment: AlignmentType.CENTER })], margins: cellPadding }),
        ]
      }));
    });

    const logoBuffer = await getLogoArrayBuffer();
    let logoImage = null;
    if (logoBuffer) {
      logoImage = new ImageRun({
        data: logoBuffer,
        transformation: { width: 120, height: 120 }
      });
    }

    const headerContent = [
      new Paragraph({
        children: [new TextRun({ text: "National Institute of Technology Jamshedpur", bold: true, size: 44 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: "Jamshedpur - 831014, Jharkhand, India", size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: "(An Institution of National Importance under MoE, Govt. of India)", size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({ text: "__________________________________________________________________________________________", size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [new TextRun({ text: `Time Table of ${batchName}`, bold: true, size: 32 })],
        alignment: AlignmentType.CENTER
      })
    ];

    const headerTable = new Table({
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: logoImage ? [new Paragraph({ children: [logoImage], alignment: AlignmentType.CENTER })] : [new Paragraph("")],
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            }),
            new TableCell({
              children: headerContent,
              width: { size: 85, type: WidthType.PERCENTAGE },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            })
          ]
        })
      ]
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: { size: { orientation: PageOrientation.LANDSCAPE } }
        },
        children: [
          headerTable,
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: `Room Number: ${batch?.room || '-'}`, bold: true, size: 24 })], alignment: AlignmentType.RIGHT }),
          new Paragraph({ text: "" }),
          new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Table({ rows: bottomTableRows, width: { size: 100, type: WidthType.PERCENTAGE } })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batchName}_Routine.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const availableDepartments = [...new Set(subjects.map(s => s.department).filter(Boolean))].sort();
  const filteredSubjects = subjects.filter(s => 
    s.department === formData.department && 
    Number(s.semester) === Number(currentBatch?.semester)
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Routine Builder</h1>
      </div>

      <div className="glass-card mb-6 flex gap-4 items-center">
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
            <option value="">Select Batch to Edit...</option>
            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium flex items-center gap-2 cursor-pointer mr-4">
            <input type="checkbox" checked={exportWithColors} onChange={(e) => setExportWithColors(e.target.checked)} />
            Export Colors
          </label>
          <button className="btn btn-secondary" onClick={handleUndo} disabled={history.length === 0}>
            <Undo size={18} /> Undo
          </button>
          <button className="btn btn-primary" onClick={handleSaveRoutine} disabled={!selectedBatch}>
            <Save size={18} /> Save Routine
          </button>
          <button className="btn btn-secondary" onClick={exportPDF} disabled={!selectedBatch}>
            <FileText size={18} /> PDF
          </button>
          <button className="btn btn-secondary" onClick={exportWord} disabled={!selectedBatch}>
            <Download size={18} /> Word
          </button>
        </div>
      </div>

      {!selectedBatch ? (
        <div className="glass-card text-center py-12 text-muted">
          <Calendar size={48} className="mx-auto mb-4" style={{ opacity: 0.5 }} />
          <h3>Please select a batch to start building the routine.</h3>
        </div>
      ) : (
        <div className="routine-grid">
          <div className="grid-header">Time / Day</div>
          {TIME_SLOTS.map(time => (
            <div key={time} className="grid-header">{time}</div>
          ))}

          {DAYS.map(day => (
            <div style={{ display: 'contents' }} key={day}>
              <div className="grid-cell grid-cell-day">{day}</div>
              {TIME_SLOTS.map(time => {
                // Key format: "Monday|08:00 AM - 09:00 AM"
                const key = `${day}|${time}`;
                const cellData = routine[key];

                const color = cellData?.subjectDetails?.color || '#2B3A67';
                return (
                  <div key={time} className="grid-cell">
                    {cellData ? (
                      <div className="routine-card" style={{ backgroundColor: `${color}20`, borderLeft: `4px solid ${color}`, borderColor: color }}>
                        <div className="font-semibold" style={{ color: color }}>{cellData.subjectDetails?.code}</div>
                        <div className="text-xs text-muted">{cellData.facultyDetails?.name} | Room {cellData.room}</div>
                        <div className="routine-card-actions">
                          <button className="action-btn" onClick={() => handleRemoveSlot(day, time)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-secondary w-full h-full" 
                        style={{ padding: '0.25rem', opacity: 0.5 }}
                        onClick={() => openModal(day, time)}
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Class for {currentSlot.day} ({currentSlot.timeSlot})</h3>
              <button className="action-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddSlot}>
              <div className="form-group">
                <label>Department</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value, subjectId: ''})} required>
                  <option value="">Select Department</option>
                  {availableDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} required disabled={!formData.department}>
                  <option value="">Select Subject</option>
                  {filteredSubjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Faculty</label>
                <select value={formData.facultyId} onChange={e => setFormData({...formData, facultyId: e.target.value})} required>
                  <option value="">Select Faculty</option>
                  {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Room Number</label>
                {roomOptions.length > 0 ? (
                  <select value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} required>
                    <option value="">Select Room</option>
                    {roomOptions.map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <input type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} required placeholder="e.g. 101, Lab A" />
                )}
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
