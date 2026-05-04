import { useState, useEffect } from 'react';
import { Calendar, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, PageOrientation, TextRun, AlignmentType, BorderStyle, ShadingType, ImageRun } from 'docx';
import api from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:30-9:25 AM', '9:30-10:25 AM', '10:30-11:25 AM', '11:30-12:25 PM',
  '12:30-1:55 PM', '2:00-2:55 PM', '3:00-3:55 PM', '4:00-4:55 PM', '5:00-5:55 PM'
];

export default function FacultyRoutine() {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [routine, setRoutine] = useState({});

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      loadRoutineForFaculty(selectedFaculty);
    }
  }, [selectedFaculty]);

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/faculties');
      setFaculties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRoutineForFaculty = async (facultyId) => {
    try {
      const res = await api.get(`/routines?facultyId=${facultyId}`);
      const formattedRoutine = {};
      res.data.forEach(item => {
        // There could be multiple classes at same time for different batches (though conflict checker prevents it normally), but we just need to display it.
        formattedRoutine[`${item.day}|${item.timeSlot}`] = {
          batchDetails: item.batchId,
          subjectDetails: item.subjectId,
          room: item.room
        };
      });
      setRoutine(formattedRoutine);
    } catch (err) {
      console.error('Error loading faculty routine', err);
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

  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    const faculty = faculties.find(f => f._id === selectedFaculty);
    const facultyName = faculty?.name || 'Faculty';
    
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 20, 10, 30, 30);
    }

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
    doc.text(`Time Table of ${facultyName}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });
    
    const tableData = [];
    DAYS.forEach(day => {
      const row = [day];
      TIME_SLOTS.forEach(time => {
        const cell = routine[`${day}|${time}`];
        if (cell) {
          row.push(cell.subjectDetails?.abbreviation || cell.subjectDetails?.code);
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

    const uniqueClasses = {};
    Object.values(routine).forEach(cell => {
      if (cell && cell.subjectDetails && cell.batchDetails) {
        uniqueClasses[`${cell.subjectDetails._id}-${cell.batchDetails._id}`] = cell;
      }
    });

    const bottomTableData = Object.values(uniqueClasses).map(cell => [
      cell.subjectDetails?.code,
      cell.subjectDetails?.abbreviation,
      cell.subjectDetails?.name,
      cell.batchDetails?.name || '-',
      cell.subjectDetails?.credit || '-'
    ]);

    autoTable(doc, {
      head: [['Course Code', 'Abbreviation', 'Course Name', 'Batch', 'Credit']],
      body: bottomTableData,
      startY: doc.lastAutoTable.finalY + 15,
      styles: { fontSize: 10, halign: 'center', valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [230, 208, 184], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      margin: { left: 14, right: 14 },
      theme: 'grid'
    });

    doc.save(`${facultyName}_Routine.pdf`);
  };

  const exportWord = async () => {
    const faculty = faculties.find(f => f._id === selectedFaculty);
    const facultyName = faculty?.name || 'Faculty';

    const cellPadding = { top: 100, bottom: 100, left: 100, right: 100 };
    const headerShading = { fill: "E6D0B8", type: ShadingType.CLEAR, color: "auto" };

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
        cells.push(new TableCell({ children: [new Paragraph({ text: cellText, alignment: AlignmentType.CENTER })], margins: cellPadding }));
      });
      tableRows.push(new TableRow({ children: cells }));
    });

    const uniqueClasses = {};
    Object.values(routine).forEach(cell => {
      if (cell && cell.subjectDetails && cell.batchDetails) {
        uniqueClasses[`${cell.subjectDetails._id}-${cell.batchDetails._id}`] = cell;
      }
    });

    const bottomTableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Course Code", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Abbreviation", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Course Name", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Batch", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: "Credit", alignment: AlignmentType.CENTER })], shading: headerShading, margins: cellPadding })
        ]
      })
    ];

    Object.values(uniqueClasses).forEach(cell => {
      bottomTableRows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: cell.subjectDetails?.code || '', alignment: AlignmentType.CENTER })], margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: cell.subjectDetails?.abbreviation || '', alignment: AlignmentType.CENTER })], margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: cell.subjectDetails?.name || '', alignment: AlignmentType.CENTER })], margins: cellPadding }),
          new TableCell({ children: [new Paragraph({ text: cell.batchDetails?.name || '-', alignment: AlignmentType.CENTER })], margins: cellPadding }),
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
        children: [new TextRun({ text: `Time Table of ${facultyName}`, bold: true, size: 32 })],
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
    a.download = `${facultyName}_Routine.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Faculty Timetable</h1>
        {selectedFaculty && (
          <div className="flex gap-4">
            <button className="btn btn-secondary" onClick={exportPDF}><FileText size={18} /> Export PDF</button>
            <button className="btn btn-secondary" onClick={exportWord}><Download size={18} /> Export Word</button>
          </div>
        )}
      </div>

      <div className="glass-card mb-6">
        <div className="form-group" style={{ marginBottom: 0, maxWidth: '400px' }}>
          <label>Select Faculty Member</label>
          <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}>
            <option value="">Choose your name...</option>
            {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {!selectedFaculty ? (
        <div className="glass-card text-center py-12 text-muted">
          <Calendar size={48} className="mx-auto mb-4" style={{ opacity: 0.5 }} />
          <h3>Please select a faculty member to view the timetable.</h3>
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
                const key = `${day}|${time}`;
                const cellData = routine[key];

                return (
                  <div key={time} className="grid-cell" style={{ justifyContent: 'center' }}>
                    {cellData ? (
                      <div className="routine-card" style={{ cursor: 'default', borderLeft: '3px solid var(--secondary)' }}>
                        <div className="font-semibold text-white">{cellData.subjectDetails?.code}</div>
                        <div className="text-xs text-muted">{cellData.batchDetails?.name}</div>
                        <div className="text-xs text-muted">Room: {cellData.room}</div>
                      </div>
                    ) : (
                      <div className="text-center text-muted text-sm" style={{ opacity: 0.3 }}>Free</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
