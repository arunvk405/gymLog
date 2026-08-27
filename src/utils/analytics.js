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
