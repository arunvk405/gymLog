import React, { useState } from 'react';
import { MUSCLE_GROUPS } from '../data/program';
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

const TemplateEditor = ({ template, onSave, onCancel }) => {
    const isEditing = !!template;
    const [name, setName] = useState(template?.name || '');
    const [days, setDays] = useState(template?.days || []);
    const [expandedDay, setExpandedDay] = useState(null);

    const addDay = () => {
        setDays([...days, {
            day: days.length + 1,
            name: '',
            exercises: []
        }]);
        setExpandedDay(days.length);
    };

    const removeDay = (idx) => {
        const updated = days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 }));
        setDays(updated);
        setExpandedDay(null);
    };

    const updateDayName = (idx, val) => {
        const updated = [...days];
        updated[idx] = { ...updated[idx], name: val };
        setDays(updated);
    };

    const addExercise = (dayIdx) => {
        const updated = [...days];
        updated[dayIdx].exercises = [...updated[dayIdx].exercises, {
            id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: '',
            sets: 3,
            reps: 10,
            startWeight: 20,
            type: 'accessory',
            muscleGroup: 'Chest',
            progression: 2.5
        }];
        setDays(updated);
    };

    const removeExercise = (dayIdx, exIdx) => {
        const updated = [...days];
        updated[dayIdx].exercises = updated[dayIdx].exercises.filter((_, i) => i !== exIdx);
        setDays(updated);
    };

    const updateExercise = (dayIdx, exIdx, field, value) => {
        const updated = [...days];
        updated[dayIdx].exercises[exIdx] = { ...updated[dayIdx].exercises[exIdx], [field]: value };
        setDays(updated);
    };

    const handleSave = () => {
        if (!name.trim()) { alert('Please enter a template name'); return; }
        if (days.length === 0) { alert('Add at least one training day'); return; }
        for (let i = 0; i < days.length; i++) {
            if (!days[i].name.trim()) { alert(`Please name Day ${i + 1}`); return; }
            if (days[i].exercises.length === 0) { alert(`Day ${i + 1} needs at least one exercise`); return; }
            for (let j = 0; j < days[i].exercises.length; j++) {
                if (!days[i].exercises[j].name.trim()) { alert(`Please name all exercises in Day ${i + 1}`); return; }
            }
        }
        onSave({
            id: template?.id || `template_${Date.now()}`,
            name: name.trim(),
            isDefault: false,
            days
        });
    };

    return (
        <div className="fade-in" style={{ color: 'var(--text-primary)', paddingBottom: '6rem' }}>
            {/* STICKY HEADER */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'var(--bg-color)', padding: '1rem 0',
                borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="secondary" onClick={onCancel} style={{
                        padding: '0.5rem 0.8rem', borderRadius: '12px', display: 'flex',
                        alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700
                    }}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                        {isEditing ? 'Edit Template' : 'Create Template'}
                    </h2>
                    <button onClick={handleSave} style={{
                        padding: '0.5rem 0.8rem', borderRadius: '12px', display: 'flex',
                        alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700
                    }}>
                        <Save size={16} /> Save
                    </button>
                </div>
            </div>

            {/* HELPER TEXT */}
            <div className="panel" style={{
                marginBottom: '1.5rem', background: 'var(--muted-color)',
                border: '1px solid var(--border-color)', padding: '1rem'
            }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <b style={{ color: 'var(--text-primary)' }}>💡 Create your workout split</b><br />
                    Name your template, add training days, and fill each day with exercises.
                    Set the weight, sets, reps, and progression for auto-suggestions.
                </p>
            </div>

            {/* TEMPLATE NAME */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Template Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Push Pull Legs, Upper Lower, etc."
                    style={{ fontSize: '1rem', fontWeight: 700 }}
                />
            </div>

            {/* DAYS LIST */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                    Training Days ({days.length})
                </h3>
            </div>

            {days.map((day, dayIdx) => (
                <div key={dayIdx} className="panel" style={{
                    marginBottom: '1rem',
                    border: expandedDay === dayIdx ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    transition: 'border-color 0.2s ease'
                }}>
                    {/* Day Header */}
                    <div
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'var(--accent-color)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 900, color: 'white'
                            }}>
                                {day.day}
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {day.name || 'Tap to setup...'}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                        {expandedDay === dayIdx ? <ChevronUp size={18} color="var(--accent-color)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                    </div>

                    {/* Expanded Day Content */}
                    {expandedDay === dayIdx && (
                        <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
                            {/* Day Name Input */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>
                                    Day Name
                                </label>
                                <input
                                    type="text"
                                    value={day.name}
                                    onChange={(e) => updateDayName(dayIdx, e.target.value)}
                                    placeholder="e.g. Chest & Triceps, Pull Day, Legs..."
                                />
                            </div>

                            {/* Exercises */}
                            {day.exercises.map((ex, exIdx) => (
                                <div key={ex.id || exIdx} style={{
                                    background: 'var(--muted-color)', borderRadius: '14px', padding: '1rem',
                                    marginBottom: '0.8rem', border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Dumbbell size={14} color="var(--accent-color)" />
                                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800 }}>
                                                EXERCISE {exIdx + 1}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeExercise(dayIdx, exIdx)}
                                            style={{ padding: '4px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--error-color)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={ex.name}
                                        onChange={(e) => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                                        placeholder="e.g. Barbell Bench Press"
                                        style={{ marginBottom: '0.6rem', fontWeight: 700 }}
                                    />

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>SETS</label>
                                            <input type="number" min="1" max="10" value={ex.sets}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 1)}
                                                style={{ textAlign: 'center' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>REPS</label>
                                            <input type="number" min="1" max="100" value={ex.reps}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', parseInt(e.target.value) || 1)}
                                                style={{ textAlign: 'center' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>START WEIGHT (kg)</label>
                                            <input type="number" min="0" step="0.5" value={ex.startWeight}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'startWeight', parseFloat(e.target.value) || 0)}
                                                style={{ textAlign: 'center' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>PROGRESSION (kg)</label>
                                            <input type="number" min="0" step="0.5" value={ex.progression}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'progression', parseFloat(e.target.value) || 0)}
                                                style={{ textAlign: 'center' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>MUSCLE GROUP</label>
                                            <select value={ex.muscleGroup}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'muscleGroup', e.target.value)}>
                                                {MUSCLE_GROUPS.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>TYPE</label>
                                            <select value={ex.type}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'type', e.target.value)}>
                                                <option value="compound">Compound</option>
                                                <option value="accessory">Accessory</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Exercise */}
                            <button className="secondary" onClick={() => addExercise(dayIdx)} style={{
                                width: '100%', borderStyle: 'dashed', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px',
                                padding: '0.7rem', fontSize: '0.8rem', fontWeight: 700
                            }}>
                                <Plus size={16} /> Add Exercise
                            </button>

                            {/* Remove Day */}
                            <button className="secondary" onClick={() => removeDay(dayIdx)} style={{
                                width: '100%', marginTop: '0.8rem', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px',
                                padding: '0.6rem', fontSize: '0.75rem', fontWeight: 700,
                                color: 'var(--error-color)', borderColor: 'var(--error-color)'
                            }}>
                                <Trash2 size={13} /> Remove This Day
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Add Day Button */}
            <button className="secondary" onClick={addDay} style={{
                width: '100%', borderStyle: 'dashed', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '1rem', fontSize: '0.9rem', fontWeight: 700
            }}>
                <Plus size={18} /> Add Training Day
            </button>
        </div>
    );
};

export default TemplateEditor;
