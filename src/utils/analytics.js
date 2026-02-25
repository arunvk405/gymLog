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

export const getStrengthLevel = (exerciseId, bw, oneRM) => {
    if (!bw || !oneRM) return 'N/A';
    const ratio = oneRM / bw;
    const levels = STRENGTH_LEVELS[exerciseId.split('_')[0].toUpperCase()];

    if (!levels) return 'N/A';

    if (ratio >= levels.Advanced) return 'Advanced';
    if (ratio >= levels.Intermediate) return 'Intermediate';
    if (ratio >= levels.Novice) return 'Novice';
    return 'Beginner';
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
