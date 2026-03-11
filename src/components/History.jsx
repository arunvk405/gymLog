import React, { useState } from 'react';
import { exportToCSV, generatePDFReport } from '../utils/export';
import { updateWorkout } from '../utils/storage';
import { Download, FileText, ChevronDown, ChevronUp, Calendar, Pencil, Save, X, Clock, Trash2 } from 'lucide-react';
import { calculateVolume } from '../utils/analytics';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const History = ({ history, onUpdate }) => {
    const [expanded, setExpanded] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);

    // Date filtering (Default 2 weeks)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 14);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const startEdit = (session) => {
        const sessionId = session.id || session.date;
        setEditingId(sessionId);
        setEditData(JSON.parse(JSON.stringify(session))); // deep clone
        setExpanded(prev => ({ ...prev, [sessionId]: true }));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData(null);
    };

    const updateEditSet = (exIdx, setIdx, field, value) => {
        if (!editData) return;
        const updated = { ...editData };
        if (updated.exercises[exIdx] && updated.exercises[exIdx].sets[setIdx]) {
            updated.exercises[exIdx].sets[setIdx][field] = value;
            setEditData(updated);
        }
    };

    const saveEdit = async () => {
        if (!editData || saving) return;
        setSaving(true);
        try {
            const sessionDate = new Date(editData.date);
            const updateId = editData.id || editData.date;
            await updateWorkout(updateId, {
                exercises: editData.exercises,
                date: editData.date,
                timestamp: sessionDate.getTime(),
                updatedAt: new Date().toISOString()
            });
            if (onUpdate) onUpdate();
            setEditingId(null);
            setEditData(null);
            toast.success("Workout updated!");
        } catch (err) {
            console.error("Edit save error:", err);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    // Filter history based on date range
    const filteredHistory = (history || []).filter(session => {
        if (!session.date) return false;
        const sessionDate = session.date.split('T')[0];
        return sessionDate >= startDate && sessionDate <= endDate;
    });

    const formatTime = (seconds) => {
        if (!seconds) return null;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>History</h2>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button className="secondary" onClick={() => exportToCSV(filteredHistory)} style={{ padding: '0.5rem' }}>
                        <Download size={18} />
                    </button>
                    <button className="secondary" onClick={() => generatePDFReport(filteredHistory)} style={{ padding: '0.5rem' }}>
                        <FileText size={18} />
                    </button>
                </div>
            </div>

            {/* DATE RANGE FILTER */}
            <div className="panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--muted-color)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Calendar size={16} color="var(--accent-color)" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Filter Period</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', zIndex: 1 }}>FROM</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ width: '100%', padding: '24px 12px 6px 12px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '12px', background: 'var(--panel-color)' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', zIndex: 1 }}>TO</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ width: '100%', padding: '24px 12px 6px 12px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '12px', background: 'var(--panel-color)' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                         Showing <span style={{ color: 'var(--accent-color)' }}>{filteredHistory.length}</span> workouts
                    </div>
                    <button 
                        onClick={() => {
                            setStartDate('2000-01-01');
                            setEndDate(new Date().toISOString().split('T')[0]);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                    >
                        Show All Time
                    </button>
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <Calendar size={40} color="var(--border-color)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>No workouts found for this period.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredHistory.map(session => {
                    const sessionId = session.id || session.date;
                    const isEditing = editingId === sessionId;
                    const data = isEditing ? (editData || session) : session;

                    return (
                        <div key={sessionId} className="panel" style={{
                            margin: 0, padding: '1rem',
                            border: isEditing ? '2px solid var(--accent-color)' : '1px solid var(--border-color)'
                        }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: isEditing ? 'flex-start' : 'center', flexWrap: isEditing ? 'wrap' : 'nowrap', gap: isEditing ? '0.75rem' : '0', cursor: 'pointer' }}
                                onClick={() => !isEditing && toggleExpand(sessionId)}
                            >
                                <div>
                                    {isEditing && editData ? (
                                        <div
                                            style={{
                                                position: 'relative',
                                                display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                                                marginBottom: '6px', background: 'var(--muted-color)',
                                                padding: '8px 16px', borderRadius: '10px',
                                                border: '1px solid var(--border-color)', cursor: 'pointer',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Calendar size={13} color="var(--accent-color)" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                                {format(new Date(editData.date || session.date), 'EEE, MMM dd')}
                                            </span>
                                            <ChevronDown size={10} color="var(--accent-color)" opacity={0.6} />
                                            <input
                                                type="date"
                                                value={editData.date && typeof editData.date === 'string' ? editData.date.split('T')[0] : (typeof editData.date === 'number' ? new Date(editData.date).toISOString().split('T')[0] : '')}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    if (!e.target.value) return;
                                                    const newDate = new Date(e.target.value + 'T12:00:00');
                                                    setEditData({ ...editData, date: newDate.toISOString() });
                                                }}
                                                className="date-picker-input"
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {format(new Date(session.date), 'EEE, MMM dd')}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{session.name}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
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
                                            {session.totalTime && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    <Clock size={12} /> {formatTime(session.totalTime)}
                                                </div>
                                            )}
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
                                                                    inputMode="decimal"
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
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
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
        )}
    </div>
    );
};

export default History;
