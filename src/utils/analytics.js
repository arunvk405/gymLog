import { STRENGTH_LEVELS } from '../data/program';

/**
 * Epley formula for 1RM calculation: Weight * (1 + (Reps / 30))
 */
export const calculate1RM = (weight, reps) => {
    if (reps === 1) return weight;
    if (reps === 0) return 0;
    return weight * (1 + (reps / 30));
};

export const calculateVolume = (sets) => {
    return sets.reduce((total, set) => total + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0);
};

const LEVEL_COLORS = {
    'Advanced': '#38bdf8',
    'Intermediate': '#34d399',
    'Novice': '#f59e0b',
    'Beginner': '#a855f7',
    'N/A': 'var(--text-secondary)'
};

export const getStrengthLevel = (exerciseId, bw, oneRM) => {
    let label = 'N/A';
    if (bw && oneRM) {
        const ratio = oneRM / bw;
        const key = exerciseId ? exerciseId.split('_')[0].toUpperCase() : '';
        const levels = STRENGTH_LEVELS[key] || STRENGTH_LEVELS[exerciseId?.toUpperCase()];

        if (levels) {
            if (ratio >= levels.Advanced) label = 'Advanced';
            else if (ratio >= levels.Intermediate) label = 'Intermediate';
            else if (ratio >= levels.Novice) label = 'Novice';
            else label = 'Beginner';
        }
    }

    return {
        label,
        color: LEVEL_COLORS[label] || 'var(--text-secondary)'
    };
};

export const getPersonalRecords = (history) => {
    const prs = {};

    history.forEach(session => {
        session.exercises.forEach(ex => {
            const current1RM = calculate1RM(ex.sets[0]?.weight || 0, ex.sets[0]?.reps || 0);
            const currentMaxWeight = Math.max(...ex.sets.map(s => s.weight || 0));

            if (!prs[ex.id] || current1RM > prs[ex.id].oneRM) {
                prs[ex.id] = { ...prs[ex.id], oneRM: current1RM };
            }

            if (!prs[ex.id] || currentMaxWeight > prs[ex.id].maxWeight) {
                prs[ex.id].maxWeight = currentMaxWeight;
            }
        });
    });

    return prs;
};

export const getMuscleGroupVolume = (history, days = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const volumes = {};

    history.filter(s => new Date(s.date) >= cutoff).forEach(session => {
        session.exercises.forEach(ex => {
            const volume = calculateVolume(ex.sets);
            volumes[ex.muscleGroup] = (volumes[ex.muscleGroup] || 0) + volume;
        });
    });

    return volumes;
};

/**
 * Checks if an exercise is a cardio or conditioning activity
 */
export const isCardioExercise = (exercise) => {
    if (!exercise) return false;
    const type = (exercise.type || '').toLowerCase();
    const equip = (exercise.equipment || '').toLowerCase();
    const name = (exercise.name || '').toLowerCase();

    if (type === 'cardio' || equip === 'cardio') return true;

    const cardioKeywords = [
        'treadmill', 'running', 'jogging', 'sprint', 'cycling', 'bike', 'spin',
        'stairmaster', 'stair climber', 'stairs', 'rowing', 'rower', 'ergometer',
        'elliptical', 'jump rope', 'skipping', 'cardio', 'walk'
    ];

    return cardioKeywords.some(kw => name.includes(kw));
};

/**
 * Returns science-based MET (Metabolic Equivalent of Task) for cardio modalities
 */
export const getCardioMET = (exerciseName = '') => {
    const n = (exerciseName || '').toLowerCase();
    if (n.includes('sprint') || n.includes('hiit') || n.includes('jump rope') || n.includes('skipping')) return 10.0;
    if (n.includes('running') || n.includes('jogging') || n.includes('run')) return 9.8;
    if (n.includes('stair') || n.includes('climber')) return 9.0;
    if (n.includes('cycling') || n.includes('bike') || n.includes('spin')) return 7.5;
    if (n.includes('rowing') || n.includes('rower')) return 7.0;
    if (n.includes('elliptical')) return 7.0;
    if (n.includes('incline walk') || n.includes('walk') || n.includes('hiking')) return 6.0;
    return 7.0;
};

/**
 * Determines cardio modality category from exercise name
 */
export const getCardioModality = (exerciseName = '') => {
    const n = (exerciseName || '').toLowerCase();
    if (n.includes('treadmill') || n.includes('running') || n.includes('jogging') || n.includes('sprint') || n.includes('walk')) return 'Treadmill & Running';
    if (n.includes('cycling') || n.includes('bike') || n.includes('spin')) return 'Cycling & Bike';
    if (n.includes('stair') || n.includes('climber')) return 'StairMaster';
    if (n.includes('rowing') || n.includes('rower')) return 'Rowing Machine';
    if (n.includes('jump rope') || n.includes('skipping')) return 'Jump Rope';
    if (n.includes('elliptical')) return 'Elliptical';
    return 'General Cardio';
};

/**
 * Computes comprehensive cardio and conditioning insights
 */
export const calculateCardioMetrics = (history = [], bodyweight = 75, days = 30) => {
    const bw = parseFloat(bodyweight) || 75;
    const now = Date.now();
    const safeHistory = Array.isArray(history) ? history.filter(s => s && (s.date || s.timestamp) && Array.isArray(s.exercises)) : [];

    const windowHistory = days ? safeHistory.filter(s => {
        try {
            let sessionTime = s.timestamp;
            if (!sessionTime && s.date) {
                const parsed = new Date(s.date).getTime();
                if (!isNaN(parsed)) sessionTime = parsed;
            }
            if (!sessionTime) return false;
            return (now - sessionTime) / (1000 * 60 * 60 * 24) <= days;
        } catch (e) { return false; }
    }) : safeHistory;

    let totalMinutes = 0;
    let totalCalories = 0;
    let cardioSessionsCount = 0;
    const modalityMinutes = {
        'Treadmill & Running': 0,
        'Cycling & Bike': 0,
        'StairMaster': 0,
        'Rowing Machine': 0,
        'Other Cardio': 0
    };

    const recentCardioActivities = [];

    windowHistory.forEach(session => {
        let hasCardioInSession = false;
        let sessionCardioMinutes = 0;
        let sessionCardioCalories = 0;

        (session.exercises || []).forEach(ex => {
            if (!ex || !isCardioExercise(ex)) return;

            hasCardioInSession = true;
            const modality = getCardioModality(ex.name);
            const met = getCardioMET(ex.name);

            // Calculate duration in minutes from completed sets or reps
            let exMinutes = 0;
            if (Array.isArray(ex.sets) && ex.sets.length > 0) {
                ex.sets.forEach(s => {
                    if (s && s.completed !== false) {
                        const repsOrDuration = parseInt(s.reps) || 0;
                        const weightOrDist = parseFloat(s.weight) || 0;
                        // If reps is provided and > 0, use as minutes; if reps is high (>200 jump ropes), scale
                        if (repsOrDuration >= 1 && repsOrDuration <= 180) {
                            exMinutes += repsOrDuration;
                        } else if (repsOrDuration > 180) {
                            // Jump rope count e.g. 300 reps ~ 3 mins
                            exMinutes += Math.round(repsOrDuration / 100);
                        } else if (weightOrDist > 0 && weightOrDist <= 180) {
                            exMinutes += weightOrDist;
                        } else {
                            // Fallback default duration for cardio set
                            exMinutes += (ex.defaultReps || 15);
                        }
                    }
                });
            }

            if (exMinutes === 0) {
                exMinutes = (ex.defaultReps || 20);
            }

            // Calorie Formula: (MET * 3.5 * weightKg / 200) * minutes
            const exCalories = Math.round((met * 3.5 * bw / 200) * exMinutes);

            totalMinutes += exMinutes;
            totalCalories += exCalories;
            sessionCardioMinutes += exMinutes;
            sessionCardioCalories += exCalories;

            if (modalityMinutes[modality] !== undefined) {
                modalityMinutes[modality] += exMinutes;
            } else {
                modalityMinutes['Other Cardio'] += exMinutes;
            }

            recentCardioActivities.push({
                exerciseName: ex.name,
                modality,
                minutes: exMinutes,
                calories: exCalories,
                date: session.timestamp || session.date,
                workoutName: session.name || 'Workout'
            });
        });

        if (hasCardioInSession) {
            cardioSessionsCount++;
        }
    });

    const weeks = Math.max(1, (days || 30) / 7);
    const weeklyAverageMinutes = Math.round(totalMinutes / weeks);

    // Aerobic Stamina Index & Rating
    let staminaScore = Math.min(100, Math.round((weeklyAverageMinutes / 150) * 100)); // 150 min/wk = 100% AHA Standard
    let staminaTier = 'Base Builder';
    let staminaColor = '#f59e0b';

    if (weeklyAverageMinutes >= 150) {
        staminaTier = 'Iron Lungs (Elite)';
        staminaColor = '#34d399';
    } else if (weeklyAverageMinutes >= 90) {
        staminaTier = 'Conditioned Athlete';
        staminaColor = '#38bdf8';
    } else if (weeklyAverageMinutes >= 45) {
        staminaTier = 'Active Engine';
        staminaColor = '#a855f7';
    } else if (weeklyAverageMinutes > 0) {
        staminaTier = 'Developing Base';
        staminaColor = '#f59e0b';
    } else {
        staminaTier = 'Untrained / Starting';
        staminaColor = 'var(--text-secondary)';
    }

    return {
        totalMinutes,
        totalCalories,
        totalSessions: cardioSessionsCount,
        modalityMinutes,
        weeklyAverageMinutes,
        staminaScore,
        staminaTier,
        staminaColor,
        recentActivities: recentCardioActivities.slice(-10).reverse()
    };
};

