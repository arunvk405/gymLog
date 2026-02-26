import React, { useState } from 'react';
import { exportToCSV, generatePDFReport } from '../utils/export';
import { updateWorkout } from '../utils/storage';
import { Download, FileText, ChevronDown, ChevronUp, Calendar, Pencil, Save, X } from 'lucide-react';
import { calculateVolume } from '../utils/analytics';
import { format } from 'date-fns';

const History = ({ history, onUpdate }) => {
    const [expanded, setExpanded] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const startEdit = (session) => {
        setEditingId(session.id);
        setEditData(JSON.parse(JSON.stringify(session))); // deep clone
        setExpanded(prev => ({ ...prev, [session.id]: true }));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData(null);
    };

    const updateEditSet = (exIdx, setIdx, field, value) => {
        const updated = { ...editData };
        updated.exercises[exIdx].sets[setIdx][field] = value;
        setEditData(updated);
    };

    const saveEdit = async () => {
        if (!editData?.id || saving) return;
        setSaving(true);
        try {
            const sessionDate = new Date(editData.date);
            await updateWorkout(editData.id, {
                exercises: editData.exercises,
                date: editData.date,
                timestamp: sessionDate.getTime(),
                updatedAt: new Date().toISOString()
            });
            if (onUpdate) onUpdate();
            setEditingId(null);
            setEditData(null);
        } catch (err) {
            alert('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
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
                {history.map(session => {
                    const isEditing = editingId === session.id;
                    const data = isEditing ? editData : session;

                    return (
                        <div key={session.id || session.date} className="panel" style={{
                            margin: 0, padding: '1rem',
                            border: isEditing ? '2px solid var(--accent-color)' : '1px solid var(--border-color)'
                        }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => !isEditing && toggleExpand(session.id || session.date)}
                            >
                                <div>
                                    {isEditing ? (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const input = e.currentTarget.querySelector('input');
                                                if (input && input.showPicker) {
                                                    input.showPicker();
                                                } else if (input) {
                                                    input.click();
                                                }
                                            }}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                marginBottom: '8px', background: 'var(--muted-color)',
                                                padding: '4px 10px', borderRadius: '10px',
                                                border: '1px solid var(--border-color)', cursor: 'pointer'
                                            }}
                                        >
                                            <Calendar size={13} color="var(--accent-color)" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                                {format(new Date(editData.date ? editData.date : session.date), 'EEE, MMM dd')}
                                            </span>
                                            <ChevronDown size={10} color="var(--accent-color)" opacity={0.6} />
                                            <input
                                                type="date"
                                                value={editData.date ? editData.date.split('T')[0] : ''}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    const newDate = new Date(e.target.value + 'T12:00:00');
                                                    setEditData({ ...editData, date: newDate.toISOString() });
                                                }}
                                                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {format(new Date(session.date), 'EEE, MMM dd')}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{session.name}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {!isEditing && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEdit(session); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {session.exercises.length} Ex
                                            </span>
                                            {expanded[session.id || session.date] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </>
                                    )}
                                    {isEditing && (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={saveEdit}
                                                disabled={saving}
                                                style={{
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: 'var(--accent-color)', color: 'white', border: 'none',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                                                }}
                                            >
                                                <Save size={13} /> {saving ? '...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                style={{
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                                                }}
                                            >
                                                <X size={13} /> Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {(expanded[session.id || session.date] || isEditing) && (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    {data.exercises.map((ex, exIdx) => (
                                        <div key={exIdx} style={{ marginBottom: '0.8rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                                                <span style={{ fontWeight: 700 }}>{ex.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vol: {calculateVolume(ex.sets)}kg</span>
                                            </div>

                                            {isEditing ? (
                                                /* EDIT MODE: inline inputs */
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {ex.sets.map((set, setIdx) => (
                                                        <div key={setIdx} style={{
                                                            display: 'grid', gridTemplateColumns: '0.5fr 1fr 1fr',
                                                            gap: '6px', alignItems: 'center'
                                                        }}>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                                                S{setIdx + 1}
                                                            </span>
                                                            <div style={{ position: 'relative' }}>
                                                                <input
                                                                    type="number"
                                                                    value={set.weight}
                                                                    onFocus={(e) => e.target.select()}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        updateEditSet(exIdx, setIdx, 'weight', val === '' ? '' : parseFloat(val));
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        if (e.target.value === '' || isNaN(e.target.value))
                                                                            updateEditSet(exIdx, setIdx, 'weight', 0);
                                                                    }}
                                                                    style={{
                                                                        textAlign: 'center', fontWeight: 700, fontSize: '0.85rem',
                                                                        padding: '0.4rem', background: 'var(--muted-color)'
                                                                    }}
                                                                />
                                                                <span style={{
                                                                    position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                                                                    fontSize: '0.6rem', color: 'var(--text-secondary)', pointerEvents: 'none'
                                                                }}>kg</span>
                                                            </div>
                                                            <div style={{ position: 'relative' }}>
                                                                <input
                                                                    type="number"
                                                                    value={set.reps}
                                                                    onFocus={(e) => e.target.select()}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        updateEditSet(exIdx, setIdx, 'reps', val === '' ? '' : parseInt(val));
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        if (e.target.value === '' || isNaN(e.target.value))
                                                                            updateEditSet(exIdx, setIdx, 'reps', 0);
                                                                    }}
                                                                    style={{
                                                                        textAlign: 'center', fontWeight: 700, fontSize: '0.85rem',
                                                                        padding: '0.4rem', background: 'var(--muted-color)'
                                                                    }}
                                                                />
                                                                <span style={{
                                                                    position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                                                                    fontSize: '0.6rem', color: 'var(--text-secondary)', pointerEvents: 'none'
                                                                }}>reps</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                /* VIEW MODE: badges */
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    {ex.sets.map((set, j) => (
                                                        <div key={j} style={{ background: 'var(--muted-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, border: set.completed ? '1px solid var(--success-color)' : '1px solid var(--border-color)' }}>
                                                            {set.weight}kg × {set.reps}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default History;
