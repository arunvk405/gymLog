import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { calculateVolume } from './analytics';

export const exportToCSV = (history) => {
    if (!history || history.length === 0) return;

    let csv = 'Date,Workout,Exercise,Set,Weight,Reps,Volume\n';

    history.forEach(session => {
        session.exercises.forEach(ex => {
            ex.sets.forEach((set, i) => {
                csv += `${session.date},${session.name},${ex.name},${i + 1},${set.weight},${set.reps},${(set.weight * set.reps)}\n`;
            });
        });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'gymlog_history.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const generatePDFReport = (history) => {
    if (!history || history.length === 0) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Strength Progress Report', 14, 22);

    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = [];
    [...history].slice(-10).reverse().forEach(session => {
        session.exercises.forEach(ex => {
            tableData.push([
                new Date(session.date).toLocaleDateString(),
                ex.name,
                ex.sets.length,
                Math.max(...ex.sets.map(s => s.weight)),
                calculateVolume(ex.sets)
            ]);
        });
    });

    doc.autoTable({
        startY: 40,
        head: [['Date', 'Exercise', 'Sets', 'Max Weight', 'Total Volume']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillStyle: '#1f6feb' }
    });

    doc.save('GymLog_Report.pdf');
};
