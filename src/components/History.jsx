import React, { useState } from 'react';
import { exportToCSV, generatePDFReport } from '../utils/export';
import { updateWorkout } from '../utils/storage';
import { Download, FileText, ChevronDown, ChevronUp, Calendar, Pencil, Save, X, Clock, Trash2, Target, Activity, Zap, BicepsFlexed, Shield, Sword, TrendingUp } from 'lucide-react';
import { calculateVolume } from '../utils/analytics';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import CustomDatePicker from './CustomDatePicker';

const getWorkoutIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes('chest') || n.includes('bench')) return <Target size={16} color="var(--accent-color)" />;
    if (n.includes('back') || n.includes('row')) return <Activity size={16} color="var(--accent-color)" />;
    if (n.includes('leg') || n.includes('squat')) return <Zap size={16} color="var(--accent-color)" />;
    if (n.includes('arm') || n.includes('bicep') || n.includes('tricep')) return <BicepsFlexed size={16} color="var(--accent-color)" />;
    if (n.includes('shoulder')) return <Shield size={16} color="var(--accent-color)" />;
    return <Sword size={16} color="var(--accent-color)" />;
};

const History = ({ history, onUpdate }) => {
    const [expanded, setExpanded] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);

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
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                marginBottom: '1.5rem', background: 'var(--panel-color)', padding: '1.25rem',
                borderRadius: '24px', border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} className="text-gradient">History</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="secondary dp-btn" onClick={() => exportToCSV(filteredHistory)} style={{ 
                        width: '42px', height: '42px', borderRadius: '14px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--muted-color)', border: '1px solid var(--border-color)'
                    }}>
                        <Download size={20} />
                    </button>
                    <button className="secondary dp-btn" onClick={() => generatePDFReport(filteredHistory)} style={{ 
                        width: '42px', height: '42px', borderRadius: '14px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--muted-color)', border: '1px solid var(--border-color)'
                    }}>
                        <FileText size={20} />
                    </button>
                </div>
            </div>

            {/* DATE RANGE FILTER */}
            <div className="panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--muted-color)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Calendar size={16} color="var(--accent-color)" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Filter Period</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* FROM picker trigger */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="dp-btn"
                            onClick={() => setShowStartPicker(true)}
                            style={{
                                flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
                                padding: '12px 14px', borderRadius: '16px', background: 'var(--panel-color)',
                                border: '1px solid var(--border-color)', width: '100%',
                            }}
                        >
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FROM</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} color="var(--accent-color)" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{format(new Date(startDate + 'T12:00:00'), 'dd MMM yyyy')}</span>
                            </div>
                        </button>
                        {showStartPicker && <CustomDatePicker value={startDate} onChange={setStartDate} onClose={() => setShowStartPicker(false)} maxDate={endDate} />}
                    </div>
                    {/* TO picker trigger */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="dp-btn"
                            onClick={() => setShowEndPicker(true)}
                            style={{
                                flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
                                padding: '12px 14px', borderRadius: '16px', background: 'var(--panel-color)',
                                border: '1px solid var(--border-color)', width: '100%',
                            }}
                        >
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TO</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} color="var(--accent-color)" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{format(new Date(endDate + 'T12:00:00'), 'dd MMM yyyy')}</span>
                            </div>
                        </button>
                        {showEndPicker && <CustomDatePicker value={endDate} onChange={setEndDate} onClose={() => setShowEndPicker(false)} maxDate={new Date().toISOString().split('T')[0]} align="right" />}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                         Showing <span style={{ color: 'var(--accent-color)' }}>{filteredHistory.length}</span> workouts
                    </div>
                    <button 
                        className="dp-btn"
                        onClick={() => {
                            setStartDate('2000-01-01');
                            setEndDate(new Date().toISOString().split('T')[0]);
                        }}
                        style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                        Show All Time
                    </button>
                </div>
            </div>

            {/* Custom Date Picker Modals */}

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
                            margin: 0, padding: '1.25rem',
                            border: isEditing ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                            boxShadow: isEditing ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                            borderRadius: '24px'
                        }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: isEditing ? 'flex-start' : 'center', flexWrap: isEditing ? 'wrap' : 'nowrap', gap: isEditing ? '0.75rem' : '0', cursor: 'pointer' }}
                                onClick={() => !isEditing && toggleExpand(sessionId)}
                            >
                                <div>
                                    {isEditing && editData ? (
                                        <div style={{ position: 'relative', marginBottom: '10px', width: 'fit-content' }}>
                                            <button
                                                className="dp-btn"
                                                onClick={(e) => { e.stopPropagation(); setShowEditDatePicker(v => !v); }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '8px 14px', borderRadius: '12px',
                                                    background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                                                }}
                                            >
                                                <Calendar size={14} color="var(--accent-color)" />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {format(new Date(editData.date || session.date), 'EEE, dd MMM yyyy')}
                                                </span>
                                            </button>
                                            {showEditDatePicker && (
                                                <CustomDatePicker
                                                    value={editData.date && typeof editData.date === 'string' ? editData.date.split('T')[0] : (typeof editData.date === 'number' ? new Date(editData.date).toISOString().split('T')[0] : '')}
                                                    maxDate={new Date().toISOString().split('T')[0]}
                                                    onChange={(val) => {
                                                        const newDate = new Date(val + 'T12:00:00');
                                                        setEditData({ ...editData, date: newDate.toISOString() });
                                                    }}
                                                    onClose={() => setShowEditDatePicker(false)}
                                                />
                                            )}
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
                                    {/* MINIMAL MOTIVATION */}
                                    <div style={{ marginBottom: '1.25rem', opacity: 0.7 }}>
                                        <div className="glass-panel" style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TrendingUp size={12} color="var(--accent-color)" />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                Every session counts toward the elite version of yourself.
                                            </span>
                                        </div>
                                    </div>

                                    {data.exercises.map((ex, exIdx) => (
                                        <div key={exIdx} style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {getWorkoutIcon(ex.name)}
                                                    <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.3px' }}>{ex.name}</span>
                                                </div>
                                                <div className="glass-panel" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, opacity: 0.8 }}>
                                                    VOLUME: <span style={{ color: 'var(--accent-color)' }}>{calculateVolume(ex.sets)}</span> KG
                                                </div>
                                            </div>

                                            {isEditing ? (
                                                /* EDIT MODE: inline inputs */
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {ex.sets.map((set, setIdx) => (
                                                        <div key={setIdx} style={{
                                                            display: 'grid', gridTemplateColumns: '40px 1fr 1fr',
                                                            gap: '12px', alignItems: 'center'
                                                        }}>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textAlign: 'center' }}>
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
                                                                        textAlign: 'center', fontWeight: 800, fontSize: '1rem',
                                                                        padding: '0.6rem', background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                                                                        borderRadius: '12px'
                                                                    }}
                                                                />
                                                                <span style={{
                                                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                                                    fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, pointerEvents: 'none',
                                                                    opacity: 0.6
                                                                }}>KG</span>
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
                                                                        textAlign: 'center', fontWeight: 800, fontSize: '1rem',
                                                                        padding: '0.6rem', background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                                                                        borderRadius: '12px'
                                                                    }}
                                                                />
                                                                <span style={{
                                                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                                                    fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, pointerEvents: 'none',
                                                                    opacity: 0.6
                                                                }}>REPS</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                /* VIEW MODE: badges */
                                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                                    {ex.sets.map((set, j) => (
                                                        <div key={j} style={{
                                                            background: 'var(--muted-color)',
                                                            padding: '0.4rem 0.75rem',
                                                            borderRadius: '10px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            border: set.completed ? '1px solid var(--success-color)' : '1px solid var(--border-color)',
                                                            color: 'var(--text-primary)',
                                                            opacity: 0.9
                                                        }}>
                                                            {set.weight} <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>KG</span> × {set.reps} <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>REPS</span>
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
