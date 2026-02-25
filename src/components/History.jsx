import React, { useState } from 'react';
import { exportToCSV, generatePDFReport } from '../utils/export';
import { Download, FileText, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { calculateVolume } from '../utils/analytics';
import { format } from 'date-fns';

const History = ({ history }) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!history || history.length === 0) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Calendar size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.25rem' }}>No Workouts Yet</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your lifting legacy starts with your first session.</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>History</h2>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button className="secondary" onClick={() => exportToCSV(history)} style={{ padding: '0.5rem' }}>
                        <Download size={18} />
                    </button>
                    <button className="secondary" onClick={() => generatePDFReport(history)} style={{ padding: '0.5rem' }}>
                        <FileText size={18} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map(session => (
                    <div key={session.id || session.date} className="panel" style={{ margin: 0, padding: '1rem' }}>
                        <div
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => toggleExpand(session.id || session.date)}
                        >
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {format(new Date(session.date), 'EEE, MMM dd')}
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{session.name}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {session.exercises.length} Exercises
                                </span>
                                {expanded[session.id || session.date] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>

                        {expanded[session.id || session.date] && (
                            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                {session.exercises.map((ex, i) => (
                                    <div key={i} style={{ marginBottom: '0.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                            <span style={{ fontWeight: 700 }}>{ex.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vol: {calculateVolume(ex.sets)}kg</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            {ex.sets.map((set, j) => (
                                                <div key={j} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: set.completed ? '1px solid var(--success-color)' : '1px solid transparent' }}>
                                                    {set.weight}kg × {set.reps}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
