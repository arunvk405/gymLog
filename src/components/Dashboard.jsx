import React, { useState, useEffect } from 'react';
import { TARGETS } from '../data/program';
import { calculate1RM, getStrengthLevel } from '../utils/analytics';
import { Dumbbell, Plus, ChevronDown, Trash2, Pencil, Flame, Trophy, Zap, TrendingUp, Quote, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MOTIVATIONAL_QUOTES } from '../data/motivation';

const Dashboard = ({ history, profile, onStartWorkout, activeTemplate, templates, onSelectTemplate, onCreateTemplate, onEditTemplate, onDeleteTemplate }) => {
    const [quote, setQuote] = useState('');

    useEffect(() => {
        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        setQuote(randomQuote);
    }, []);

    if (!profile) return <div className="fade-in">Loading profile...</div>;

    const getLatest1RM = (exerciseId) => {
        const sessions = history.filter(s => s.exercises.some(e => e.id === exerciseId || (exerciseId === 'squat' && e.id === 'squat_d5') || (exerciseId === 'bench_press' && e.id === 'bench_press_d5') || (exerciseId === 'deadlift' && e.id === 'deadlift_d5')));
        if (sessions.length === 0) return 0;

        let max = 0;
        sessions.forEach(s => {
            const ex = s.exercises.find(e => e.id === exerciseId || e.syncWith === exerciseId);
            if (ex) {
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
                <h1 style={{ fontSize: '2.2rem', margin: 0 }} className="text-gradient">BulkBro</h1>
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

            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                {big3.map((ex, idx) => {
                    const current1RM = getLatest1RM(ex.id);
                    const target = TARGETS[ex.id]?.target || 0;
                    const progress = Math.min(100, Math.round((current1RM / target) * 100)) || 0;
                    const level = getStrengthLevel(ex.id, profile.bodyweight, current1RM);

                    const Icon = idx === 0 ? Trophy : (idx === 1 ? Zap : TrendingUp);

                    return (
                        <div key={ex.id} className="panel" style={{ marginBottom: 0, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{ex.name}</div>
                                <Icon size={16} color="var(--accent-color)" className="icon-bounce" />
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, position: 'relative', zIndex: 1 }}>
                                {current1RM} <small style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>KG</small>
                            </div>
                            
                            <div style={{ marginTop: '1rem', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>LVL: <span style={{ color: 'var(--accent-color)' }}>{level}</span></span>
                                    <span>{progress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div className="progress-bar-fill" style={{ width: '100%', transform: `scaleX(${progress / 100})`, height: '100%', borderRadius: '3px' }}></div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MY PROGRAM SECTION */}
            <div style={{ marginTop: '2.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, marginBottom: '1rem' }}>My Program</h2>

                {/* Active Template Card */}
                <div className="panel" style={{ marginBottom: '1rem', padding: '1rem 1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Template</span>
                        {activeTemplate?.isDefault && (
                            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--accent-color)', color: 'white', fontWeight: 700 }}>DEFAULT</span>
                        )}
                    </div>

                    {templates.length > 1 ? (
                        <div style={{ position: 'relative' }}>
                            <select
                                value={activeTemplate?.id || 'default'}
                                onChange={(e) => onSelectTemplate(e.target.value)}
                                style={{ width: '100%', fontSize: '0.9rem', fontWeight: 700, paddingRight: '2.5rem', appearance: 'none' }}
                            >
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}{t.isDefault ? ' (Default)' : ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
                        </div>
                    ) : (
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeTemplate?.name}</div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        {programDays.length} training day{programDays.length !== 1 ? 's' : ''} per week
                    </div>

                    {/* Edit / Delete custom template */}
                    {activeTemplate && !activeTemplate.isDefault && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '0.6rem' }}>
                            <button
                                className="secondary"
                                onClick={() => onEditTemplate(activeTemplate)}
                                style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}
                            >
                                <Pencil size={12} /> Edit
                            </button>
                            <button
                                className="secondary"
                                onClick={() => {
                                    toast((t) => (
                                        <div style={{ padding: '4px' }}>
                                            <div style={{ marginBottom: '12px', fontWeight: 800, fontSize: '0.9rem' }}>
                                                Delete "{activeTemplate.name}"?
                                            </div>
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
                                                    Yes, Delete
                                                </button>
                                                <button
                                                    onClick={() => toast.dismiss(t.id)}
                                                    style={{
                                                        background: 'var(--panel-color)',
                                                        color: 'var(--text-secondary)',
                                                        border: '1px solid var(--border-color)',
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
                                style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                            >
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>
                    )}
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
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Activity size={12} /> {day.exercises.length} Exercises
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    let t = JSON.parse(JSON.stringify(activeTemplate));
                                    if (t.isDefault) {
                                        t.id = '';
                                        t.name = t.name + ' (Copy)';
                                        t.isDefault = false;
                                    }
                                    t._expandDay = idx;
                                    onEditTemplate(t);
                                }}
                                style={{
                                    background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                                    cursor: 'pointer', padding: '10px', color: 'var(--text-secondary)',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartWorkout(idx);
                                }}
                                style={{
                                    background: 'var(--accent-gradient)', border: 'none',
                                    cursor: 'pointer', padding: '10px 16px', color: 'white',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                                    fontSize: '0.8rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                                }}
                            >
                                GO <Zap size={14} fill="white" />
                            </button>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default Dashboard;
