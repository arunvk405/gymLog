import React, { useMemo } from 'react';
import { calculate1RM, calculateVolume } from '../utils/analytics';
import { Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Activity, Zap, Flame, Target, Award } from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

const ProgressReports = ({ history, profile, theme }) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    // Set Chart.js global defaults for theme
    ChartJS.defaults.color = textColor;
    ChartJS.defaults.font.family = "'Inter', -apple-system, sans-serif";

    // TRAINING INSIGHTS LOGIC
    const trainingInsights = useMemo(() => {
        if (!profile) return null;

        const last30Days = history.filter(s => {
            const date = new Date(s.date);
            const today = new Date();
            return (today - date) / (1000 * 60 * 60 * 24) <= 30;
        });

        const muscleVolumes = {};
        last30Days.forEach(s => {
            s.exercises.forEach(ex => {
                const vol = calculateVolume(ex.sets);
                muscleVolumes[ex.muscleGroup] = (muscleVolumes[ex.muscleGroup] || 0) + vol;
            });
        });

        let bmr = profile.gender === 'male'
            ? 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age - 161;

        const tdee = Math.round(bmr * 1.5);
        const bulkTarget = tdee + 300;

        const sortedMuscles = Object.entries(muscleVolumes).sort((a, b) => a[1] - b[1]);
        const focusArea = sortedMuscles.length > 0 ? sortedMuscles[0][0] : 'No data yet';

        const totalVolume = Object.values(muscleVolumes).reduce((sum, vol) => sum + vol, 0);
        const volumePerKg = profile.bodyweight > 0 ? totalVolume / profile.bodyweight : 0;
        const muscleMaturity = Math.min(100, Math.round((volumePerKg / 50) * 100));

        return {
            tdee,
            bulkTarget,
            protein: Math.round(profile.bodyweight * 2),
            focusArea,
            muscleVolumes,
            maturity: muscleMaturity,
            intensity: last30Days.length >= 12 ? 'High' : (last30Days.length >= 8 ? 'Moderate' : 'Developing'),
            status: profile.goal === 'fat_loss' ? 'Shredding' : 'Building'
        };
    }, [history, profile]);

    const getMuscleChartData = () => {
        const labels = Object.keys(trainingInsights?.muscleVolumes || {});
        const data = Object.values(trainingInsights?.muscleVolumes || {});

        return {
            labels,
            datasets: [{
                label: 'Volume (kg)',
                data,
                backgroundColor: isDark ? '#38bdf8' : '#2563eb',
                borderRadius: 8,
                hoverBackgroundColor: isDark ? '#0ea5e9' : '#1d4ed8'
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
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f8fafc' : '#0f172a',
                bodyColor: isDark ? '#f8fafc' : '#0f172a',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                grid: { color: gridColor, drawBorder: false },
                ticks: { color: textColor, font: { size: 10, weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: textColor, font: { size: 10, weight: 'bold' } }
            }
        }
    };

    return (
        <div className="fade-in" style={{ color: 'var(--text-primary)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Training Insights</h2>

            {/* ANABOLIC STATUS GUIDE */}
            <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={20} color="#ef4444" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', color: 'var(--text-primary)' }}>ANABOLIC STATUS</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-color)' }}>LEVEL {Math.floor((trainingInsights?.maturity || 0) / 10) + 1}</span>
                </div>
                <div style={{ width: '100%', height: '14px', background: 'var(--muted-color)', borderRadius: '7px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: `${trainingInsights?.maturity || 0}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f59e0b)', transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    <span>INTENSITY: {trainingInsights?.maturity}%</span>
                    <span>NEXT TIER: {10 - ((trainingInsights?.maturity || 0) % 10)}% VOL</span>
                </div>
                <div style={{ marginTop: '1.2rem', padding: '0.8rem 1rem', background: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <b style={{ color: 'var(--text-primary)' }}>What is this?</b> Analysis of your volume vs body weight. <b style={{ color: 'var(--success-color)' }}>Higher is better</b>—a higher % indicates your system is fully primed for hypertrophy.
                    </p>
                </div>
            </div>

            {/* MUSCLE GROUP DISTRIBUTION */}
            <div className="panel" style={{ height: '280px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                    <Award size={20} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Volume Distribution</h3>
                </div>
                <div style={{ height: '180px' }}>
                    <Bar data={getMuscleChartData()} options={chartOptions} />
                </div>
            </div>

            {/* STATUS CARDS */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Target size={16} color="var(--accent-color)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>FOCUS AREA</span>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-primary)' }}>{trainingInsights?.focusArea}</div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, margin: '4px 0 0' }}>NEEDS MORE VOLUME</p>
                </div>
                <div className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Zap size={16} color="#f59e0b" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>PHASE</span>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-primary)' }}>{trainingInsights?.status}</div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, margin: '4px 0 0' }}>CURRENT GOAL</p>
                </div>
            </div>

            {/* SUMMARY INFO */}
            <div className="panel" style={{ background: isDark ? '#1e293b' : 'var(--muted-color)', border: 'none', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    You are training at <b style={{ color: 'var(--text-primary)' }}>{trainingInsights?.intensity}</b> intensity.
                    Based on your analytics, specializing in <b style={{ color: 'var(--accent-color)' }}>{trainingInsights?.focusArea}</b> exercises this week will ensure symmetrical muscle development.
                </p>
            </div>

            {/* ACTIVITY CALENDAR */}
            <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                    <Activity size={20} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{format(new Date(), 'MMMM')} Training Consistency</h3>
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
        </div>
    );
};

export default ProgressReports;
