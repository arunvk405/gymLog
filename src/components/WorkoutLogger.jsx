import React, { useState, useRef } from 'react';
import { saveWorkout } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowLeft, Loader2, Plus, CheckCircle2, Calendar, Trash2, Pencil, ChevronDown, ChevronDownSquare, X, Search } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { toast } from 'react-hot-toast';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'; // Corrected storage to firestore

// Web Audio API — uses 'ambient' audio session so it never interrupts background music.
// HTMLMediaElement (new Audio) triggers system 'playback' which ducks/pauses other audio.
let audioCtx = null;
let beepBuffer = null;

// Lazily create the AudioContext on first user gesture (required by browsers)
const getAudioCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

// Pre-load the beep buffer so playback is instant
const loadBeepBuffer = async () => {
    try {
        const ctx = getAudioCtx();
        const response = await fetch('/beep.wav');
        const arrayBuffer = await response.arrayBuffer();
        beepBuffer = await ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error('Failed to load beep buffer:', e);
    }
};

// Called on first user gesture to unlock AudioContext and pre-load the buffer
const initAudio = () => {
    try {
        const ctx = getAudioCtx();
        // Resume the context if it was suspended (autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        if (!beepBuffer) {
            loadBeepBuffer();
        }
    } catch (e) {
        console.error('Audio Init Failed:', e);
    }
};

const WorkoutLogger = ({ programDay, history, onFinish, onCancel, profile, exerciseDb, workoutStartTime = null, onMinimize }) => {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalRestTime, setTotalRestTime] = useState(0);
    const [timerEndTime, setTimerEndTime] = useState(null);
    const [timerLocation, setTimerLocation] = useState({ exIdx: null, setIdx: null });
    const restDuration = profile?.restTimer || 90;

    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [elapsedTime, setElapsedTime] = useState(0);

    const [workout, setWorkout] = useState(() => {
        const exercises = programDay.exercises.map(ex => {
            // history is already sorted newest-first from Firestore — no reverse() needed.
            // Also fall back to name matching in case template IDs differ across versions.
            const lastSession = history.find(s =>
                s.exercises.some(e =>
                    e.id === ex.id ||
                    (ex.syncWith && e.id === ex.syncWith) ||
                    e.name?.toLowerCase() === ex.name?.toLowerCase()
                )
            );
            const lastEx = lastSession?.exercises.find(e =>
                e.id === ex.id ||
                (ex.syncWith && e.id === ex.syncWith) ||
                e.name?.toLowerCase() === ex.name?.toLowerCase()
            );

            return {
                ...ex,
                sets: Array.from({ length: ex.sets }, (_, i) => {
                    const prevSet = lastEx?.sets[i] || lastEx?.sets[lastEx.sets.length - 1];
                    let fallbackWeight = ex.startWeight;
                    if (profile?.baseWeights) {
                        if (ex.id === 'bench_press' && profile.baseWeights.benchPress) fallbackWeight = profile.baseWeights.benchPress;
                        else if (ex.id === 'squat' && profile.baseWeights.squat) fallbackWeight = profile.baseWeights.squat;
                        else if (ex.id === 'deadlift' && profile.baseWeights.deadlift) fallbackWeight = profile.baseWeights.deadlift;
                        else if (ex.id === 'leg_press' && profile.baseWeights.legPress) fallbackWeight = profile.baseWeights.legPress;
                    }
                    const prevWeight = prevSet ? prevSet.weight : fallbackWeight;

                    let suggestedWeight = prevWeight;
                    const allLastExSetsSuccess = lastEx?.sets.every(s => s.reps >= ex.reps);
                    if (lastEx && allLastExSetsSuccess) {
                        suggestedWeight = prevWeight + ex.progression;
                    }

                    // Use previous session reps if available, otherwise fall back to program target
                    const prevReps = prevSet ? prevSet.reps : ex.reps;

                    return {
                        id: Date.now() + i,
                        weight: suggestedWeight,
                        reps: prevReps,
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

    // General elapsed time logic
    React.useEffect(() => {
        if (!workoutStartTime) return;
        const int = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
        }, 1000);
        return () => clearInterval(int);
    }, [workoutStartTime]);

    // Play Beep Sound via Web Audio API (does NOT interrupt background music)
    const playBeep = () => {
        try {
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            if (beepBuffer) {
                const source = ctx.createBufferSource();
                source.buffer = beepBuffer;
                source.connect(ctx.destination);
                source.start(0);
            } else {
                // Buffer not loaded yet — try to load and play after a short delay
                loadBeepBuffer().then(() => {
                    if (beepBuffer) {
                        const source = ctx.createBufferSource();
                        source.buffer = beepBuffer;
                        source.connect(ctx.destination);
                        source.start(0);
                    }
                });
            }
        } catch (e) {
            console.error('Audio beep failed', e);
        }
    };

    // Rest Timer Logic
    React.useEffect(() => {
        let timer = null;
        if (timerEndTime) {
            timer = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
                setTimeLeft(remaining);
                if (remaining === 0) {
                    setTimerEndTime(null);
                    playBeep();
                }
            }, 250); // Check frequently to ensure accuracy even in background
        } else {
            setTimeLeft(0);
        }
        return () => clearInterval(timer);
    }, [timerEndTime]);

    const startTimer = (exIdx, setIdx) => {
        initAudio(); // Unlock audio on user interaction

        const duration = profile?.restTimer || 90;
        setTimeLeft(duration);
        setTotalRestTime(duration);
        setTimerLocation({ exIdx, setIdx });
        setTimerEndTime(Date.now() + duration * 1000);
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
        } else if (timerEndTime && timerLocation.exIdx === exerciseIndex && timerLocation.setIdx === setIndex) {
            setTimerEndTime(null);
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

    // Bumps all sets in an exercise by a fixed amount
    const bumpAllWeights = (exerciseIndex, amount = 2.5) => {
        const newWorkout = { ...workout };
        newWorkout.exercises[exerciseIndex].sets = newWorkout.exercises[exerciseIndex].sets.map(s => ({
            ...s,
            weight: Math.round((parseFloat(s.weight || 0) + amount) * 100) / 100
        }));
        setWorkout(newWorkout);
    };

    // Bumps weight for a specific set
    const bumpSetWeight = (exerciseIndex, setIndex, amount) => {
        const newWorkout = { ...workout };
        const set = newWorkout.exercises[exerciseIndex].sets[setIndex];
        set.weight = Math.round((parseFloat(set.weight || 0) + amount) * 100) / 100;
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

    const handleAddExercise = (exercise) => {
        const newEx = {
            id: exercise.id,
            name: exercise.name,
            targetMuscleCategory: exercise.targetMuscleCategory,
            startWeight: 0,
            sets: [{ id: Date.now(), weight: 0, reps: 0, completed: false, prevWeight: 0 }]
        };
        setWorkout({ ...workout, exercises: [...workout.exercises, newEx] });
        setShowExerciseModal(false);
        setSearchQuery('');
    };

    const handleFinish = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const workoutToSave = {
                ...workout,
                totalTime: elapsedTime
            };
            await saveWorkout(workoutToSave, user.uid, workoutDate);
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
        <>
            <div className="fade-in" style={{ paddingBottom: '8rem' }}>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '1rem', marginBottom: '1.5rem',
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'var(--bg-color)',
                    borderBottom: '1px solid var(--border-color)',
                    gap: '0.8rem'
                }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="secondary" style={{ padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => {
                            const hasCompletedSets = workout.exercises.some(ex => ex.sets.some(s => s.completed));
                            if (hasCompletedSets) {
                                if (window.confirm("You have completed sets. Are you sure you want to cancel this workout? Progress won't be saved.")) {
                                    onCancel();
                                }
                            } else {
                                onCancel();
                            }
                        }}>
                            <ArrowLeft size={18} />
                        </button>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{workout.name}</h2>
                            <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 800 }}>
                                {formatTime(elapsedTime)}
                            </div>
                        </div>
                        <button className="secondary" style={{ padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }} onClick={onMinimize}>
                            <ChevronDownSquare size={18} /> Min
                        </button>
                    </div>

                    <div
                        style={{
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                            cursor: 'pointer', background: 'var(--muted-color)',
                            padding: '8px 24px', borderRadius: '12px', position: 'relative',
                            border: '1px solid var(--border-color)', overflow: 'hidden',
                            width: '200px'
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {isToday(new Date(workoutDate + 'T12:00:00')) ? 'Today' : format(new Date(workoutDate + 'T12:00:00'), 'MMM dd, yyyy')}
                        </span>
                        <Calendar size={12} color="var(--text-primary)" style={{ marginLeft: '4px' }} />
                        <input
                            type="date"
                            value={workoutDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                if (e.target.value) setWorkoutDate(e.target.value);
                            }}
                            className="date-picker-input"
                        />
                    </div>
                </div>

                {/* GLOBAL WORKOUT ADJUSTMENT */}
                <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                    <button 
                        onClick={() => {
                            const newWorkout = { ...workout };
                            newWorkout.exercises.forEach(ex => {
                                ex.sets = ex.sets.map(s => ({
                                    ...s,
                                    weight: Math.round((parseFloat(s.weight || 0) + 2.5) * 100) / 100
                                }));
                            });
                            setWorkout(newWorkout);
                        }}
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '12px',
                            background: 'var(--muted-color)',
                            border: '1px solid var(--accent-color)',
                            color: 'var(--accent-color)',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <Plus size={16} /> Increase Entire Workout (+2.5kg)
                    </button>
                </div>

                {workout.exercises.map((ex, exIdx) => (
                    <div key={ex.id || exIdx} className="panel" style={{ padding: '1.2rem', marginBottom: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
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

                        {/* Quick-bump row for entire exercise */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Bump All Sets:</span>
                            {[-2.5, 2.5, 3, 5, 10].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => bumpAllWeights(exIdx, amount)}
                                    style={{
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '8px',
                                        background: amount > 0 ? 'var(--accent-color)' : 'var(--muted-color)',
                                        border: 'none',
                                        color: amount > 0 ? 'white' : 'var(--text-primary)',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {amount > 0 ? '+' : ''}{amount}kg
                                </button>
                            ))}
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
                                            inputMode="decimal"
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
                                        inputMode="numeric"
                                        pattern="[0-9]*"
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
                                {timerEndTime && timerLocation.exIdx === exIdx && timerLocation.setIdx === setIdx && (
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
                                                        setTimerEndTime(prev => prev + 30000);
                                                        setTotalRestTime(prev => prev + 30);
                                                    }}
                                                    style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--panel-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.6rem' }}
                                                >
                                                    +30s
                                                </button>
                                                <button
                                                    onClick={() => setTimerEndTime(null)}
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
                                                transition: 'width 0.25s linear'
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

                <div style={{ padding: '0 1rem 2rem 1rem' }}>
                    <button
                        className="secondary"
                        onClick={() => setShowExerciseModal(true)}
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontWeight: 800, borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--accent-color)',
                            color: 'var(--accent-color)', background: 'rgba(56, 189, 248, 0.05)'
                        }}
                    >
                        <Plus size={20} /> Add Exercise
                    </button>
                </div>

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

            {/* Exercise Selection Modal */}
            {
                showExerciseModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'var(--bg-color)', zIndex: 3000, display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => setShowExerciseModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}>
                                <X size={24} />
                            </button>
                            <input
                                type="text"
                                placeholder="Find an exercise..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', background: 'var(--panel-color)' }}
                            />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {(exerciseDb || []).filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase())).map(ex => (
                                <div
                                    key={ex.id}
                                    onClick={() => handleAddExercise(ex)}
                                    style={{
                                        padding: '1rem', background: 'var(--panel-color)',
                                        border: '1px solid var(--border-color)', borderRadius: '12px',
                                        marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', cursor: 'pointer'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{ex.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.targetMuscleCategory}</div>
                                    </div>
                                    <Plus size={20} color="var(--accent-color)" />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default WorkoutLogger;
