import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp, Dumbbell, Search, X, RotateCcw, GripVertical, Target, Activity, Zap, BicepsFlexed, Shield, Sword } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { DEFAULT_TEMPLATE } from '../data/program';
import { toast } from 'react-hot-toast';

const getWorkoutIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes('chest') || n.includes('bench')) return <Target size={16} color="var(--accent-color)" />;
    if (n.includes('back') || n.includes('row')) return <Activity size={16} color="var(--accent-color)" />;
    if (n.includes('leg') || n.includes('squat')) return <Zap size={16} color="var(--accent-color)" />;
    if (n.includes('arm') || n.includes('bicep') || n.includes('tricep')) return <BicepsFlexed size={16} color="var(--accent-color)" />;
    if (n.includes('shoulder')) return <Shield size={16} color="var(--accent-color)" />;
    return <Sword size={16} color="var(--accent-color)" />;
};

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
            {/* Header Area */}
            <div style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                    padding: '1.25rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: 'var(--muted-color)', borderRadius: '12px' }}>
                            <Search size={18} color="var(--accent-color)" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Select Exercise</h3>
                    </div>
                    <button onClick={onClose} className="secondary dp-btn" style={{
                        width: '36px', height: '36px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search exercises..."
                            style={{ paddingLeft: '2.2rem', fontSize: '0.9rem', width: '100%' }}
                        />
                    </div>

                    {/* Muscle Group Filter Chips */}
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {groups.map(g => (
                            <button
                                key={g}
                                onClick={() => setFilterGroup(g)}
                                style={{
                                    padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
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
            </div>

            {/* Exercise List */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
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
                            width: '100%', textAlign: 'left', padding: '1rem', marginBottom: '8px',
                            background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                            borderRadius: '16px', cursor: 'pointer', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center',
                            color: 'var(--text-primary)', transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', background: 'var(--muted-color)', borderRadius: '10px' }}>
                                {getWorkoutIcon(ex.name)}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{ex.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    {ex.muscleGroup} · {ex.type}
                                </div>
                            </div>
                        </div>
                        <Plus size={18} color="var(--accent-color)" />
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
    const [expandedDay, setExpandedDay] = useState(template?._expandDay !== undefined ? template._expandDay : null);
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

    const moveExercise = (dayIdx, exIdx, direction) => {
        const updated = [...days];
        const dayExercises = [...updated[dayIdx].exercises];
        const targetIdx = direction === 'up' ? exIdx - 1 : exIdx + 1;
        
        if (targetIdx < 0 || targetIdx >= dayExercises.length) return;
        
        const [moved] = dayExercises.splice(exIdx, 1);
        dayExercises.splice(targetIdx, 0, moved);
        updated[dayIdx].exercises = dayExercises;
        setDays(updated);
    };

    const moveDay = (idx, direction) => {
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= days.length) return;
        
        const updated = [...days];
        const [moved] = updated.splice(idx, 1);
        updated.splice(targetIdx, 0, moved);
        
        // Re-number day sequence
        const renumbered = updated.map((d, i) => ({ ...d, day: i + 1 }));
        setDays(renumbered);
        setExpandedDay(targetIdx);
    };

    const handleDragEnd = (result, dayIdx) => {
        if (!result.destination) return;
        const updated = [...days];
        const dayExercises = [...updated[dayIdx].exercises];
        const [reorderedItem] = dayExercises.splice(result.source.index, 1);
        dayExercises.splice(result.destination.index, 0, reorderedItem);
        updated[dayIdx].exercises = dayExercises;
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

    const resetToDefault = () => {
        if (window.confirm("Are you sure you want to revert this template to the system's Default 4-Day Split? This will overwrite your current days and exercises below.")) {
            setName(DEFAULT_TEMPLATE.name + " (Copy)");
            setDays(JSON.parse(JSON.stringify(DEFAULT_TEMPLATE.days)));
            toast.success("Restored to default split");
        }
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
                background: 'var(--bg-color)', padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <button className="secondary dp-btn" onClick={onCancel} style={{
                        padding: '0.5rem 0.75rem', borderRadius: '12px', display: 'flex',
                        alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800,
                        border: '1px solid var(--border-color)', background: 'var(--panel-color)',
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                        <ArrowLeft size={16} /> BACK
                    </button>
                    
                    <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', flex: 1, padding: '0 8px' }} className="text-gradient">
                        {isEditing ? 'Edit Template' : 'Create Template'}
                    </h2>

                    <button className="dp-btn" onClick={handleSave} style={{
                        padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex',
                        alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800,
                        background: 'var(--text-primary)', color: 'var(--bg-color)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                        <Save size={16} /> SAVE
                    </button>
                </div>
            </div>

            {/* HELPER TEXT */}
            <div className="panel" style={{
                margin: '1rem', background: 'var(--muted-color)',
                border: '1px solid var(--border-color)', padding: '1.25rem',
                borderRadius: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'var(--accent-color)', borderRadius: '10px', color: 'white' }}>
                        <Zap size={18} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <b style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Build Your Blueprint</b><br />
                        Define your split, add training days, and pick exercises. We've pre-configured sets and reps based on elite training standards.
                    </p>
                </div>
            </div>

            <div style={{ padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <button
                        className="secondary dp-btn"
                        onClick={resetToDefault}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '12px', display: 'flex',
                            alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800,
                            color: 'var(--text-secondary)', border: '1px solid var(--border-color)'
                        }}
                    >
                        <RotateCcw size={14} /> RESTORE DEFAULT SPLIT
                    </button>
                </div>
            </div>

            <div style={{ padding: '0 1rem' }}>
                {/* TEMPLATE NAME */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Blueprint Title
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. PUSH PULL LEGS"
                        style={{ 
                            fontSize: '1.25rem', fontWeight: 800, 
                            padding: '1rem 1.25rem', borderRadius: '16px',
                            border: '2px solid var(--border-color)',
                            background: 'var(--panel-color)',
                            transition: 'all 0.2s ease'
                        }}
                    />
                </div>

                {/* DAYS LIST */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                        TRAINING DAYS <span style={{ color: 'var(--accent-color)' }}>({days.length})</span>
                    </h3>
                </div>
            </div>

            <div style={{ padding: '0 1rem' }}>
                {days.map((day, dayIdx) => (
                    <div key={dayIdx} className="panel" style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        borderRadius: '24px',
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '8px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveDay(dayIdx, 'up'); }}
                                        disabled={dayIdx === 0}
                                        style={{ background: 'none', border: 'none', padding: 0, opacity: dayIdx === 0 ? 0.3 : 1, color: 'var(--text-secondary)' }}
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveDay(dayIdx, 'down'); }}
                                        disabled={dayIdx === days.length - 1}
                                        style={{ background: 'none', border: 'none', padding: 0, opacity: dayIdx === days.length - 1 ? 0.3 : 1, color: 'var(--text-secondary)' }}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                                {expandedDay === dayIdx ? <ChevronUp size={18} color="var(--accent-color)" /> : <ChevronDown size={18} color="var(--text-secondary)" />}
                            </div>
                        </div>

                        {/* Expanded Day Content */}
                        {expandedDay === dayIdx && (
                            <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
                                {/* Day Name Input */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        DAY NAME
                                    </label>
                                    <input
                                        type="text"
                                        value={day.name}
                                        onChange={(e) => updateDayName(dayIdx, e.target.value)}
                                        placeholder="e.g. Chest & Triceps, Pull Day, Legs..."
                                        style={{ fontSize: '1.1rem', fontWeight: 700, padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                                    />
                                </div>

                                {/* Exercise List */}
                                <DragDropContext onDragEnd={(result) => handleDragEnd(result, dayIdx)}>
                                    <Droppable droppableId={`day-${dayIdx}`}>
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                                {day.exercises.map((ex, exIdx) => (
                                                    <Draggable 
                                                        key={`${ex.id}-${exIdx}`} 
                                                        draggableId={`${ex.id}-${exIdx}`} 
                                                        index={exIdx}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    background: snapshot.isDragging ? 'var(--bg-color)' : 'var(--muted-color)',
                                                                    borderRadius: '14px',
                                                                    padding: '1rem',
                                                                    marginBottom: '0.8rem',
                                                                    border: snapshot.isDragging ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                                                                    boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
                                                                    opacity: snapshot.isDragging ? 0.9 : 1,
                                                                    zIndex: snapshot.isDragging ? 1000 : 1
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <div {...provided.dragHandleProps} style={{ padding: '0 4px', cursor: 'grab', color: 'var(--text-secondary)', opacity: 0.5 }}>
                                                                            <GripVertical size={20} />
                                                                        </div>
                                                                        <div className="glass-panel" style={{ padding: '6px', borderRadius: '8px' }}>
                                                                            {getWorkoutIcon(ex.name)}
                                                                        </div>
                                                                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.2px' }}>
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
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', paddingLeft: '28px' }}>
                                                                    {ex.muscleGroup} · {ex.type}
                                                                </div>
                                                                
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', paddingLeft: '44px' }}>
                                                                    <div>
                                                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, display: 'block', marginBottom: '6px', textTransform: 'uppercase', opacity: 0.7 }}>SETS</label>
                                                                        <input type="number" min="1" max="10" value={ex.sets}
                                                                            onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 1)}
                                                                            style={{ textAlign: 'center', fontSize: '1rem', padding: '0.6rem', borderRadius: '10px', fontWeight: 700, background: 'var(--panel-color)' }} />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, display: 'block', marginBottom: '6px', textTransform: 'uppercase', opacity: 0.7 }}>REPS</label>
                                                                        <input type="number" min="1" max="100" value={ex.reps}
                                                                            onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', parseInt(e.target.value) || 1)}
                                                                            style={{ textAlign: 'center', fontSize: '1rem', padding: '0.6rem', borderRadius: '10px', fontWeight: 700, background: 'var(--panel-color)' }} />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, display: 'block', marginBottom: '6px', textTransform: 'uppercase', opacity: 0.7 }}>WEIGHT</label>
                                                                        <input type="number" min="0" step="0.5" value={ex.startWeight}
                                                                            onChange={(e) => updateExercise(dayIdx, exIdx, 'startWeight', parseFloat(e.target.value) || 0)}
                                                                            style={{ textAlign: 'center', fontSize: '1rem', padding: '0.6rem', borderRadius: '10px', fontWeight: 700, background: 'var(--panel-color)' }} />
                                                                    </div>
                                                                    <div>
                                                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, display: 'block', marginBottom: '6px', textTransform: 'uppercase', opacity: 0.7 }}>+KG</label>
                                                                        <input type="number" min="0" step="0.5" value={ex.progression}
                                                                            onChange={(e) => updateExercise(dayIdx, exIdx, 'progression', parseFloat(e.target.value) || 0)}
                                                                            style={{ textAlign: 'center', fontSize: '1rem', padding: '0.6rem', borderRadius: '10px', fontWeight: 700, background: 'var(--panel-color)' }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>

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
                <button className="secondary dp-btn" onClick={addDay} style={{
                    width: '100%', border: '2px dashed var(--border-color)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '1.25rem', borderRadius: '20px', background: 'var(--muted-color)',
                    fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)',
                    marginTop: '0.5rem'
                }}>
                    <Plus size={20} color="var(--accent-color)" /> ADD TRAINING DAY
                </button>
            </div>
        </div>
    );
};

export default TemplateEditor;
