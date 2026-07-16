import React, { useState, useMemo } from 'react';
import { calculate1RM } from '../utils/analytics';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { Trophy, TrendingUp, Calendar, Dumbbell, Star, Percent } from 'lucide-react';

const ExerciseAnalytics = ({ history, theme }) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#1e293b' : '#e2e8f0';

    // 1. Extract all unique exercise names logged in history
    const exerciseNames = useMemo(() => {
        if (!Array.isArray(history)) return [];
        const names = new Set();
        history.forEach(session => {
            if (session && Array.isArray(session.exercises)) {
                session.exercises.forEach(ex => {
                    if (ex && ex.name) {
                        names.add(ex.name);
                    }
                });
            }
        });
        return Array.from(names).sort();
    }, [history]);

    const [selectedExercise, setSelectedExercise] = useState(() => {
        return exerciseNames.length > 0 ? exerciseNames[0] : '';
    });

    const [metric, setMetric] = useState('oneRM'); // 'oneRM' or 'maxWeight'

    // Set initial selected exercise once the list is available
    React.useEffect(() => {
        if (exerciseNames.length > 0 && !selectedExercise) {
            setSelectedExercise(exerciseNames[0]);
        }
    }, [exerciseNames, selectedExercise]);

    // 2. Fetch history logs for the selected exercise
    const exerciseLogs = useMemo(() => {
        if (!selectedExercise || !Array.isArray(history)) return [];

        const logs = [];
        history.forEach(session => {
            if (!session || !session.date) return;
            const ex = session.exercises?.find(
                e => e && e.name?.toLowerCase() === selectedExercise.toLowerCase()
            );
            if (ex && Array.isArray(ex.sets)) {
                // Filter only completed sets (or assume all completed if no completed field exists)
                const completedSets = ex.sets.filter(s => s && (s.completed !== false));
                if (completedSets.length > 0) {
                    logs.push({
                        date: new Date(session.date),
                        rawDate: session.date,
                        sets: completedSets,
                        workoutName: session.name
                    });
                }
            }
        });

        // Sort chronologically for chart drawing
        return logs.sort((a, b) => a.date - b.date);
    }, [history, selectedExercise]);

    // 3. Calculate statistics: PR, Max 1RM, Total Sets
    const stats = useMemo(() => {
        if (exerciseLogs.length === 0) return null;

        let allTimePRWeight = 0;
        let allTimePRReps = 0;
        let allTimePRDate = null;

        let allTimeMax1RM = 0;
        let allTimeMax1RMDate = null;

        let totalSets = 0;

        exerciseLogs.forEach(log => {
            log.sets.forEach(set => {
                const weight = parseFloat(set.weight) || 0;
                const reps = parseInt(set.reps) || 0;
                totalSets++;

                // Max Weight Lifted PR
                if (weight > allTimePRWeight || (weight === allTimePRWeight && reps > allTimePRReps)) {
                    allTimePRWeight = weight;
                    allTimePRReps = reps;
                    allTimePRDate = log.date;
                }

                // Max 1RM PR
                const oneRM = calculate1RM(weight, reps);
                if (oneRM > allTimeMax1RM) {
                    allTimeMax1RM = oneRM;
                    allTimeMax1RMDate = log.date;
                }
            });
        });

        return {
            prWeight: allTimePRWeight,
            prReps: allTimePRReps,
            prDate: allTimePRDate,
            max1RM: Math.round(allTimeMax1RM * 10) / 10,
            max1RMDate: allTimeMax1RMDate,
            totalSets,
            avgSetsPerWorkout: (totalSets / exerciseLogs.length).toFixed(1)
        };
    }, [exerciseLogs]);

    // 4. Generate Chart.js Data
    const chartData = useMemo(() => {
        if (exerciseLogs.length === 0) return { labels: [], datasets: [] };

        const labels = exerciseLogs.map(log => {
            try {
                return format(log.date, 'dd MMM');
            } catch (e) {
                return '';
            }
        });

        const dataPoints = exerciseLogs.map(log => {
            if (metric === 'oneRM') {
                // Return maximum calculated 1RM for this workout session
                const oneRMs = log.sets.map(s => calculate1RM(parseFloat(s.weight) || 0, parseInt(s.reps) || 0));
                return Math.max(...oneRMs, 0);
            } else {
                // Return maximum absolute weight lifted in this session
                const weights = log.sets.map(s => parseFloat(s.weight) || 0);
                return Math.max(...weights, 0);
            }
        });

        return {
            labels,
            datasets: [{
                label: metric === 'oneRM' ? 'Est. 1RM (kg)' : 'Max Weight (kg)',
                data: dataPoints,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: '#38bdf8'
            }]
        };
    }, [exerciseLogs, metric]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: isDark ? '#f8fafc' : '#0f172a',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                grid: { color: gridColor, drawBorder: false },
                ticks: { color: textColor, font: { size: 9, weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: textColor, font: { size: 9, weight: 'bold' } }
            }
        }
    };

    if (exerciseNames.length === 0) {
        return (
            <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <Dumbbell size={36} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '0.8rem' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>No Exercise History Found</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Log a few workouts to generate detailed progression analytics.</div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Exercise Selector */}
            <div className="panel" style={{ padding: '1.2rem', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>
                    Select Exercise
                </label>
                <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    style={{
                        width: '100%',
                        fontSize: '1rem',
                        fontWeight: 800,
                        padding: '0.8rem 1rem',
                        borderRadius: '16px',
                        background: 'var(--muted-color)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)'
                    }}
                >
                    {exerciseNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            {/* Quick Cards Grid */}
            {stats && (
                <div className="stats-grid" style={{ marginBottom: '1rem', gap: '0.75rem' }}>
                    <div className="stat-box" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '110px' }}>
                        <Trophy size={18} color="var(--accent-color)" style={{ marginBottom: '4px' }} />
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ALL-TIME PR</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0' }}>
                            {stats.prWeight} <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KG</small>
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            for {stats.prReps} rep{stats.prReps !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="stat-box" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '110px' }}>
                        <Star size={18} color="#eab308" style={{ marginBottom: '4px' }} />
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>EST. MAX 1RM</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0' }}>
                            {stats.max1RM} <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>KG</small>
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {stats.max1RMDate ? format(stats.max1RMDate, 'dd MMM yyyy') : 'N/A'}
                        </div>
                    </div>

                    <div className="stat-box" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '110px' }}>
                        <TrendingUp size={18} color="var(--success-color)" style={{ marginBottom: '4px' }} />
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>LOGGED SESSIONS</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: '2px 0' }}>
                            {exerciseLogs.length} <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>times</small>
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {stats.totalSets} total sets
                        </div>
                    </div>
                </div>
            )}

            {/* Progression Chart Card */}
            {exerciseLogs.length > 0 && (
                <div className="panel" style={{ marginBottom: '1.5rem', padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={16} color="var(--accent-color)" />
                            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progress Graph</h3>
                        </div>

                        {/* Metric Toggle */}
                        <div style={{ display: 'flex', background: 'var(--muted-color)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => setMetric('oneRM')}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: metric === 'oneRM' ? 'var(--panel-color)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    border: 'none',
                                    boxShadow: 'none',
                                    textTransform: 'uppercase'
                                }}
                            >
                                1RM
                            </button>
                            <button
                                onClick={() => setMetric('maxWeight')}
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    background: metric === 'maxWeight' ? 'var(--panel-color)' : 'transparent',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    border: 'none',
                                    boxShadow: 'none',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Max Wt
                            </button>
                        </div>
                    </div>

                    <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                        {exerciseLogs.length < 2 ? (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                Need at least 2 logs to draw trend chart.
                            </div>
                        ) : (
                            <Line data={chartData} options={chartOptions} />
                        )}
                    </div>
                </div>
            )}

            {/* Exercise Log History List */}
            <div className="panel" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Calendar size={16} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Log History</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[...exerciseLogs].reverse().map((log, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: 'var(--muted-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {log.workoutName || 'Logged Workout'}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                                    {format(log.date, 'EEEE, dd MMM yyyy')}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', maxWidth: '60%' }}>
                                {log.sets.map((set, sIdx) => (
                                    <span
                                        key={sIdx}
                                        style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            background: 'var(--panel-color)',
                                            border: '1px solid var(--border-color)',
                                            padding: '2px 6px',
                                            borderRadius: '6px',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        {set.weight}kg × {set.reps}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExerciseAnalytics;
