import React from 'react';
import { DEFAULT_PROGRAM, TARGETS } from '../data/program';
import { calculate1RM, getStrengthLevel } from '../utils/analytics';
import { Dumbbell } from 'lucide-react';

const Dashboard = ({ history, profile, onStartWorkout }) => {
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

            <h2 style={{ fontSize: '1.2rem', marginTop: '2.5rem', marginBottom: '1rem' }}>Start New Session</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {DEFAULT_PROGRAM.map((day, idx) => (
                    <button
                        key={day.day}
                        className="secondary"
                        style={{ textAlign: 'left', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={() => onStartWorkout(idx)}
                    >
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 700 }}>DAY {day.day}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{day.name}</div>
                        </div>
                        <Dumbbell size={20} />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
