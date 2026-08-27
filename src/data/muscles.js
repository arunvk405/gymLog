/**
 * Detailed Muscle Hierarchy Data Structure
 * Based on science-backed muscle anatomy guides (e.g. Levels Protein Guide)
 * Hierarchical relationship: Muscle Group -> Muscle Region / Head
 */

export const MUSCLE_HIERARCHY = {
    Chest: [
        'Upper Chest',
        'Mid Chest',
        'Lower Chest'
    ],
    Shoulders: [
        'Front Deltoid',
        'Side Deltoid',
        'Rear Deltoid'
    ],
    Back: [
        'Upper Back',
        'Mid Back',
        'Lower Back',
        'Lats',
        'Trapezius',
        'Rhomboids'
    ],
    Biceps: [
        'Biceps Long Head',
        'Biceps Short Head',
        'Brachialis'
    ],
    Triceps: [
        'Triceps Long Head',
        'Triceps Lateral Head',
        'Triceps Medial Head'
    ],
    Forearms: [
        'Forearm Flexors',
        'Forearm Extensors',
        'Brachioradialis'
    ],
    Abdominals: [
        'Upper Abs',
        'Lower Abs',
        'Transverse Abdominis'
    ],
    Obliques: [
        'External Obliques',
        'Internal Obliques'
    ],
    Quadriceps: [
        'Rectus Femoris',
        'Vastus Lateralis',
        'Vastus Medialis',
        'Vastus Intermedius'
    ],
    Hamstrings: [
        'Biceps Femoris',
        'Semitendinosus',
        'Semimembranosus'
    ],
    Glutes: [
        'Gluteus Maximus',
        'Gluteus Medius',
        'Gluteus Minimus'
    ],
    Calves: [
        'Gastrocnemius',
        'Soleus'
    ]
};

export const ALL_MUSCLE_GROUPS = Object.keys(MUSCLE_HIERARCHY);

/**
 * Returns all regions/heads for a given muscle group
 */
export const getMuscleRegions = (muscleGroup) => {
    return MUSCLE_HIERARCHY[muscleGroup] || [];
};

/**
 * Returns parent muscle group for a given region/head
 */
export const getGroupForRegion = (regionName) => {
    for (const [group, regions] of Object.entries(MUSCLE_HIERARCHY)) {
        if (regions.includes(regionName)) return group;
    }
    return 'Other';
};

export const GROUP_DEFAULT_REGIONS = {
    'Chest': ['Mid Chest'],
    'Shoulders': ['Front Deltoid', 'Side Deltoid'],
    'Back': ['Lats', 'Upper Back'],
    'Biceps': ['Biceps Long Head', 'Biceps Short Head'],
    'Triceps': ['Triceps Long Head', 'Triceps Lateral Head'],
    'Forearms': ['Forearm Flexors'],
    'Abdominals': ['Upper Abs', 'Lower Abs'],
    'Abs': ['Upper Abs', 'Lower Abs'],
    'Obliques': ['External Obliques'],
    'Quadriceps': ['Rectus Femoris', 'Vastus Lateralis'],
    'Quads': ['Rectus Femoris', 'Vastus Lateralis'],
    'Legs': ['Rectus Femoris', 'Gluteus Maximus', 'Vastus Lateralis'],
    'Hamstrings': ['Biceps Femoris'],
    'Glutes': ['Gluteus Maximus'],
    'Calves': ['Gastrocnemius']
};

export const EXERCISE_NAME_TARGETS = {
    // CHEST
    'barbell bench press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'flat bench press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'incline barbell press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Lateral Head'] },
    'incline dumbbell press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Lateral Head'] },
    'decline barbell press': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'decline dumbbell press': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'incline partial rom bench press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'chest fly (machine/cable)': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'cable chest fly': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'dumbbell flyes': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'dips (chest focus)': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Long Head', 'Front Deltoid'] },
    'push-ups': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Medial Head'] },

    // BACK
    'face pulls': { primaryGroup: 'Back', primaryRegions: ['Trapezius', 'Rhomboids'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Rear Deltoid'] },
    'cable seated high face pull': { primaryGroup: 'Back', primaryRegions: ['Trapezius', 'Rhomboids'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Rear Deltoid'] },
    'seated cable row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Rhomboids'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] },
    'standing 1-arm dumbbell row': { primaryGroup: 'Back', primaryRegions: ['Rhomboids', 'Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Brachialis'] },
    'bent-over barbell row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Trapezius'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Lats', 'Rhomboids', 'Brachialis'] },
    'pull-ups': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Rhomboids', 'Biceps Short Head'] },
    'chin-ups': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Biceps Short Head', 'Biceps Long Head'] },
    'partial rack deadlift': { primaryGroup: 'Back', primaryRegions: ['Trapezius', 'Mid Back', 'Lower Back'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'deadlift': { primaryGroup: 'Back', primaryRegions: ['Lower Back'], secondaryGroups: ['Glutes', 'Hamstrings', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris', 'Trapezius'] },

    // SHOULDERS
    'standing barbell overhead press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'standing kettlebell press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'plate front raise': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Chest'], secondaryRegions: ['Upper Chest'] },
    'dumbbell lateral raise': { primaryGroup: 'Shoulders', primaryRegions: ['Side Deltoid'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'bent-over rear delt raise': { primaryGroup: 'Shoulders', primaryRegions: ['Rear Deltoid'], secondaryGroups: ['Back'], secondaryRegions: ['Trapezius', 'Rhomboids'] },
    'arnold press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid', 'Side Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },

    // QUADRICEPS
    'barbell back squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'barbell front squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: ['Glutes', 'Abdominals'], secondaryRegions: ['Gluteus Maximus', 'Upper Abs'] },
    'goblet squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Lateralis'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'box squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Lateralis', 'Rectus Femoris'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'machine hack squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Medialis', 'Vastus Intermedius'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'leg press': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Lateralis', 'Vastus Medialis'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'bulgarian split squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },

    // HAMSTRINGS
    'stiff-leg barbell deadlift': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'dumbbell romanian deadlift': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'glute-ham raise': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semimembranosus'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'lying machine leg curl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },

    // GLUTES
    'barbell hip thrust': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Hamstrings', 'Glutes'], secondaryRegions: ['Biceps Femoris', 'Gluteus Medius'] },
    'weighted glute bridge': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Hamstrings'], secondaryRegions: ['Biceps Femoris'] },
    'cable kickbacks': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Medius'] },

    // CALVES
    'standing 1-leg calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'leg press calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'seated machine calf raise': { primaryGroup: 'Calves', primaryRegions: ['Soleus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },

    // TRICEPS
    'narrow-grip dips': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: ['Chest', 'Shoulders'], secondaryRegions: ['Lower Chest', 'Front Deltoid'] },
    'reverse-grip bench press': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head', 'Triceps Medial Head'], secondaryGroups: ['Chest'], secondaryRegions: ['Upper Chest'] },
    'barbell floor press': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: ['Chest'], secondaryRegions: ['Mid Chest'] },
    '1-arm overhead triceps extension': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head'], secondaryGroups: [], secondaryRegions: [] },
    'low pulley rope cable extension': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head'], secondaryGroups: [], secondaryRegions: [] },
    'overhead triceps extension': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head'], secondaryGroups: [], secondaryRegions: [] },

    // BICEPS & BRACHIALIS
    'cross-body hammer curl': { primaryGroup: 'Biceps', primaryRegions: ['Brachialis'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'reverse-grip ez bar curl': { primaryGroup: 'Biceps', primaryRegions: ['Brachialis'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Extensors'] },
    'incline dumbbell curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Long Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'preacher curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Short Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachialis'] },
    'standing barbell curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Long Head', 'Biceps Short Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },

    // ABS & CORE
    'pushup-position plank': { primaryGroup: 'Abdominals', primaryRegions: ['Transverse Abdominis'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'pallof press': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Transverse Abdominis'] },
    'kneeling cable crunch': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Lower Abs'] },
    'reverse crunch on slant board': { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'hanging pikes / toes-to-bar': { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'full contact barbell twist': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'ab vacuum': { primaryGroup: 'Abdominals', primaryRegions: ['Transverse Abdominis'], secondaryGroups: [], secondaryRegions: [] },

    // FOREARMS & GRIP
    'captains of crush grippers': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: [], secondaryRegions: [] },
    'plate pinch static holds': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Extensors'] },
    'heavy loaded carries': { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis'], secondaryGroups: ['Back'], secondaryRegions: ['Trapezius'] },
    'wrist curls': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: [], secondaryRegions: [] },
    'reverse wrist curls': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Extensors'], secondaryGroups: [], secondaryRegions: [] }
};

const ALL_VALID_REGIONS = new Set(Object.values(MUSCLE_HIERARCHY).flat());

/**
 * Safely normalizes primary and secondary muscle info for display and analytics
 */
export const normalizeExerciseMuscles = (exercise) => {
    if (!exercise) {
        return {
            primaryGroup: 'Chest',
            primaryRegions: ['Mid Chest'],
            secondaryGroups: [],
            secondaryRegions: []
        };
    }

    // 1. Check direct exercise name lookup
    const nameKey = (exercise.name || '').toLowerCase().trim();
    if (EXERCISE_NAME_TARGETS[nameKey]) {
        const target = EXERCISE_NAME_TARGETS[nameKey];
        // If exercise has explicit user overrides, prioritize valid explicit regions
        const hasExplicitValidRegions = Array.isArray(exercise.primaryRegions) &&
            exercise.primaryRegions.length > 0 &&
            exercise.primaryRegions.every(r => ALL_VALID_REGIONS.has(r));

        if (!hasExplicitValidRegions) {
            return target;
        }
    }

    // 2. Resolve Primary Group & Regions
    let primaryGroup = exercise.primaryMuscleGroup || exercise.muscleGroup || 'Chest';
    if (primaryGroup === 'Legs') primaryGroup = 'Quadriceps';

    let primaryRegions = [];
    if (Array.isArray(exercise.primaryRegions) && exercise.primaryRegions.length > 0) {
        // Filter out invalid broad names like 'Legs' or 'Chest' if present as a region
        primaryRegions = exercise.primaryRegions.flatMap(r => {
            if (ALL_VALID_REGIONS.has(r)) return [r];
            return GROUP_DEFAULT_REGIONS[r] || [];
        });
    } else if (exercise.primaryRegion) {
        if (ALL_VALID_REGIONS.has(exercise.primaryRegion)) {
            primaryRegions = [exercise.primaryRegion];
        }
    }

    if (primaryRegions.length === 0) {
        primaryRegions = GROUP_DEFAULT_REGIONS[primaryGroup] || GROUP_DEFAULT_REGIONS[exercise.muscleGroup] || ['Mid Chest'];
    }

    // 3. Resolve Secondary Groups & Regions
    let secondaryGroups = Array.isArray(exercise.secondaryMuscleGroups) ? exercise.secondaryMuscleGroups : [];
    let secondaryRegions = [];
    if (Array.isArray(exercise.secondaryRegions) && exercise.secondaryRegions.length > 0) {
        secondaryRegions = exercise.secondaryRegions.flatMap(r => {
            if (ALL_VALID_REGIONS.has(r)) return [r];
            return GROUP_DEFAULT_REGIONS[r] || [];
        });
    }

    return {
        primaryGroup,
        primaryRegions,
        secondaryGroups,
        secondaryRegions
    };
};
