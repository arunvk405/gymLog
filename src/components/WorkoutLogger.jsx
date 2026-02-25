import React, { useState } from 'react';
import { DEFAULT_PROGRAM } from '../data/program';
import { saveWorkout } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Check, X, Loader2, Plus, CheckCircle2 } from 'lucide-react';

const WorkoutLogger = ({ onFinish, onCancel, dayIndex, history }) => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const programDay = DEFAULT_PROGRAM[dayIndex];

    const [workout, setWorkout] = useState(() => {
        const exercises = programDay.exercises.map(ex => {
            const lastSession = [...history].reverse().find(s => s.exercises.some(e => e.id === ex.id || (ex.syncWith && e.id === ex.syncWith)));
            const lastEx = lastSession?.exercises.find(e => e.id === ex.id || (ex.syncWith && e.id === ex.syncWith));

            return {
                ...ex,
                sets: Array.from({ length: ex.sets }, (_, i) => {
                    const prevSet = lastEx?.sets[i] || lastEx?.sets[lastEx.sets.length - 1];
                    const prevWeight = prevSet ? prevSet.weight : ex.startWeight;

                    let suggestedWeight = prevWeight;
                    const allLastExSetsSuccess = lastEx?.sets.every(s => s.reps >= ex.reps);
                    if (lastEx && allLastExSetsSuccess) {
                        suggestedWeight = prevWeight + ex.progression;
                    }

                    return {
                        id: Date.now() + i,
                        weight: suggestedWeight,
                        reps: ex.reps,
                        completed: false,
                        prevWeight: prevWeight
                    };
                })
            };
        });

        return {
            day: programDay.day,
            name: programDay.name,
            exercises
        };
    });

    const updateSet = (exerciseIndex, setIndex, field, value) => {
        const newWorkout = { ...workout };
        newWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
        setWorkout(newWorkout);
    };

    const toggleSet = (exerciseIndex, setIndex) => {
        const newWorkout = { ...workout };
        newWorkout.exercises[exerciseIndex].sets[setIndex].completed = !newWorkout.exercises[exerciseIndex].sets[setIndex].completed;
        setWorkout(newWorkout);
    };

    const addSet = (exerciseIndex) => {
        const newWorkout = { ...workout };
        const exercise = newWorkout.exercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];

        exercise.sets.push({
            id: Date.now(),
            weight: lastSet ? lastSet.weight : exercise.startWeight,
            reps: lastSet ? lastSet.reps : exercise.reps,
            completed: false,
            prevWeight: lastSet ? lastSet.prevWeight : exercise.startWeight
        });

        setWorkout(newWorkout);
    };

    const selectAllSets = (exerciseIndex) => {
        const newWorkout = { ...workout };
        const exercise = newWorkout.exercises[exerciseIndex];
        const allCompleted = exercise.sets.every(s => s.completed);

        exercise.sets = exercise.sets.map(s => ({
            ...s,
            completed: !allCompleted
        }));

        setWorkout(newWorkout);
    };

    const handleFinish = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await saveWorkout(workout, user.uid);
            onFinish();
        } catch (err) {
            console.error("Logger Save Error:", err);
            alert("Failed to save workout to Firebase: " + err.message + "\n\n1. Go to Firebase Console > Build > Firestore Database.\n2. Go to the 'Rules' tab.\n3. Ensure rules allow read/write. For testing, set:\n   allow read, write: if request.auth != null;");
            setIsSaving(false);
        }
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="secondary" style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex' }} onClick={onCancel}>
                    <X size={20} />
                </button>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{workout.name}</h2>
                <div style={{ width: '38px' }}></div>
            </div>

            {workout.exercises.map((ex, exIdx) => (
                <div key={ex.id || exIdx} className="panel" style={{ padding: '1.2rem', marginBottom: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-color)', fontWeight: 800 }}>{ex.name}</h3>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>{ex.sets.filter(s => s.completed).length} / {ex.sets.length} DONE</div>
                            <button
                                onClick={() => selectAllSets(exIdx)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-color)',
                                    fontSize: '0.75rem',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    marginLeft: 'auto'
                                }}
                            >
                                <CheckCircle2 size={14} />
                                {ex.sets.every(s => s.completed) ? 'Deselect' : 'Select All'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(30px, 0.5fr) 2fr 2fr 1fr', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.8 }}>
                        <span>Set</span>
                        <span style={{ textAlign: 'center' }}>KG</span>
                        <span style={{ textAlign: 'center' }}>Reps</span>
                        <span style={{ textAlign: 'right' }}>Log</span>
                    </div>

                    {ex.sets.map((set, setIdx) => (
                        <div key={set.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(30px, 0.5fr) 2fr 2fr 1fr', gap: '0.8rem', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>{setIdx + 1}</span>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => updateSet(exIdx, setIdx, 'weight', parseFloat(e.target.value) || 0)}
                                    step="0.5"
                                    style={{ textAlign: 'center', fontWeight: 800, padding: '0.8rem 0', fontSize: '1.1rem', background: 'var(--muted-color)' }}
                                />
                                <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 800 }}>
                                    LAST: {set.prevWeight}kg
                                </div>
                            </div>

                            <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)}
                                style={{ textAlign: 'center', fontWeight: 800, padding: '0.8rem 0', fontSize: '1.1rem', background: 'var(--muted-color)' }}
                            />

                            <button
                                onClick={() => toggleSet(exIdx, setIdx)}
                                style={{
                                    backgroundColor: set.completed ? 'var(--success-color)' : 'transparent',
                                    border: `2px solid ${set.completed ? 'var(--success-color)' : 'var(--border-color)'}`,
                                    padding: '0.6rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: set.completed ? 'white' : 'transparent',
                                    width: '40px',
                                    height: '40px',
                                    justifySelf: 'end',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <Check size={20} />
                            </button>
                        </div>
                    ))}

                    <button
                        className="secondary"
                        onClick={() => addSet(exIdx)}
                        style={{
                            width: '100%',
                            marginTop: '0.5rem',
                            borderStyle: 'dashed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '0.85rem'
                        }}
                    >
                        <Plus size={16} /> Add New Set
                    </button>
                </div>
            ))}

            <div style={{ position: 'fixed', bottom: '1.5rem', left: '1rem', right: '1rem', maxWidth: '800px', margin: '0 auto', zIndex: 1001 }}>
                <button
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        padding: '1.2rem',
                        fontSize: '1.1rem',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        background: 'var(--accent-secondary)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                    onClick={handleFinish}
                >
                    {isSaving ? <Loader2 size={24} className="spin" /> : <><Check size={24} /> Finish Workout</>}
                </button>
            </div>
        </div>
    );
};

export default WorkoutLogger;
