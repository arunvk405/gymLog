import React, { useState, useEffect, useMemo } from 'react';
import { TARGETS } from '../data/program';
import { calculate1RM, getStrengthLevel } from '../utils/analytics';
import { Dumbbell, Plus, ChevronDown, Trash2, Pencil, Flame, Trophy, Zap, TrendingUp, Quote, Activity, Award, ShieldCheck, HeartPulse, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MOTIVATIONAL_QUOTES } from '../data/motivation';
import { normalizeExerciseMuscles } from '../data/muscles';

const Dashboard = ({ history, profile, onStartWorkout, activeTemplate, templates, onSelectTemplate, onCreateTemplate, onEditTemplate, onDeleteTemplate }) => {
    const [quote, setQuote] = useState('');

    useEffect(() => {
        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        setQuote(randomQuote);
    }, []);

    const totalTonnage = useMemo(() => {
        let sum = 0;
        (history || []).forEach(session => {
            (session.exercises || []).forEach(ex => {
                (ex.sets || []).forEach(set => {
                    if (set.completed) {
                        sum += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
                    }
                });
            });
        });
        return Math.round(sum);
    }, [history]);

    const muscleRecovery = useMemo(() => {
        const now = Date.now();
        const muscleLastTrained = {};

        (history || []).forEach(session => {
            const sessionTime = new Date(session.date || session.id).getTime();
            if (isNaN(sessionTime)) return;

            (session.exercises || []).forEach(ex => {
                const norm = normalizeExerciseMuscles(ex);
                const group = norm.primaryGroup;
                if (!muscleLastTrained[group] || sessionTime > muscleLastTrained[group]) {
                    muscleLastTrained[group] = sessionTime;
                }
            });
        });

        const groups = ['Chest', 'Back', 'Shoulders', 'Quadriceps', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Abdominals'];
        return groups.map(group => {
            const lastTime = muscleLastTrained[group];
            if (!lastTime) {
                return { group, status: 'fresh', label: 'Fresh & Ready', hours: 999, color: '#34d399' };
            }
            const hoursAgo = (now - lastTime) / (1000 * 60 * 60);
            if (hoursAgo < 24) {
                return { group, status: 'fatigued', label: 'Trained <24h ago', hours: Math.round(hoursAgo), color: '#ef4444' };
            } else if (hoursAgo < 48) {
                return { group, status: 'recovering', label: 'Recovering (24–48h)', hours: Math.round(hoursAgo), color: '#f59e0b' };
            } else {
                return { group, status: 'fresh', label: 'Fresh & Ready', hours: Math.round(hoursAgo), color: '#34d399' };
            }
        });
    }, [history]);


    const getLatest1RM = (exerciseId) => {
        const sessions = history.filter(s => s.exercises && s.exercises.some(e => e.id === exerciseId || (exerciseId === 'squat' && e.id === 'squat_d5') || (exerciseId === 'bench_press' && e.id === 'bench_press_d5') || (exerciseId === 'deadlift' && e.id === 'deadlift_d5')));
        if (sessions.length === 0) return 0;

        let max = 0;
        sessions.forEach(s => {
            const ex = s.exercises.find(e => e.id === exerciseId || e.syncWith === exerciseId);
            if (ex && ex.sets) {
                ex.sets.forEach(set => {
                    const rm = calculate1RM(set.weight, set.reps);
                    if (rm > max) max = rm;
                });
            }
        });
        return Math.round(max * 10) / 10;
    };

    const big3 = [
        { id: 'bench_press', name: 'Bench Press' },
        { id: 'squat', name: 'Squat' },
        { id: 'deadlift', name: 'Deadlift' }
    ];

    const programDays = activeTemplate?.days || [];

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', margin: 0 }} className="text-gradient">BulkBro</h1>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Flame size={16} color="var(--error-color)" className="icon-pulse" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{history.length} SESSIONS</span>
                    </div>
                </div>
            </div>

            {/* MOTIVATION CARD */}
            <div className="motivation-card fade-in">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', opacity: 0.9 }}>
                        <Quote size={14} fill="white" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Fuel</span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3 }}>"{quote}"</div>
                </div>
            </div>

            {/* LIFETIME TONNAGE & RECOVERY OVERVIEW */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="panel" style={{ marginBottom: 0, background: 'var(--panel-color)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} color="var(--accent-color)" /> LIFETIME TONNAGE LIFTED
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        {totalTonnage > 1000 ? `${(totalTonnage / 1000).toFixed(1)}k` : totalTonnage} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>KG</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-color)', marginTop: '4px' }}>
                        🏋️‍♂️ {totalTonnage > 100000 ? 'Iron Titan Badge Unlocked' : 'Keep Lifting to Unlock Badges'}
                    </div>
                </div>

                <div className="panel" style={{ marginBottom: 0, background: 'var(--panel-color)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HeartPulse size={14} color="#34d399" /> MUSCLE RECOVERY STATUS
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399' }}>
                        {muscleRecovery.filter(m => m.status === 'fresh').length} / {muscleRecovery.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fresh Groups</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Ready for optimal hypertrophy stimulus
                    </div>
                </div>
            </div>

            {/* MUSCLE RECOVERY HEATMAP MINI GRID */}
            <div className="panel" style={{ marginBottom: '1.5rem', background: 'var(--panel-color)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--accent-color)" /> MUSCLE RECOVERY HEATMAP
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                    {muscleRecovery.map(m => (
                        <div
                            key={m.group}
                            style={{
                                background: `${m.color}15`,
                                border: `1px solid ${m.color}40`,
                                borderRadius: '12px',
                                padding: '8px',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.group}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: m.color, marginTop: '2px' }}>{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BIG 3 PROGRESS CARDS */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                {big3.map((ex, idx) => {
                    const current1RM = getLatest1RM(ex.id);
                    const target = TARGETS[ex.id]?.target || 0;
                    const progress = Math.min(100, Math.round((current1RM / target) * 100)) || 0;
                    const level = getStrengthLevel(ex.id, profile?.bodyweight || 0, current1RM);

                    const Icon = idx === 0 ? Trophy : (idx === 1 ? Zap : TrendingUp);

                    return (
                        <div key={ex.id} className="panel" style={{ marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{ex.name}</div>
                                <Icon size={16} color="var(--accent-color)" className="icon-bounce" />
                            </div>

                            <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.2rem' }}>
                                {current1RM} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>KG</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: level?.color || 'var(--text-secondary)', background: level?.color ? `${level.color}15` : 'var(--muted-color)', padding: '2px 8px', borderRadius: '10px' }}>
                                    {(level?.label || 'N/A').toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    Target: {target}kg
                                </span>
                            </div>

                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACTIVE TEMPLATE SELECTOR */}
            <div className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Training Program</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => onEditTemplate(activeTemplate)}
                            style={{
                                padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800,
                                background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Pencil size={14} /> EDIT PROGRAM
                        </button>

                        {/* Template Dropdown Selector */}
                        {templates.length > 1 && (
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={activeTemplate?.id || 'default'}
                                    onChange={(e) => onSelectTemplate(e.target.value)}
                                    style={{
                                        appearance: 'none', background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)', padding: '6px 28px 6px 12px', borderRadius: '10px',
                                        fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                                    }}
                                >
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ background: 'var(--muted-color)', padding: '1rem', borderRadius: '16px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{activeTemplate?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{activeTemplate?.description}</div>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'var(--accent-color)', color: 'white', padding: '4px 8px', borderRadius: '8px' }}>
                            {programDays.length} DAYS / WK
                        </span>
                    </div>

                    {/* Edit / Delete Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => onEditTemplate(activeTemplate)}
                            style={{
                                padding: '0.4rem 0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '0.75rem', fontWeight: 800, background: 'var(--panel-color)',
                                border: '1px solid var(--accent-color)', color: 'var(--accent-color)', cursor: 'pointer'
                            }}
                        >
                            <Pencil size={13} /> Customize Exercises & Split Days
                        </button>

                        {activeTemplate?.isCustom && (
                            <button
                                type="button"
                                onClick={() => {
                                    toast((t) => (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Delete template "{activeTemplate.name}"?</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        onDeleteTemplate(activeTemplate.id);
                                                        toast.dismiss(t.id);
                                                    }}
                                                    style={{
                                                        background: 'var(--error-color)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => toast.dismiss(t.id)}
                                                    style={{
                                                        background: 'var(--muted-color)',
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-primary)',
                                                        padding: '6px 14px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ), { duration: 5000, position: 'top-center' });
                                }}
                                style={{
                                    padding: '0.4rem 0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px',
                                    fontSize: '0.75rem', fontWeight: 700, color: 'var(--error-color)', border: '1px solid var(--error-color)',
                                    background: 'transparent', cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={13} /> Delete
                            </button>
                        )}
                    </div>
                </div>

                {/* Create Template Button */}
                <button
                    className="secondary"
                    onClick={onCreateTemplate}
                    style={{
                        width: '100%', padding: '0.8rem', borderRadius: '14px', borderStyle: 'dashed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem'
                    }}
                >
                    <Plus size={16} /> Create Your Own Template
                </button>
            </div>

            {/* SESSION LIST */}
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>Start New Session</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: 0 }}>
                Choose a day from your <b style={{ color: 'var(--accent-color)' }}>{activeTemplate?.name}</b> split
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', paddingBottom: '2rem' }}>
                {programDays.map((day, idx) => (
                    <div
                        key={day.day || idx}
                        className="panel"
                        style={{
                            textAlign: 'left', padding: '1rem', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px',
                            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid var(--border-color)',
                            marginBottom: 0
                        }}
                        onClick={() => onStartWorkout(idx)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                            <div className="glass-panel" style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(56, 189, 248, 0.1)', flexShrink: 0
                            }}>
                                <Dumbbell size={20} color="var(--accent-color)" className="icon-pulse" />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{day.name}</div>
                                {(() => {
                                    const regions = Array.from(new Set(
                                        (day.exercises || []).flatMap(ex => normalizeExerciseMuscles(ex).primaryRegions)
                                    )).slice(0, 3);

                                    return (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                                            {regions.map(r => (
                                                <span key={r} style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-color)', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                                                    {r}
                                                </span>
                                            ))}
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                                                {day.exercises?.length || 0} exercises
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="glass-panel" style={{
                            padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem',
                            fontWeight: 800, background: 'var(--accent-color)', color: 'white',
                            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                        }}>
                            START
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
