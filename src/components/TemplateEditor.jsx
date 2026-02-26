import React, { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MUSCLE_GROUPS } from '../data/program';
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Dumbbell, Search, X } from 'lucide-react';

const ExercisePicker = ({ exerciseDb, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const [filterGroup, setFilterGroup] = useState('All');
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const filtered = useMemo(() => {
        let list = exerciseDb || [];
        if (filterGroup !== 'All') list = list.filter(e => e.muscleGroup === filterGroup);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(e => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q));
        }
        return list;
    }, [exerciseDb, search, filterGroup]);

    const groups = useMemo(() => {
        const g = [...new Set((exerciseDb || []).map(e => e.muscleGroup))].sort();
        return ['All', ...g];
    }, [exerciseDb]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg-color)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem', borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-color)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Select Exercise</h3>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '4px', color: 'var(--text-secondary)'
                    }}>
                        <X size={22} />
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search exercises..."
                        style={{ paddingLeft: '2.2rem', fontSize: '0.9rem' }}
                    />
                </div>

                {/* Muscle Group Filter Chips */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {groups.map(g => (
                        <button
                            key={g}
                            onClick={() => setFilterGroup(g)}
                            style={{
                                padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                                whiteSpace: 'nowrap', cursor: 'pointer', border: '1px solid var(--border-color)',
                                background: filterGroup === g ? 'var(--accent-color)' : 'var(--panel-color)',
                                color: filterGroup === g ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercise List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem 1rem' }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        No exercises found
                    </div>
                )}
                {filtered.map(ex => (
                    <button
                        key={ex.id}
                        onClick={() => onSelect(ex)}
                        style={{
                            width: '100%', textAlign: 'left', padding: '0.9rem 1rem', marginBottom: '4px',
                            background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                            borderRadius: '12px', cursor: 'pointer', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center',
                            color: 'var(--text-primary)', transition: 'background 0.15s ease'
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{ex.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {ex.muscleGroup} · {ex.type} · {ex.defaultSets}×{ex.defaultReps} @ {ex.defaultWeight}kg
                            </div>
                        </div>
                        <Plus size={16} color="var(--accent-color)" />
                    </button>
                ))}
            </div>
        </div>
    );
};

const TemplateEditor = ({ template, exerciseDb, onSave, onCancel }) => {
    const isEditing = !!template;
    const [name, setName] = useState(template?.name || '');
    const [days, setDays] = useState(template?.days || []);
    const [expandedDay, setExpandedDay] = useState(null);
    const [pickingForDay, setPickingForDay] = useState(null); // index of day we're picking exercise for

    const addDay = () => {
        setDays([...days, { day: days.length + 1, name: '', exercises: [] }]);
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

    const addExerciseFromPicker = (dayIdx, exerciseData) => {
        const updated = [...days];
        updated[dayIdx].exercises = [...updated[dayIdx].exercises, {
            id: exerciseData.id,
            name: exerciseData.name,
            sets: exerciseData.defaultSets,
            reps: exerciseData.defaultReps,
            startWeight: exerciseData.defaultWeight,
            type: exerciseData.type,
            muscleGroup: exerciseData.muscleGroup,
            progression: exerciseData.progression
        }];
        setDays(updated);
        setPickingForDay(null);
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
        if (!name.trim()) { toast.error('Please enter a template name'); return; }
        if (days.length === 0) { toast.error('Add at least one training day'); return; }
        for (let i = 0; i < days.length; i++) {
            if (!days[i].name.trim()) { toast.error(`Please name Day ${i + 1}`); return; }
            if (days[i].exercises.length === 0) { toast.error(`Day ${i + 1} needs at least one exercise`); return; }
        }
        onSave({
            id: template?.id || `template_${Date.now()}`,
            name: name.trim(),
            isDefault: false,
            days
        });
    };

    // Full-screen exercise picker
    if (pickingForDay !== null) {
        return (
            <ExercisePicker
                exerciseDb={exerciseDb}
                onSelect={(ex) => addExerciseFromPicker(pickingForDay, ex)}
                onClose={() => setPickingForDay(null)}
            />
        );
    }

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
                    Name your template, add training days, and pick exercises from the library.
                    Each exercise comes with preset sets, reps, and weight suggestions.
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

                            {/* Exercise List */}
                            {day.exercises.map((ex, exIdx) => (
                                <div key={ex.id || exIdx} style={{
                                    background: 'var(--muted-color)', borderRadius: '14px', padding: '1rem',
                                    marginBottom: '0.8rem', border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Dumbbell size={14} color="var(--accent-color)" />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {ex.name}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeExercise(dayIdx, exIdx)}
                                            style={{ padding: '4px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--error-color)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                                        {ex.muscleGroup} · {ex.type}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>SETS</label>
                                            <input type="number" min="1" max="10" value={ex.sets}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 1)}
                                                style={{ textAlign: 'center', fontSize: '0.85rem', padding: '0.4rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>REPS</label>
                                            <input type="number" min="1" max="100" value={ex.reps}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', parseInt(e.target.value) || 1)}
                                                style={{ textAlign: 'center', fontSize: '0.85rem', padding: '0.4rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>WEIGHT</label>
                                            <input type="number" min="0" step="0.5" value={ex.startWeight}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'startWeight', parseFloat(e.target.value) || 0)}
                                                style={{ textAlign: 'center', fontSize: '0.85rem', padding: '0.4rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>+KG</label>
                                            <input type="number" min="0" step="0.5" value={ex.progression}
                                                onChange={(e) => updateExercise(dayIdx, exIdx, 'progression', parseFloat(e.target.value) || 0)}
                                                style={{ textAlign: 'center', fontSize: '0.85rem', padding: '0.4rem' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Exercise from Library */}
                            <button className="secondary" onClick={() => setPickingForDay(dayIdx)} style={{
                                width: '100%', borderStyle: 'dashed', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px',
                                padding: '0.8rem', fontSize: '0.85rem', fontWeight: 700
                            }}>
                                <Search size={16} /> Browse Exercise Library
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
