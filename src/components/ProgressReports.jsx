import React, { useMemo } from 'react';
import { calculate1RM, calculateVolume } from '../utils/analytics';
import { Line, Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths } from 'date-fns';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const ProgressReports = ({ history }) => {
    const sortedHistory = useMemo(() => [...history].sort((a, b) => new Date(a.date) - new Date(b.date)), [history]);

    const getExerciseData = (exId) => {
        const data = sortedHistory
            .map(s => {
                const ex = s.exercises.find(e => e.id === exId || e.syncWith === exId);
                if (!ex) return null;
                return { date: format(new Date(s.date), 'MMM dd'), val: Math.max(...ex.sets.map(set => calculate1RM(set.weight, set.reps))) };
            })
            .filter(d => d !== null);

        return {
            labels: data.map(d => d.date),
            datasets: [{ label: '1RM (kg)', data: data.map(d => d.val), borderColor: '#58a6ff', backgroundColor: 'rgba(88, 166, 255, 0.1)', fill: true, tension: 0.3 }]
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
        scales: { y: { grid: { color: '#30363d' }, ticks: { color: '#8b949e', font: { size: 10 } } }, x: { grid: { color: '#30363d' }, ticks: { color: '#8b949e', font: { size: 10 } } } }
    };

    return (
        <div className="fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Strength & Consistency</h2>

            <div className="panel">
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{format(new Date(), 'MMMM yyyy')} Activity</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>
                <div className="calendar-grid">
                    {calendarData.map((d, i) => (
                        <div
                            key={i}
                            className="calendar-day"
                            style={{
                                background: d.active ? 'var(--success-color)' : 'var(--border-color)',
                                color: d.active ? 'white' : (d.isToday ? 'var(--accent-color)' : 'var(--text-secondary)'),
                                border: d.isToday ? '1px solid var(--accent-color)' : 'none'
                            }}
                        >
                            {d.day}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: 'var(--success-color)', borderRadius: '2px' }}></div>
                        Workout
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '10px', height: '10px', background: 'var(--border-color)', borderRadius: '2px' }}></div>
                        Rest
                    </div>
                </div>
            </div>

            <div className="panel" style={{ height: '300px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Bench Press Progress</h3>
                <div style={{ height: '200px' }}>
                    <Line data={getExerciseData('bench_press')} options={chartOptions} />
                </div>
            </div>

            <div className="panel" style={{ height: '300px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Squat Progress</h3>
                <div style={{ height: '200px' }}>
                    <Line data={getExerciseData('squat')} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default ProgressReports;
