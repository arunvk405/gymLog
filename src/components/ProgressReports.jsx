import React, { useMemo } from 'react';
import { calculate1RM, calculateVolume } from '../utils/analytics';
import { Line, Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Activity, Scale, Zap, Info, Flame, Target, Utensils, Award } from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const ProgressReports = ({ history, profile }) => {
    const sortedHistory = useMemo(() => [...history].sort((a, b) => new Date(a.date) - new Date(b.date)), [history]);

    // TRAINING INSIGHTS LOGIC
    const trainingInsights = useMemo(() => {
        if (!profile) return null;

        const last30Days = history.filter(s => {
            const date = new Date(s.date);
            const today = new Date();
            return (today - date) / (1000 * 60 * 60 * 24) <= 30;
        });

        // Volume by Muscle Group
        const muscleVolumes = {};
        last30Days.forEach(s => {
            s.exercises.forEach(ex => {
                const vol = calculateVolume(ex.sets);
                muscleVolumes[ex.muscleGroup] = (muscleVolumes[ex.muscleGroup] || 0) + vol;
            });
        });

        // Nutritional Math
        let bmr = profile.gender === 'male'
            ? 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age - 161;

        const tdee = Math.round(bmr * 1.5);
        const bulkTarget = tdee + 300;

        const sortedMuscles = Object.entries(muscleVolumes).sort((a, b) => a[1] - b[1]); // Sort lowest to highest
        const focusArea = sortedMuscles.length > 0 ? sortedMuscles[0][0] : 'No data yet';

        return {
            tdee,
            bulkTarget,
            protein: Math.round(profile.bodyweight * 2),
            focusArea,
            intensity: last30Days.length >= 12 ? 'High' : (last30Days.length >= 8 ? 'Moderate' : 'Developing'),
            status: profile.goal === 'fat_loss' ? 'Shredding' : 'Building'
        };
    }, [history, profile]);

    const getExerciseData = (exId) => {
        const data = sortedHistory
            .map(s => {
                const ex = s.exercises.find(e => e.id === exId || e.syncWith === exId);
                if (!ex) return null;
                const maxRM = ex.sets.length > 0 ? Math.max(...ex.sets.map(set => calculate1RM(set.weight, set.reps))) : 0;
                return { date: format(new Date(s.date), 'MMM dd'), val: maxRM };
            })
            .filter(d => d !== null && d.val > 0);

        return {
            labels: data.map(d => d.date),
            datasets: [{
                label: '1RM (kg)',
                data: data.map(d => d.val),
                borderColor: 'var(--accent-color)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'var(--accent-color)',
                pointBorderColor: '#fff',
                pointHoverRadius: 6
            }]
        };
    };

    const calendarData = useMemo(() => {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        const days = eachDayOfInterval({ start, end });
        const workoutDays = history.map(s => new Date(s.date));
        return days.map(d => ({ date: d, day: format(d, 'd'), isToday: isSameDay(d, new Date()), active: workoutDays.some(wd => isSameDay(wd, d)) }));
    }, [history]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#1e293b',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                padding: 12,
                displayColors: false,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                grid: { color: 'var(--border-color)', drawBorder: false },
                ticks: { color: 'var(--text-secondary)', font: { size: 10, weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-secondary)', font: { size: 10, weight: 'bold' } }
            }
        }
    };

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Training Insights</h2>

            {/* STATUS CARDS */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Target size={16} color="var(--accent-color)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>FOCUS AREA</span>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase' }}>{trainingInsights?.focusArea}</div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, margin: '4px 0 0' }}>NEEDS MORE VOLUME</p>
                </div>
                <div className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Flame size={16} color="#ef4444" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>DAILY CALORIES</span>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{trainingInsights?.bulkTarget || 0}</div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, margin: '4px 0 0' }}>KCAL / DAY</p>
                </div>
            </div>

            {/* NUTRITIONAL STRATEGY */}
            <div className="panel" style={{ background: 'var(--panel-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Utensils size={18} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Nutritional Protocol</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>PROTEIN</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{trainingInsights?.protein}g</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CARBS</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>~{(trainingInsights?.bulkTarget * 0.5 / 4).toFixed(0)}g</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>FATS</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>~{(trainingInsights?.bulkTarget * 0.25 / 9).toFixed(0)}g</div>
                    </div>
                </div>
            </div>

            {/* SUMMARY INFO */}
            <div className="panel" style={{ background: 'var(--muted-color)', border: 'none' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    You are currently in a <b>{trainingInsights?.status}</b> phase with <b>{trainingInsights?.intensity}</b> intensity.
                    Based on your logs, increasing weekly sets for <b>{trainingInsights?.focusArea}</b> is recommended for balanced growth.
                </p>
            </div>

            {/* ACTIVITY CALENDAR */}
            <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                    <Activity size={20} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>{format(new Date(), 'MMMM')} Training Consistency</h3>
                </div>
                <div className="calendar-grid">
                    {calendarData.map((d, i) => (
                        <div
                            key={i}
                            className="calendar-day"
                            style={{
                                background: d.active ? 'var(--accent-color)' : 'var(--muted-color)',
                                color: d.active ? 'white' : (d.isToday ? 'var(--accent-color)' : 'var(--text-secondary)'),
                                border: d.isToday ? '2px solid var(--accent-color)' : 'none'
                            }}
                        >
                            {d.day}
                        </div>
                    ))}
                </div>
            </div>

            {/* CHARTS */}
            <div className="panel" style={{ height: '300px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Bench Press (1RM)</h3>
                <div style={{ height: '220px' }}>
                    <Line data={getExerciseData('bench_press')} options={chartOptions} />
                </div>
            </div>

            <div className="panel" style={{ height: '300px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Squat Progress</h3>
                <div style={{ height: '220px' }}>
                    <Line data={getExerciseData('squat')} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default ProgressReports;
