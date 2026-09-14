import React, { useMemo, useState } from 'react';
import { calculate1RM, calculateVolume, calculateCardioMetrics } from '../utils/analytics';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Activity, Zap, Flame, Target, Award, History, TrendingUp, Layers, Pencil, Trash2, Timer, HeartPulse } from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);
import { Bar, Line } from 'react-chartjs-2';
import ExerciseAnalytics from './ExerciseAnalytics';
import AnatomyViewer from './AnatomyViewer';
import { normalizeExerciseMuscles, ALL_MUSCLE_GROUPS, getRegionDisplayName } from '../data/muscles';

// Defensive date formatter helper
const safeFormat = (date, formatStr, fallback = 'N/A') => {
    try {
        if (!date) return fallback;
        const d = new Date(date);
        if (isNaN(d.getTime())) return fallback;
        return format(d, formatStr);
    } catch (e) {
        return fallback;
    }
};

const ProgressReports = ({ history, profile, theme, weightHistory = [], onLogWeight, onEditWeight, onDeleteWeight }) => {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    // Set Chart.js global defaults for theme
    ChartJS.defaults.color = textColor;
    ChartJS.defaults.font.family = "'Inter', -apple-system, sans-serif";

    const CLEAN_GROUP_NAMES = {
        'Chest': 'Chest',
        'Back': 'Back',
        'Shoulders': 'Shoulders',
        'Quadriceps': 'Quads',
        'Hamstrings': 'Hamstrings',
        'Glutes': 'Glutes',
        'Calves': 'Calves',
        'Biceps': 'Biceps',
        'Triceps': 'Triceps',
        'Forearms': 'Forearms',
        'Abdominals': 'Abs & Core'
    };

    // TRAINING INSIGHTS LOGIC
    const trainingInsights = useMemo(() => {
        if (!profile) return null;

        // Defensively process history
        const safeHistory = Array.isArray(history) ? history.filter(s => s && (s.date || s.timestamp) && Array.isArray(s.exercises)) : [];

        const now = Date.now();
        const last30Days = safeHistory.filter(s => {
            try {
                let sessionTime = s.timestamp;
                if (!sessionTime && s.date) {
                    const parsed = new Date(s.date).getTime();
                    if (!isNaN(parsed)) sessionTime = parsed;
                }
                if (!sessionTime) return false;
                return (now - sessionTime) / (1000 * 60 * 60 * 24) <= 30;
            } catch (e) { return false; }
        });

        // Initialize all 11 muscle groups with 0 volume
        const muscleVolumes = {};
        ALL_MUSCLE_GROUPS.forEach(grp => {
            muscleVolumes[grp] = 0;
        });
        const regionVolumes = {};

        last30Days.forEach(s => {
            (s.exercises || []).forEach(ex => {
                if (!ex || !ex.sets) return;
                const vol = calculateVolume(ex.sets);
                const norm = normalizeExerciseMuscles(ex);
                
                if (norm.primaryGroup) {
                    muscleVolumes[norm.primaryGroup] = (muscleVolumes[norm.primaryGroup] || 0) + vol;
                }
                
                (norm.primaryRegions || []).forEach(r => {
                    regionVolumes[r] = (regionVolumes[r] || 0) + vol;
                });
                
                (norm.secondaryRegions || []).forEach(r => {
                    regionVolumes[r] = (regionVolumes[r] || 0) + (vol * 0.4); // Synergist volume weight
                });
            });
        });

        const sortedRegions = Object.entries(regionVolumes).sort((a, b) => b[1] - a[1]);
        const topPrimaryRegions = sortedRegions.slice(0, 5).map(item => item[0]);
        const topSecondaryRegions = sortedRegions.slice(5, 10).map(item => item[0]);

        // Safe BMR calculation
        const weight = parseFloat(profile.bodyweight) || 70;
        const height = parseFloat(profile.height) || 170;
        const age = parseInt(profile.age) || 25;
        let bmr = profile.gender === 'male'
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        const tdee = Math.round(bmr * 1.5);
        const bulkTarget = tdee + 300;

        // Find lagging muscle group (lowest volume among all 11 major groups)
        const sortedMuscles = Object.entries(muscleVolumes).sort((a, b) => a[1] - b[1]); // Ascending: lowest volume first
        const lowestGroup = sortedMuscles.length > 0 ? sortedMuscles[0][0] : 'None';
        const focusArea = CLEAN_GROUP_NAMES[lowestGroup] || lowestGroup;

        const totalVolume = Object.values(muscleVolumes).reduce((sum, vol) => sum + vol, 0);
        const muscleMaturity = Math.min(100, Math.round((totalVolume / (weight * 100)) * 10)) || 0;

        // Weight & Muscle Calculations
        const validWeightHistory = (weightHistory || [])
            .map(w => ({
                ...w,
                weight: parseFloat(w.weight) || 0,
                bodyfat: parseFloat(w.bodyfat) || 0,
                timestamp: w.timestamp || (w.date ? new Date(w.date).getTime() : 0)
            }))
            .filter(w => w.weight > 0)
            .sort((a, b) => a.timestamp - b.timestamp);

        const initialWeight = validWeightHistory.length > 0 ? validWeightHistory[0] : null;
        const currentWeight = validWeightHistory.length > 0 ? validWeightHistory[validWeightHistory.length - 1] : null;

        let muscleMassGained = 0;
        if (initialWeight && currentWeight && initialWeight.bodyfat > 0 && currentWeight.bodyfat > 0) {
            const initialLBM = initialWeight.weight * (1 - initialWeight.bodyfat / 100);
            const currentLBM = currentWeight.weight * (1 - currentWeight.bodyfat / 100);
            muscleMassGained = Math.max(0, currentLBM - initialLBM);
        }

        const weightDelta = (currentWeight && initialWeight) ? (currentWeight.weight - initialWeight.weight).toFixed(1) : "0.0";

        // Compute Cardio Metrics
        const cardio = calculateCardioMetrics(history, weight, 30);

        return {
            tdee,
            bulkTarget,
            protein: Math.round(weight * 1.6),
            focusArea,
            muscleVolumes,
            regionVolumes,
            topPrimaryRegions,
            topSecondaryRegions,
            maturity: muscleMaturity,
            intensity: last30Days.length >= 12 ? 'High' : (last30Days.length >= 8 ? 'Moderate' : 'Developing'),
            status: profile.goal === 'fat_loss' ? 'Shredding' : 'Building',
            muscleGained: muscleMassGained.toFixed(2),
            initialLBM: initialWeight && initialWeight.bodyfat > 0 ? (initialWeight.weight * (1 - initialWeight.bodyfat / 100)).toFixed(1) : null,
            currentLBM: currentWeight && currentWeight.bodyfat > 0 ? (currentWeight.weight * (1 - currentWeight.bodyfat / 100)).toFixed(1) : null,
            weightDelta,
            totalLogs: validWeightHistory.length,
            cardio
        };
    }, [history, profile, weightHistory]);

    const getWeightChartData = () => {
        try {
            const sorted = [...(weightHistory || [])]
                .map(w => ({ ...w, weight: parseFloat(w.weight) || 0, timestamp: w.timestamp || (w.date ? new Date(w.date).getTime() : 0) }))
                .filter(w => w.weight > 0)
                .sort((a, b) => a.timestamp - b.timestamp);

            if (sorted.length === 0) return { labels: [], datasets: [] };
            const labels = sorted.map(w => safeFormat(w.timestamp, 'MMM d'));
            const data = sorted.map(w => w.weight);

            return {
                labels,
                datasets: [{
                    label: 'Weight (kg)',
                    data,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#38bdf8'
                }]
            };
        } catch (e) {
            return { labels: [], datasets: [] };
        }
    };

    const getMuscleChartData = () => {
        try {
            const rawVolumes = trainingInsights?.muscleVolumes || {};
            const labels = ALL_MUSCLE_GROUPS.map(g => CLEAN_GROUP_NAMES[g] || g);
            const data = ALL_MUSCLE_GROUPS.map(g => Math.round(rawVolumes[g] || 0));

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
        } catch (e) {
            return { labels: [], datasets: [] };
        }
    };

    const getCardioChartData = () => {
        try {
            const rawModality = trainingInsights?.cardio?.modalityMinutes || {};
            const labels = Object.keys(rawModality);
            const data = Object.values(rawModality);

            return {
                labels,
                datasets: [{
                    label: 'Minutes',
                    data,
                    backgroundColor: isDark ? '#38bdf8' : '#0284c7',
                    borderRadius: 8,
                    hoverBackgroundColor: isDark ? '#0ea5e9' : '#0369a1'
                }]
            };
        } catch (e) {
            return { labels: [], datasets: [] };
        }
    };

    const calendarData = useMemo(() => {
        try {
            const start = startOfMonth(new Date());
            const end = endOfMonth(new Date());
            const days = eachDayOfInterval({ start, end });
            const workoutDays = (history || [])
                .map(s => {
                    if (s?.timestamp) return new Date(s.timestamp);
                    if (s?.date) return new Date(s.date);
                    return null;
                })
                .filter(Boolean);

            return days.map(d => ({
                date: d,
                day: format(d, 'd'),
                isToday: isSameDay(d, new Date()),
                active: workoutDays.some(wd => isSameDay(wd, d))
            }));
        } catch (e) {
            return [];
        }
    }, [history]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                titleColor: isDark ? '#f5f5f5' : '#0f172a',
                bodyColor: isDark ? '#f5f5f5' : '#0f172a',
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
    }), [isDark, gridColor, textColor]);

    const weightChartOptions = useMemo(() => {
        const weights = (weightHistory || []).map(w => parseFloat(w.weight) || 0).filter(w => w > 0);
        const minW = weights.length > 0 ? Math.min(...weights) : 0;
        const maxW = weights.length > 0 ? Math.max(...weights) : 100;
        
        return {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    min: Math.max(0, minW - 5),
                    max: maxW + 5
                }
            }
        };
    }, [chartOptions, weightHistory]);

    if (!profile) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading your insights...
        </div>
    );

    try {
        return (
            <div className="fade-in" style={{ color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }} className="text-gradient">Training Insights</h2>
                    <div className="glass-panel" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-color)', textTransform: 'uppercase' }}>
                        Elite Protocol
                    </div>
                </div>

                {/* MOTIVATION BANNER */}
                <div className="panel" style={{ background: 'var(--accent-gradient)', border: 'none', marginBottom: '1.5rem', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <TrendingUp size={24} />
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>MINDSET OVER MATTER</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>Your metrics are a reflection of your discipline. Keep pushing.</div>
                        </div>
                    </div>
                </div>

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

                {/* WEIGHT LOG GRAPH */}
                <div className="panel" style={{ height: '280px', marginBottom: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={20} color="#38bdf8" />
                            <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Weight Journey (kg)</h3>
                        </div>
                        <button
                            onClick={onLogWeight}
                            style={{
                                padding: '4px 12px',
                                fontSize: '0.7rem',
                                height: 'auto',
                                background: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}
                        >
                            + LOG
                        </button>
                    </div>
                    <div style={{ height: '180px' }}>
                        {(weightHistory || []).length > 1 ? (
                            <Line data={getWeightChartData()} options={weightChartOptions} />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                Need at least 2 logs to show trend
                            </div>
                        )}
                    </div>
                </div>

                {/* PROGRESS SUMMARY */}
                <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <TrendingUp size={20} color="var(--success-color)" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px', color: 'var(--text-primary)' }}>BODY WEIGHT PROGRESS</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>Total Weight Delta</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: parseFloat(trainingInsights?.weightDelta) >= 0 ? 'var(--success-color)' : 'var(--accent-color)' }}>
                                {parseFloat(trainingInsights?.weightDelta) >= 0 ? '+' : ''}{trainingInsights?.weightDelta} <small style={{ fontSize: '0.9rem' }}>kg</small>
                            </div>
                        </div>
                        {trainingInsights?.muscleGained > 0 && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>Est. Muscle Gained</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-color)' }}>+{trainingInsights?.muscleGained} kg</div>
                            </div>
                        )}
                        {(!trainingInsights?.muscleGained || trainingInsights?.muscleGained == 0) && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>Logs Recorded</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{trainingInsights?.totalLogs} Logs</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* WEIGHT HISTORY TABLE */}
                <div className="panel" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History size={20} color="var(--text-secondary)" />
                            <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Weight History</h3>
                        </div>
                        <button
                            onClick={onLogWeight}
                            style={{
                                padding: '4px 12px',
                                fontSize: '0.7rem',
                                height: 'auto',
                                background: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                                border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}
                        >
                            + LOG
                        </button>
                    </div>

                    {(weightHistory || []).length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                        <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 800 }}>DATE</th>
                                        <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 800 }}>WEIGHT</th>
                                        {(weightHistory || []).some(w => w.bodyfat > 0) && (
                                            <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 800 }}>FAT %</th>
                                        )}
                                        <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 800 }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...(weightHistory || [])].reverse().map((entry, idx) => {
                                        const entryDate = entry.timestamp || (entry.date ? new Date(entry.date).getTime() : null);
                                        return (
                                            <tr key={entry.id || idx} style={{ borderBottom: '1px solid var(--border-color)', opacity: 0.9 }}>
                                                <td style={{ padding: '12px 0' }}>{safeFormat(entryDate, 'MMM d, yyyy')}</td>
                                                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>{entry.weight} kg</td>
                                                {(weightHistory || []).some(w => w.bodyfat > 0) && (entry.bodyfat > 0 ? (
                                                    <td style={{ padding: '12px 0', textAlign: 'right' }}>{entry.bodyfat}%</td>
                                                ) : (
                                                    <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>-</td>
                                                ))}
                                                <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => onEditWeight && onEditWeight(entry)}
                                                            className="icon-btn"
                                                            style={{
                                                                background: 'rgba(56, 189, 248, 0.1)',
                                                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                                                borderRadius: '8px',
                                                                padding: '6px',
                                                                color: '#38bdf8',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Edit weight log"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        {onDeleteWeight && (
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Delete weight log of ${entry.weight} kg on ${safeFormat(entryDate, 'MMM d, yyyy')}?`)) {
                                                                        onDeleteWeight(entry.id);
                                                                    }
                                                                }}
                                                                className="icon-btn"
                                                                style={{
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                    borderRadius: '8px',
                                                                    padding: '6px',
                                                                    color: 'var(--error-color)',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                title="Delete weight log"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            No weight logs found yet.
                        </div>
                    )}
                </div>

                {/* INDIVIDUAL EXERCISE PROGRESSION ANALYTICS */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <TrendingUp size={22} color="var(--accent-color)" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', color: 'var(--text-primary)' }}>Exercise Progression</h2>
                    </div>
                    <ExerciseAnalytics history={history} theme={theme} />
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

                {/* 30-DAY ANATOMY HEATMAP */}
                <div className="panel" style={{ marginBottom: '1.5rem', padding: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Target size={20} color="var(--accent-color)" />
                            <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>30-Day Muscle Target Heatmap</h3>
                        </div>
                    </div>
                    <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1rem' }}>
                        <AnatomyViewer
                            primaryRegions={trainingInsights?.topPrimaryRegions || []}
                            secondaryRegions={trainingInsights?.topSecondaryRegions || []}
                            title={trainingInsights?.topPrimaryRegions?.length > 0 ? `Top Volume Heads (30D): ${trainingInsights.topPrimaryRegions.map(getRegionDisplayName).join(', ')}` : 'Muscle Anatomy'}
                            height={280}
                        />
                    </div>
                </div>

                {/* CARDIO & AEROBIC CONDITIONING INSIGHTS */}
                <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Timer size={20} color="#38bdf8" />
                            <h3 style={{ margin: 0, fontSize: '0.95rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Cardio & Aerobic Stamina</h3>
                        </div>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px',
                            background: `${trainingInsights?.cardio?.staminaColor}15`, color: trainingInsights?.cardio?.staminaColor, border: `1px solid ${trainingInsights?.cardio?.staminaColor}40`
                        }}>
                            {trainingInsights?.cardio?.staminaTier}
                        </span>
                    </div>

                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '1.2rem' }}>
                        <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Cardio (30D)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
                                {trainingInsights?.cardio?.totalMinutes || 0} <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>min</small>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {trainingInsights?.cardio?.totalSessions || 0} Sessions
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Calories</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                                {trainingInsights?.cardio?.totalCalories || 0} <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>kcal</small>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                MET-calibrated burn
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Weekly Average</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
                                {trainingInsights?.cardio?.weeklyAverageMinutes || 0} <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>m/wk</small>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                Target: 150 min/wk
                            </div>
                        </div>
                    </div>

                    {/* Weekly Aerobic Target Progress Bar */}
                    <div style={{ marginBottom: '1.2rem', padding: '12px', background: 'var(--bg-color)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, marginBottom: '6px' }}>
                            <span style={{ color: 'var(--text-primary)' }}>AHA Aerobic Target: 150 min/wk</span>
                            <span style={{ color: trainingInsights?.cardio?.staminaColor }}>{trainingInsights?.cardio?.staminaScore || 0}% Complete</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'var(--muted-color)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${trainingInsights?.cardio?.staminaScore || 0}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #34d399)', transition: 'width 1s ease' }}></div>
                        </div>
                    </div>

                    {/* Modality Breakdown Bar Chart */}
                    <div style={{ height: '200px', marginBottom: '1.2rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Modality Breakdown (Minutes)
                        </div>
                        <div style={{ height: '170px' }}>
                            <Bar data={getCardioChartData()} options={chartOptions} />
                        </div>
                    </div>

                    {/* Recent Cardio Activity Logs */}
                    {(trainingInsights?.cardio?.recentActivities || []).length > 0 && (
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Recent Cardio Logs
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {trainingInsights.cardio.recentActivities.slice(0, 5).map((act, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '8px 12px', background: 'var(--bg-color)', borderRadius: '10px',
                                            border: '1px solid var(--border-color)', fontSize: '0.8rem'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{act.exerciseName}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{safeFormat(act.date, 'MMM d, yyyy')} • {act.workoutName}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: '#38bdf8' }}>{act.minutes} min</div>
                                            <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700 }}>🔥 {act.calories} kcal</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                <div className="panel" style={{ background: isDark ? '#1a1a1a' : 'var(--muted-color)', border: 'none', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        You are training at <b style={{ color: 'var(--text-primary)' }}>{trainingInsights?.intensity}</b> intensity.
                        Based on your analytics, specializing in <b style={{ color: 'var(--accent-color)' }}>{trainingInsights?.focusArea}</b> exercises this week will ensure symmetrical muscle development.
                    </p>
                </div>

                {/* ACTIVITY CALENDAR */}
                <div className="panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                        <Activity size={20} color="var(--accent-color)" />
                        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{safeFormat(new Date(), 'MMMM')} Training Consistency</h3>
                    </div>
                    <div className="calendar-grid">
                        {(calendarData || []).map((d, i) => (
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
    } catch (err) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--error-color)', padding: '2rem' }}>
                    <Flame size={48} color="var(--error-color)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Data Calculation Error</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        We encountered an issue processing your workout history. This can happen if some logs have corrupted dates or incomplete data.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', borderRadius: '12px', background: 'var(--accent-color)', color: 'white', border: 'none', fontWeight: 800 }}
                    >
                        RELOAD APP
                    </button>
                </div>
            </div>
        );
    }
};

export default ProgressReports;
