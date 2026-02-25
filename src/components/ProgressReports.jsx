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

    // HEALTH & MUSCLE INSIGHTS LOGIC
    const healthStats = useMemo(() => {
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

        const total30DayVol = Object.values(muscleVolumes).reduce((a, b) => a + b, 0);
        const muscleMaturity = Math.min(100, Math.round((total30DayVol / (profile.bodyweight * 100)) * 10));

        // Caloric Math
        let bmr = profile.gender === 'male'
            ? 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age - 161;

        const tdee = Math.round(bmr * 1.5); // Moderate activity default
        const bulkTarget = tdee + 300; // Lean bulk surplus

        // Best/Lagging muscle groups
        const sortedMuscles = Object.entries(muscleVolumes).sort((a, b) => b[1] - a[1]);

        return {
            maturity: muscleMaturity,
            total30DayVol,
            tdee,
            bulkTarget,
            protein: Math.round(profile.bodyweight * 2),
            muscleVolumes,
            topMuscle: sortedMuscles[0]?.[0] || 'N/A',
            focusMuscle: sortedMuscles.length > 0 ? (sortedMuscles.length < 5 ? 'Core/Shoulders' : sortedMuscles[sortedMuscles.length - 1][0]) : 'N/A',
            intensity: last30Days.length >= 12 ? 'Elite' : (last30Days.length >= 8 ? 'Consistent' : 'Building'),
            status: profile.goal === 'fat_loss' ? 'Catabolic / Shred' : 'Anabolic / Build'
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
            datasets: [{ label: '1RM (kg)', data: data.map(d => d.val), borderColor: 'var(--accent-color)', backgroundColor: 'var(--muted-color)', fill: true, tension: 0.3 }]
        };
    };

    const getMuscleChartData = () => {
        const labels = Object.keys(healthStats?.muscleVolumes || {});
        const data = Object.values(healthStats?.muscleVolumes || {});
        return {
            labels,
            datasets: [{
                label: 'Volume (kg)',
                data,
                backgroundColor: 'var(--accent-color)',
                borderRadius: 8,
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
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-primary)', font: { size: 11, weight: 'bold' } } },
            x: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-primary)', font: { size: 11, weight: 'bold' } } }
        }
    };

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Aesthetix Intelligence</h2>

            {/* HYPERTROPHY HP BAR */}
            <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame size={20} color="#ff4d4d" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px' }}>ANABOLIC STATUS</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-color)' }}>LEVEL {Math.floor((healthStats?.maturity || 0) / 10) + 1}</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--muted-color)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: `${healthStats?.maturity || 0}%`, height: '100%', background: 'linear-gradient(90deg, #ff4d4d, #ff944d)', transition: 'width 1s ease-in-out' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    <span>PROGRESS: {healthStats?.maturity}%</span>
                    <span>NEXT TIER: {10 - ((healthStats?.maturity || 0) % 10)}% VOL</span>
                </div>
                <div style={{ marginTop: '1rem', padding: '0.6rem 0.8rem', background: 'rgba(255, 77, 77, 0.05)', borderRadius: '8px', borderLeft: '3px solid #ff4d4d' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <b>What is this?</b> Analysis of your work capacity vs body weight. <b>Higher is better</b>—a high % (80+) indicates your central nervous system and muscles are fully primed for maximum hypertrophy.
                    </p>
                </div>
            </div>

            {/* WEIGHT GAIN & HEALTH DASHBOARD */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Scale size={16} color="var(--accent-color)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>PREDICTED GAIN</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>+0.5kg<small style={{ fontSize: '0.75rem', opacity: 0.6 }}>/wk</small></div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--success-color)', fontWeight: 800, margin: '4px 0 0' }}>OPTIMAL RANGE</p>
                </div>
                <div className="panel" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Zap size={16} color="#fbbf24" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>BULK TARGET</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{healthStats?.bulkTarget || 0}</div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, margin: '4px 0 0' }}>KCAL / DAY</p>
                </div>
            </div>

            {/* MUSCLE GROUP DISTRIBUTION */}
            <div className="panel" style={{ height: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                    <Award size={20} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Volume Distribution</h3>
                </div>
                <div style={{ height: '180px' }}>
                    <Bar data={getMuscleChartData()} options={chartOptions} />
                </div>
            </div>

            {/* NUTRITIONAL STRATEGY */}
            <div className="panel" style={{ background: 'var(--muted-color)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Utensils size={18} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Nutritional Protocol</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>PROTEIN</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{healthStats?.protein}g</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CARBS</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>~{(healthStats?.bulkTarget * 0.5 / 4).toFixed(0)}g</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800 }}>FATS</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>~{(healthStats?.bulkTarget * 0.25 / 9).toFixed(0)}g</div>
                    </div>
                </div>
                <div style={{ padding: '0.8rem', background: 'var(--panel-color)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-color)' }}>💪 FOCUS AREA:</span> Your <b>{healthStats?.focusMuscle}</b> volume is low relative to <b>{healthStats?.topMuscle}</b>. Increase sets by 20% for balanced growth.
                </div>
            </div>

            {/* ACTIVITY CALENDAR */}
            <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                    <Target size={20} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>{format(new Date(), 'MMMM')} Training Density</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>
                <div className="calendar-grid">
                    {calendarData.map((d, i) => (
                        <div
                            key={i}
                            className="calendar-day"
                            style={{
                                background: d.active ? 'var(--success-color)' : 'var(--muted-color)',
                                color: d.active ? 'white' : (d.isToday ? 'var(--accent-color)' : 'var(--text-secondary)'),
                                border: d.isToday ? '2px solid var(--accent-color)' : (d.active ? 'none' : '1px solid var(--border-color)')
                            }}
                        >
                            {d.day}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: 'var(--success-color)', borderRadius: '2px' }}></div>
                        Lifting Day
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: 'var(--muted-color)', borderRadius: '2px' }}></div>
                        Recovery
                    </div>
                </div>
            </div>

            <div className="panel" style={{ height: '300px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Big 3 Strength Progress (1RM)</h3>
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
