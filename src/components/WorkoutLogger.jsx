import React, { useState, useRef } from 'react';
import { saveWorkout } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { format, isToday } from 'date-fns';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Check, ArrowLeft, Loader2, Plus, CheckCircle2, Calendar, Trash2, Pencil, ChevronDown, ChevronDownSquare, X, Search, Activity, Zap, Target, BicepsFlexed, Shield, Sword, Crown, Quote, Calculator, Info } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../data/motivation';
import CustomDatePicker from './CustomDatePicker';
import PlateCalculatorModal from './PlateCalculatorModal';
import ExerciseDetailModal from './ExerciseDetailModal';
import CreateExerciseModal from './CreateExerciseModal';
import AnatomyViewer from './AnatomyViewer';
import { normalizeExerciseMuscles, getRegionDisplayName } from '../data/muscles';
import { EXERCISE_DATABASE } from '../data/exercises';
import { isCardioExercise } from '../utils/analytics';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Web Audio API — uses 'ambient' audio session so it never interrupts background music.
let audioCtx = null;
let beepBuffer = null;

// Lazily create the AudioContext
const getAudioCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Configure iOS audio session to mix with other audio if API is available
        if (navigator.audioSession) {
            try {
                navigator.audioSession.type = 'ambient';
            } catch (e) {
                console.warn('Failed to set audio session type:', e);
            }
        }
    }
    return audioCtx;
};

// Robust decodeAudioData wrapper for cross-browser support (specifically Safari iOS)
const decodeAudio = (ctx, arrayBuffer) => {
    return new Promise((resolve, reject) => {
        try {
            const result = ctx.decodeAudioData(
                arrayBuffer,
                (decoded) => resolve(decoded),
                (err) => reject(err)
            );
            if (result && typeof result.then === 'function') {
                result.then(resolve).catch(reject);
            }
        } catch (e) {
            reject(e);
        }
    });
};

// Pre-load the beep buffer so playback is instant
const loadBeepBuffer = async () => {
    try {
        const ctx = getAudioCtx();
        const response = await fetch('/beep.wav');
        const arrayBuffer = await response.arrayBuffer();
        beepBuffer = await decodeAudio(ctx, arrayBuffer);
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

        // Play a dummy silent sound to unlock the AudioContext immediately on iOS Safari
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);

        if (!beepBuffer) {
            loadBeepBuffer();
        }
    } catch (e) {
        console.error('Audio Init Failed:', e);
    }
};

const getWorkoutIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes('chest') || n.includes('bench')) return <Target className="icon-bounce" color="var(--accent-color)" size={24} />;
    if (n.includes('back') || n.includes('row')) return <Activity className="icon-bounce" color="var(--accent-color)" size={24} />;
    if (n.includes('leg') || n.includes('squat')) return <Zap className="icon-bounce" color="var(--accent-color)" size={24} />;
    if (n.includes('arm') || n.includes('bicep') || n.includes('tricep')) return <BicepsFlexed className="icon-bounce" color="var(--accent-color)" size={24} />;
    if (n.includes('shoulder')) return <Shield className="icon-bounce" color="var(--accent-color)" size={24} />;
    return <Sword className="icon-bounce" color="var(--accent-color)" size={24} />;
};

const WorkoutLogger = ({ programDay, history, onFinish, onCancel, profile, exerciseDb, workoutStartTime = null, onMinimize, onPRAchieved }) => {
    const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activePlateCalc, setActivePlateCalc] = useState(null);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalRestTime, setTotalRestTime] = useState(0);
    const [timerEndTime, setTimerEndTime] = useState(null);
    const [timerLocation, setTimerLocation] = useState({ exIdx: null, setIdx: null });
    const restDuration = profile?.restTimer || 90;

    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inspectingExercise, setInspectingExercise] = useState(null);
    const [showAnatomyMap, setShowAnatomyMap] = useState({});
    const [showCreateCustomModal, setShowCreateCustomModal] = useState(false);

    const activeDb = React.useMemo(() => {
        const map = new Map();
        EXERCISE_DATABASE.forEach(e => {
            if (e && e.id) map.set(String(e.id), e);
        });
        (exerciseDb || []).forEach(e => {
            if (e && e.id) {
                const existing = map.get(String(e.id)) || {};
                map.set(String(e.id), { ...existing, ...e });
            }
        });
        return Array.from(map.values()).filter(e => !e.hidden);
    }, [exerciseDb]);

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

    // Preload audio buffer on component mount
    React.useEffect(() => {
        loadBeepBuffer();
    }, []);

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

            // Check if PR broken
            const currentEx = newWorkout.exercises[exerciseIndex];
            const weight = parseFloat(set.weight) || 0;
            const reps = parseInt(set.reps) || 0;

            if (weight > 0 && reps > 0 && onPRAchieved) {
                const est1RM = weight * (1 + reps / 30);
                let prevMaxWeight = 0;

                if (Array.isArray(history)) {
                    history.forEach(log => {
                        if (log.exercises) {
                            log.exercises.forEach(e => {
                                if (e.name === currentEx.name && Array.isArray(e.sets)) {
                                    e.sets.forEach(s => {
                                        if (s.completed && parseFloat(s.weight) > prevMaxWeight) {
                                            prevMaxWeight = parseFloat(s.weight);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                if (weight > prevMaxWeight && prevMaxWeight > 0) {
                    onPRAchieved({
                        exerciseName: currentEx.name,
                        weight,
                        reps,
                        estimated1RM: est1RM,
                        prevMax: prevMaxWeight
                    });
                }
            }
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

    const generateWarmupSets = (exerciseIndex) => {
        const newWorkout = { ...workout };
        const exercise = newWorkout.exercises[exerciseIndex];
        const workingWeight = parseFloat(exercise.sets[0]?.weight) || 20;

        // Calculate weights rounded to nearest 2.5kg
        const w1 = Math.round((workingWeight * 0.5) / 2.5) * 2.5;
        const w2 = Math.round((workingWeight * 0.7) / 2.5) * 2.5;
        const w3 = Math.round((workingWeight * 0.9) / 2.5) * 2.5;

        const baseWeight1 = w1 > 20 ? w1 : 20;
        const baseWeight2 = w2 > 20 ? w2 : 20;
        const baseWeight3 = w3 > 20 ? w3 : 20;

        const warmups = [
            { id: Date.now() - 3, weight: baseWeight1, reps: 10, completed: false, isWarmup: true, prevWeight: baseWeight1 },
            { id: Date.now() - 2, weight: baseWeight2, reps: 5, completed: false, isWarmup: true, prevWeight: baseWeight2 },
            { id: Date.now() - 1, weight: baseWeight3, reps: 2, completed: false, isWarmup: true, prevWeight: baseWeight3 }
        ];

        exercise.sets = [...warmups, ...exercise.sets];
        setWorkout(newWorkout);
        toast.success("Warm-up sets generated!");
    };

    const deleteSet = (exerciseIndex, setIndex) => {
        const newWorkout = { ...workout };
        const exercise = newWorkout.exercises[exerciseIndex];
        if (exercise.sets.length <= 1) return; // Keep at least 1 set
        exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
        setWorkout(newWorkout);
    };

    // Bumps all sets in an exercise by a fixed weight amount
    const bumpAllWeights = (exerciseIndex, amount = 2.5) => {
        const newWorkout = { ...workout };
        newWorkout.exercises[exerciseIndex].sets = newWorkout.exercises[exerciseIndex].sets.map(s => ({
            ...s,
            weight: Math.round((parseFloat(s.weight || 0) + amount) * 100) / 100
        }));
        setWorkout(newWorkout);
    };

    // Bumps all sets in a cardio exercise by minutes
    const bumpAllReps = (exerciseIndex, amount = 5) => {
        const newWorkout = { ...workout };
        newWorkout.exercises[exerciseIndex].sets = newWorkout.exercises[exerciseIndex].sets.map(s => ({
            ...s,
            reps: Math.max(1, (parseInt(s.reps || 0) + amount))
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

    const moveExercise = (dayIdx, exIdx, direction) => {
        // Legacy arrow-based move function removed
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const newExercises = [...workout.exercises];
        const [reorderedItem] = newExercises.splice(result.source.index, 1);
        newExercises.splice(result.destination.index, 0, reorderedItem);
        setWorkout({ ...workout, exercises: newExercises });
    };
    const handleRemoveExercise = (exIdx) => {
        const exName = workout.exercises[exIdx]?.name || 'this exercise';
        const hasCompletedSets = workout.exercises[exIdx]?.sets?.some(s => s.completed);
        if (hasCompletedSets) {
            if (!window.confirm(`You have completed sets for ${exName}. Are you sure you want to remove it from today's workout?`)) {
                return;
            }
        }
        const newExercises = workout.exercises.filter((_, idx) => idx !== exIdx);
        setWorkout({ ...workout, exercises: newExercises });
        toast.success(`Removed ${exName} from today's workout`);
    };

    const handleAddExercise = (exercise) => {
        if (!exercise) return;
        const newEx = {
            id: exercise.id || `custom_${Date.now()}`,
            name: exercise.name || 'Custom Exercise',
            targetMuscleCategory: exercise.targetMuscleCategory || exercise.category || 'Chest',
            primaryMuscleGroup: exercise.primaryMuscleGroup || exercise.muscleGroup || 'Chest',
            primaryRegions: Array.isArray(exercise.primaryRegions) ? exercise.primaryRegions : (exercise.primaryRegion ? [exercise.primaryRegion] : []),
            secondaryMuscleGroups: Array.isArray(exercise.secondaryMuscleGroups) ? exercise.secondaryMuscleGroups : [],
            secondaryRegions: Array.isArray(exercise.secondaryRegions) ? exercise.secondaryRegions : [],
            startWeight: 0,
            sets: [{ id: Date.now(), weight: 0, reps: 0, completed: false, prevWeight: 0 }]
        };
        setWorkout(prev => ({
            ...prev,
            exercises: [...(prev.exercises || []), newEx]
        }));
        setShowExerciseModal(false);
        setSearchQuery('');
        toast.success(`Added ${newEx.name} to today's workout`);
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
            <div className="fade-in" style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom, 0px))' }}>
                {/* STICKY HEADER */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'var(--bg-color)',
                    paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
                    paddingBottom: '0.75rem',
                    paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
                    paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
                    borderBottom: '1px solid var(--border-color)',
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto', marginBottom: '0.75rem' }}>
                        <button className="secondary dp-btn" onClick={() => {
                            const hasCompletedSets = workout.exercises.some(ex => ex.sets.some(s => s.completed));
                            if (hasCompletedSets) {
                                if (window.confirm("You have completed sets. Are you sure you want to cancel this workout? Progress won't be saved.")) {
                                    onCancel();
                                }
                            } else {
                                onCancel();
                            }
                        }} style={{
                            padding: '0.5rem 0.6rem', borderRadius: '12px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', background: 'var(--panel-color)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <ArrowLeft size={18} />
                        </button>

                        <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
                            <h2 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workout.name}</h2>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 800, marginTop: '1px' }}>
                                {formatTime(elapsedTime)}
                            </div>
                        </div>

                        <button className="secondary dp-btn" style={{
                            padding: '0.5rem 0.75rem', borderRadius: '12px', display: 'flex',
                            alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800,
                            background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                        }} onClick={onMinimize}>
                            <ChevronDownSquare size={14} /> HIDE
                        </button>
                    </div>

                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="dp-btn"
                            onClick={() => setShowDatePicker(true)}
                            style={{
                                gap: '10px',
                                padding: '10px 18px', borderRadius: '16px',
                                background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                            }}
                        >
                            <Calendar size={16} color="var(--accent-color)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {isToday(new Date(workoutDate + 'T12:00:00')) ? 'Today' : format(new Date(workoutDate + 'T12:00:00'), 'dd MMM yyyy')}
                            </span>
                            <ChevronDown size={14} color="var(--text-secondary)" />
                        </button>

                        {showDatePicker && (
                            <CustomDatePicker
                                value={workoutDate}
                                maxDate={new Date().toISOString().split('T')[0]}
                                onChange={(val) => setWorkoutDate(val)}
                                onClose={() => setShowDatePicker(false)}
                                align="center"
                            />
                        )}
                    </div>

                </div>

                {/* MOTIVATION MINI-BAR */}
                <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '0.75rem 1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Quote size={14} color="var(--accent-color)" opacity={0.6} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, fontStyle: 'italic', color: 'var(--text-secondary)' }}>{quote}</span>
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
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="workout-exercises">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {workout.exercises.map((ex, exIdx) => (
                                    <Draggable key={`${ex.id}-${exIdx}`} draggableId={`${ex.id}-${exIdx}`} index={exIdx}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="panel"
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    padding: '1.2rem',
                                                    marginBottom: '1.5rem',
                                                    borderRadius: '24px',
                                                    border: snapshot.isDragging ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                                                    background: snapshot.isDragging ? 'var(--bg-color)' : 'var(--panel-color)',
                                                    boxShadow: snapshot.isDragging ? '0 12px 32px rgba(0,0,0,0.2)' : 'none',
                                                    zIndex: snapshot.isDragging ? 1000 : 1
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                        <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: 'var(--text-secondary)', padding: '4px', marginTop: '2px' }}>
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                {getWorkoutIcon(ex.name)}
                                                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-color)', fontWeight: 900, textTransform: 'uppercase' }}>{ex.name}</h3>
                                                                {isCardioExercise(ex) && (
                                                                    <span style={{
                                                                        fontSize: '0.6rem', fontWeight: 900, color: '#ffffff',
                                                                        background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                                                                        padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.5px'
                                                                    }}>
                                                                        CARDIO
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    className="icon-btn"
                                                                    onClick={() => setInspectingExercise(ex)}
                                                                    style={{
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        background: 'rgba(56, 189, 248, 0.15)',
                                                                        border: '1px solid rgba(56, 189, 248, 0.35)',
                                                                        borderRadius: '50%',
                                                                        color: '#38bdf8',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        padding: 0,
                                                                        flexShrink: 0,
                                                                        boxShadow: 'none'
                                                                    }}
                                                                    title="Inspect Target Muscle Anatomy"
                                                                >
                                                                    <Info size={13} />
                                                                </button>
                                                            </div>
                                                            {(() => {
                                                                const norm = normalizeExerciseMuscles(ex);
                                                                const isOpen = showAnatomyMap[exIdx];

                                                                return (
                                                                    <div>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f172a', background: '#38bdf8', padding: '2px 6px', borderRadius: '6px' }}>
                                                                                Primary: {norm.primaryRegions.map(getRegionDisplayName).join(', ')}
                                                                            </span>
                                                                            {norm.secondaryRegions.length > 0 && (
                                                                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 6px', borderRadius: '6px' }}>
                                                                                    Sec: {norm.secondaryRegions.map(getRegionDisplayName).join(', ')}
                                                                                </span>
                                                                            )}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setShowAnatomyMap(prev => ({ ...prev, [exIdx]: !prev[exIdx] }))}
                                                                                style={{
                                                                                    fontSize: '0.65rem', fontWeight: 800,
                                                                                    color: isOpen ? 'white' : 'var(--accent-color)',
                                                                                    background: isOpen ? 'var(--accent-color)' : 'rgba(56, 189, 248, 0.12)',
                                                                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                                                                    padding: '2px 8px', borderRadius: '6px', cursor: 'pointer',
                                                                                    display: 'flex', alignItems: 'center', gap: '4px'
                                                                                }}
                                                                            >
                                                                                📷 Muscle Anatomy Image
                                                                            </button>
                                                                        </div>
                                                                        {isOpen && (
                                                                            <div style={{
                                                                                marginTop: '0.6rem', padding: '0.5rem', background: 'var(--bg-color)',
                                                                                border: '1px solid var(--border-color)', borderRadius: '14px'
                                                                            }}>
                                                                                <AnatomyViewer
                                                                                    primaryRegions={norm.primaryRegions}
                                                                                    secondaryRegions={norm.secondaryRegions}
                                                                                    primaryGroup={norm.primaryGroup}
                                                                                    height={160}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                                                {ex.sets.filter(s => s.completed).length} / {ex.sets.length} DONE
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExercise(exIdx)}
                                                                style={{
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                                                    color: 'var(--error-color)',
                                                                    borderRadius: '8px',
                                                                    padding: '4px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '26px',
                                                                    height: '26px'
                                                                }}
                                                                title="Remove exercise from today's workout"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
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
                                                                fontWeight: 700
                                                            }}
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            {ex.sets.every(s => s.completed) ? 'Deselect' : 'Select All'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Quick-bump row for entire exercise */}
                                                {(() => {
                                                    const isCardio = isCardioExercise(ex);
                                                    return (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7 }}>
                                                                {isCardio ? 'Bump Time:' : 'Bump All:'}
                                                            </span>
                                                            {(isCardio ? [-5, 5, 10, 15] : [-2.5, 2.5, 3, 5, 10]).map(amount => (
                                                                <button
                                                                    key={amount}
                                                                    onClick={() => isCardio ? bumpAllReps(exIdx, amount) : bumpAllWeights(exIdx, amount)}
                                                                    style={{
                                                                        padding: '0.25rem 0.5rem',
                                                                        borderRadius: '8px',
                                                                        background: amount > 0 ? (isCardio ? '#ec4899' : 'var(--accent-color)') : 'var(--muted-color)',
                                                                        border: 'none',
                                                                        color: amount > 0 ? 'white' : 'var(--text-primary)',
                                                                        fontWeight: 800,
                                                                        fontSize: '0.7rem',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    {amount > 0 ? '+' : ''}{amount}{isCardio ? 'm' : 'kg'}
                                                                </button>
                                                            ))}

                                                            {!isCardio && !ex.sets.some(s => s.isWarmup) && (
                                                                <button
                                                                    onClick={() => generateWarmupSets(exIdx)}
                                                                    style={{
                                                                        padding: '0.25rem 0.5rem',
                                                                        borderRadius: '8px',
                                                                        background: 'rgba(234, 179, 8, 0.1)',
                                                                        border: '1px solid #eab308',
                                                                        color: '#eab308',
                                                                        fontWeight: 800,
                                                                        fontSize: '0.7rem',
                                                                        cursor: 'pointer',
                                                                        boxShadow: 'none',
                                                                        textTransform: 'uppercase',
                                                                        marginLeft: 'auto'
                                                                    }}
                                                                >
                                                                    + Warm-up
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {(() => {
                                                    const isCardio = isCardioExercise(ex);
                                                    return (
                                                        <>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 44px 28px', gap: '0.4rem', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                                                                <span>{isCardio ? 'Int' : 'Set'}</span>
                                                                <span style={{ textAlign: 'center', color: isCardio ? '#f59e0b' : 'inherit' }}>{isCardio ? 'SPEED / LVL' : 'KG'}</span>
                                                                <span style={{ textAlign: 'center', color: isCardio ? '#38bdf8' : 'inherit' }}>{isCardio ? 'TIME (MIN)' : 'Reps'}</span>
                                                                <span style={{ textAlign: 'center' }}>Log</span>
                                                                <span></span>
                                                            </div>

                                                            <div>
                                                                {ex.sets.map((set, setIdx) => (
                                                                    <React.Fragment key={set.id}>
                                                                        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 44px 28px', gap: '0.4rem', alignItems: 'center', marginBottom: '1.2rem' }}>
                                                                            <span style={{ color: set.isWarmup ? '#eab308' : 'var(--text-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>
                                                                                {set.isWarmup ? `W` : setIdx + 1 - ex.sets.filter(s => s.isWarmup).length}
                                                                            </span>

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
                                                                                    {set.prevWeight ? (isCardio ? `LAST: Lvl ${set.prevWeight}` : `LAST: ${set.prevWeight}kg`) : ''}
                                                                                </div>
                                                                                {!isCardio && (
                                                                                    <button
                                                                                        onClick={() => setActivePlateCalc({ exIdx, setIdx, weight: set.weight })}
                                                                                        style={{
                                                                                            position: 'absolute',
                                                                                            right: '6px',
                                                                                            bottom: '6px',
                                                                                            background: 'none',
                                                                                            border: 'none',
                                                                                            cursor: 'pointer',
                                                                                            padding: '2px',
                                                                                            color: 'var(--text-secondary)',
                                                                                            opacity: 0.5,
                                                                                            boxShadow: 'none',
                                                                                            width: '18px',
                                                                                            height: '18px',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center'
                                                                                        }}
                                                                                        title="Plate Calculator"
                                                                                    >
                                                                                        <Calculator size={12} />
                                                                                    </button>
                                                                                )}
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
                                                                                        updateSet(exIdx, setIdx, 'reps', val === '' ? '' : parseInt(val));
                                                                                    }}
                                                                                    onBlur={(e) => {
                                                                                        if (e.target.value === '' || isNaN(e.target.value)) updateSet(exIdx, setIdx, 'reps', isCardio ? 20 : 0);
                                                                                    }}
                                                                                    style={{ textAlign: 'center', fontWeight: 800, padding: '0.8rem 0', fontSize: '1.1rem', background: 'var(--muted-color)', width: '100%' }}
                                                                                />
                                                                                <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 800 }}>
                                                                                    {set.prevReps ? (isCardio ? `LAST: ${set.prevReps}m` : `LAST: ${set.prevReps}`) : ''}
                                                                                </div>
                                                                            </div>

                                                                            <button
                                                                                onClick={() => toggleSet(exIdx, setIdx)}
                                                                                style={{
                                                                                    backgroundColor: set.completed ? 'var(--success-color)' : 'transparent',
                                                                                    border: `2px solid ${set.completed ? 'var(--success-color)' : 'var(--border-color)'}`,
                                                                                    padding: '0.4rem',
                                                                                    borderRadius: '50%',
                                                                                    cursor: 'pointer',
                                                                                    width: '32px',
                                                                                    height: '32px',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    color: set.completed ? 'white' : 'transparent',
                                                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                    boxShadow: set.completed ? '0 0 12px rgba(34, 197, 94, 0.4)' : 'none',
                                                                                    transform: set.completed ? 'scale(1.05)' : 'scale(1)'
                                                                                }}
                                                                            >
                                                                                <Check size={18} strokeWidth={3} />
                                                                            </button>

                                                                            <button
                                                                                onClick={() => deleteSet(exIdx, setIdx)}
                                                                                disabled={ex.sets.length <= 1}
                                                                                style={{
                                                                                    background: 'none', border: 'none',
                                                                                    color: 'var(--text-secondary)',
                                                                                    cursor: ex.sets.length <= 1 ? 'not-allowed' : 'pointer',
                                                                                    opacity: ex.sets.length <= 1 ? 0.2 : 0.6,
                                                                                    padding: '4px',
                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                                }}
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </>
                                                    );
                                                })()}

                                                <button
                                                    onClick={() => addSet(exIdx)}
                                                    className="secondary"
                                                    style={{ width: '100%', borderStyle: 'dashed', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0.8rem', fontWeight: 700, fontSize: '0.85rem' }}
                                                >
                                                    <Plus size={16} /> Add Set
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

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

                <div style={{ position: 'fixed', bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))', left: '1rem', right: '1rem', maxWidth: '800px', margin: '0 auto', zIndex: 1001 }}>
                    <button
                        disabled={isSaving}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            fontSize: '1.1rem',
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            border: 'none',
                            cursor: 'pointer'
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
                        <div style={{
                            paddingTop: 'calc(0.85rem + env(safe-area-inset-top, 0px))',
                            paddingBottom: '0.85rem',
                            paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
                            paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            background: 'var(--bg-color)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10
                        }}>
                            <button
                                type="button"
                                onClick={() => setShowExerciseModal(false)}
                                style={{
                                    background: 'var(--muted-color)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '40px',
                                    minHeight: '40px'
                                }}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                            <input
                                type="text"
                                placeholder="Find an exercise..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                style={{
                                    flex: 1,
                                    padding: '0.8rem 1rem',
                                    borderRadius: '12px',
                                    background: 'var(--panel-color)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '16px'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCreateCustomModal(true)}
                                style={{
                                    padding: '9px 14px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    background: 'var(--accent-color)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    whiteSpace: 'nowrap',
                                    minHeight: '40px',
                                    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)'
                                }}
                            >
                                <Plus size={16} /> CUSTOM
                            </button>
                        </div>
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            padding: '1rem calc(1rem + env(safe-area-inset-right, 0px)) calc(3rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))'
                        }}>
                            {activeDb.filter(ex => {
                                const norm = normalizeExerciseMuscles(ex);
                                const q = (searchQuery || '').toLowerCase().trim();
                                if (!q) return true;
                                const nameMatch = (ex.name || '').toLowerCase().includes(q);
                                const equipMatch = (ex.equipment || '').toLowerCase().includes(q);
                                const typeMatch = (ex.type || '').toLowerCase().includes(q);
                                const groupMatch = (norm.primaryGroup || '').toLowerCase().includes(q);
                                const primaryRegionMatch = (norm.primaryRegions || []).some(r => r.toLowerCase().includes(q));
                                const secondaryRegionMatch = (norm.secondaryRegions || []).some(r => r.toLowerCase().includes(q));
                                const isCardio = isCardioExercise(ex);
                                const cardioSearchMatch = (q.includes('cardio') || q.includes('endurance') || q.includes('aerobic') || q.includes('tread') || q.includes('run') || q.includes('cycle') || q.includes('bike') || q.includes('stair') || q.includes('row')) && isCardio;

                                return nameMatch || equipMatch || typeMatch || groupMatch || primaryRegionMatch || secondaryRegionMatch || cardioSearchMatch;
                            }).map(ex => {
                                const norm = normalizeExerciseMuscles(ex);
                                return (
                                    <div
                                        key={ex.id}
                                        onClick={() => handleAddExercise(ex)}
                                        style={{
                                            padding: '1rem', background: 'var(--panel-color)',
                                            border: '1px solid var(--border-color)', borderRadius: '14px',
                                            marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', cursor: 'pointer'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{ex.name}</div>
                                                {isCardioExercise(ex) && (
                                                    <span style={{
                                                        fontSize: '0.6rem', fontWeight: 900, color: '#ffffff',
                                                        background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                                                        padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.5px'
                                                    }}>
                                                        CARDIO
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f172a', background: '#38bdf8', padding: '2px 6px', borderRadius: '6px' }}>
                                                    Primary: {norm.primaryRegions.map(getRegionDisplayName).join(', ')}
                                                </span>
                                                {norm.secondaryRegions.length > 0 && (
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '6px' }}>
                                                        Sec: {norm.secondaryRegions.map(getRegionDisplayName).join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Plus size={20} color="var(--accent-color)" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            }
            {activePlateCalc && (
                <PlateCalculatorModal
                    initialWeight={activePlateCalc.weight}
                    onSave={(newWeight) => {
                        updateSet(activePlateCalc.exIdx, activePlateCalc.setIdx, 'weight', newWeight);
                        setActivePlateCalc(null);
                    }}
                    onClose={() => setActivePlateCalc(null)}
                />
            )}
            {inspectingExercise && (
                <ExerciseDetailModal
                    exercise={inspectingExercise}
                    onClose={() => setInspectingExercise(null)}
                />
            )}
            {showCreateCustomModal && (
                <CreateExerciseModal
                    onSave={(newEx) => {
                        handleAddExercise(newEx);
                        setShowCreateCustomModal(false);
                        setShowExerciseModal(false);
                    }}
                    onClose={() => setShowCreateCustomModal(false)}
                />
            )}
        </>
    );
};

export default WorkoutLogger;
