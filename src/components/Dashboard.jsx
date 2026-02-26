import React from 'react';
import { TARGETS } from '../data/program';
import { calculate1RM, getStrengthLevel } from '../utils/analytics';
import { Dumbbell, Plus, ChevronDown, Trash2, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = ({ history, profile, onStartWorkout, activeTemplate, templates, onSelectTemplate, onCreateTemplate, onEditTemplate, onDeleteTemplate }) => {
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
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>GymLog</h1>

            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                {big3.map(ex => {
                    const current1RM = getLatest1RM(ex.id);
                    const target = TARGETS[ex.id]?.target || 0;
                    const progress = Math.min(100, Math.round((current1RM / target) * 100)) || 0;
                    const level = getStrengthLevel(ex.id, profile.bodyweight, current1RM);

                    return (
                        <div key={ex.id} className="panel" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{ex.name} 1RM</div>
                                {current1RM > 0 && (
                                    <div style={{ background: 'var(--muted-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: 800, border: '1px solid var(--border-color)' }}>
                                        {level}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{current1RM} <small style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kg</small></div>
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Target: {target}kg</span>
                                    <span>{progress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '3px', transition: 'width 1s ease-out' }}></div>
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
                    <button
                        key={day.day || idx}
                        className="secondary"
                        style={{ textAlign: 'left', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={() => onStartWorkout(idx)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 900, color: 'white', flexShrink: 0
                            }}>
                                {day.day || idx + 1}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{day.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                        <Dumbbell size={20} color="var(--text-secondary)" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
