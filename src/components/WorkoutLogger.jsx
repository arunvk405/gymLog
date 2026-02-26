import React, { useState, useRef } from 'react';
import { saveWorkout } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowLeft, Loader2, Plus, CheckCircle2, Calendar, Trash2, Pencil, ChevronDown } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { toast } from 'react-hot-toast';

const WorkoutLogger = ({ onFinish, onCancel, programDay, history, profile }) => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalRestTime, setTotalRestTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [timerLocation, setTimerLocation] = useState({ exIdx: null, setIdx: null });
    const restDuration = profile?.restTimer || 90;

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

    // Timer Logic
    React.useEffect(() => {
        let timer = null;
        if (timerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(timer);
    }, [timerActive, timeLeft]);

    const startTimer = (exIdx, setIdx) => {
        const duration = profile?.restTimer || 90;
        setTimeLeft(duration);
        setTotalRestTime(duration);
        setTimerLocation({ exIdx, setIdx });
        setTimerActive(true);
    };

    const updateSet = (exerciseIndex, setIndex, field, value) => {
        const newWorkout = { ...workout };
        newWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
        setWorkout(newWorkout);
    };

    const toggleSet = (exerciseIndex, setIndex) => {
        const newWorkout = { ...workout };
        const set = newWorkout.exercises[exerciseIndex].sets[setIndex];
        set.completed = !set.completed;

        if (set.completed) {
            startTimer(exerciseIndex, setIndex);
        } else if (timerActive && timerLocation.exIdx === exerciseIndex && timerLocation.setIdx === setIndex) {
            setTimerActive(false);
        }

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

    const deleteSet = (exerciseIndex, setIndex) => {
        const newWorkout = { ...workout };
        const exercise = newWorkout.exercises[exerciseIndex];
        if (exercise.sets.length <= 1) return; // Keep at least 1 set
        exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
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

        if (!allCompleted) {
            const lastSetIdx = exercise.sets.length - 1;
            startTimer(exerciseIndex, lastSetIdx);
        }

        setWorkout(newWorkout);
    };

    const handleFinish = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await saveWorkout(workout, user.uid, workoutDate);
            toast.success("Workout logged!");
            onFinish();
        } catch (err) {
            console.error("Logger Save Error:", err);
            toast.error("Failed to save workout");
            setIsSaving(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '8rem' }}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '1rem', marginBottom: '1.5rem',
                position: 'sticky', top: 0, zIndex: 50,
                background: 'var(--bg-color)',
                borderBottom: '1px solid var(--border-color)',
                gap: '0.5rem'
            }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="secondary" style={{ padding: '0.5rem 0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }} onClick={onCancel}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{workout.name}</h2>

                        <div
                            onClick={() => {
                                const input = document.getElementById('session-date-input');
                                if (input && input.showPicker) {
                                    input.showPicker();
                                } else if (input) {
                                    input.click();
                                }
                            }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                marginTop: '4px', cursor: 'pointer',
                                background: 'var(--muted-color)',
                                padding: '3px 10px',
                                borderRadius: '10px',
                                transition: 'all 0.2s ease',
                                border: '1px solid transparent'
                            }}
                        >
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {isToday(new Date(workoutDate + 'T12:00:00')) ? 'Today' : format(new Date(workoutDate + 'T12:00:00'), 'MMM dd, yyyy')}
                            </span>
                            <ChevronDown size={10} color="var(--accent-color)" />
                            <input
                                id="session-date-input"
                                type="date"
                                value={workoutDate}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setWorkoutDate(e.target.value)}
                                style={{
                                    position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ width: '70px' }}></div>
                </div>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(30px, 0.4fr) 2fr 2fr 0.6fr 0.4fr', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.8 }}>
                        <span>Set</span>
                        <span style={{ textAlign: 'center' }}>KG</span>
                        <span style={{ textAlign: 'center' }}>Reps</span>
                        <span style={{ textAlign: 'center' }}>Log</span>
                        <span></span>
                    </div>

                    {ex.sets.map((set, setIdx) => (
                        <React.Fragment key={set.id}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(30px, 0.4fr) 2fr 2fr 0.6fr 0.4fr', gap: '0.8rem', alignItems: 'center', marginBottom: '1.2rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>{setIdx + 1}</span>

                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={set.weight}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            updateSet(exIdx, setIdx, 'weight', val === '' ? '' : parseFloat(val));
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value === '' || isNaN(e.target.value)) updateSet(exIdx, setIdx, 'weight', 0);
                                        }}
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
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateSet(exIdx, setIdx, 'reps', val === '' ? '' : parseInt(val));
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === '' || isNaN(e.target.value)) updateSet(exIdx, setIdx, 'reps', 0);
                                    }}
                                    style={{ textAlign: 'center', fontWeight: 800, padding: '0.8rem 0', fontSize: '1.1rem', background: 'var(--muted-color)' }}
                                />

                                <button
                                    onClick={() => toggleSet(exIdx, setIdx)}
                                    style={{
                                        backgroundColor: set.completed ? 'var(--success-color)' : 'transparent',
                                        border: `2px solid ${set.completed ? 'var(--success-color)' : 'var(--border-color)'}`,
                                        padding: '0.4rem',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: set.completed ? 'white' : 'transparent',
                                        width: '34px',
                                        height: '34px',
                                        justifySelf: 'center',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <Check size={16} />
                                </button>

                                {/* Delete set */}
                                <button
                                    onClick={() => deleteSet(exIdx, setIdx)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '4px', justifySelf: 'center',
                                        color: ex.sets.length > 1 ? 'var(--error-color)' : 'var(--border-color)',
                                        opacity: ex.sets.length > 1 ? 0.6 : 0.2
                                    }}
                                    disabled={ex.sets.length <= 1}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* COMPACT INLINE REST TIMER */}
                            {timerActive && timerLocation.exIdx === exIdx && timerLocation.setIdx === setIdx && (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    background: 'var(--muted-color)',
                                    borderRadius: '12px',
                                    padding: '0.4rem 0.8rem',
                                    margin: '0 auto 1.2rem auto',
                                    width: '90%',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    animation: 'slide-down 0.2s ease-out'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Loader2 size={12} className="spin" color="var(--accent-color)" />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-color)', letterSpacing: '0.5px' }}>{formatTime(timeLeft)}</span>
                                            <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', opacity: 0.8 }}>Resting</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => {
                                                    setTimeLeft(prev => prev + 30);
                                                    setTotalRestTime(prev => prev + 30);
                                                }}
                                                style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--panel-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.6rem' }}
                                            >
                                                +30s
                                            </button>
                                            <button
                                                onClick={() => setTimerActive(false)}
                                                style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--accent-color)', border: 'none', color: 'white', fontWeight: 800, fontSize: '0.6rem' }}
                                            >
                                                SKIP
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ height: '3px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            background: 'var(--accent-color)',
                                            width: `${(timeLeft / totalRestTime) * 100}%`,
                                            transition: 'width 1s linear'
                                        }} />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
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
