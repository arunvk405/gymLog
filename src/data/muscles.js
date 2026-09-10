/**
 * Detailed Muscle Hierarchy & Science-Backed Anatomical Metadata
 * Categorized by 11 Major Muscle Groups with specific anatomical heads & regions.
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

export const ALL_MUSCLE_GROUPS = [
    'Chest',
    'Back',
    'Shoulders',
    'Quadriceps',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Biceps',
    'Triceps',
    'Forearms',
    'Abdominals'
];

/**
 * Rich Muscle Group Info containing Common Names, Scientific Nomenclature, and Head Subtitles
 */
export const MUSCLE_GROUP_INFO = {
    Quadriceps: {
        commonName: 'Quads',
        formalName: 'Quadriceps Femoris',
        subtitle: 'Rectus Femoris, Vastus Lateralis, Medialis & Intermedius',
        shortDescription: 'Front thigh knee extension & athletic drive',
        primaryHeads: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis', 'Vastus Intermedius']
    },
    Hamstrings: {
        commonName: 'Hamstrings',
        formalName: 'Hamstring Complex',
        subtitle: 'Biceps Femoris, Semitendinosus & Semimembranosus',
        shortDescription: 'Posterior thigh knee flexion & hip hinge power',
        primaryHeads: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus']
    },
    Glutes: {
        commonName: 'Glutes',
        formalName: 'Gluteal Complex',
        subtitle: 'Gluteus Maximus, Medius & Minimus',
        shortDescription: 'Hip extension, pelvis stability & lockouts',
        primaryHeads: ['Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus']
    },
    Calves: {
        commonName: 'Calves',
        formalName: 'Triceps Surae',
        subtitle: 'Gastrocnemius & Soleus',
        shortDescription: 'Ankle plantarflexion & sprint propulsion',
        primaryHeads: ['Gastrocnemius', 'Soleus']
    },
    Chest: {
        commonName: 'Chest / Pecs',
        formalName: 'Pectoralis Major & Minor',
        subtitle: 'Upper (Clavicular), Mid (Sternal) & Lower (Costal) Pecs',
        shortDescription: 'Horizontal pushing, pressing & arm adduction',
        primaryHeads: ['Upper Chest', 'Mid Chest', 'Lower Chest']
    },
    Back: {
        commonName: 'Back',
        formalName: 'Dorsal Musculature',
        subtitle: 'Lats, Trapezius, Rhomboids & Erector Spinae',
        shortDescription: 'Vertical/horizontal pulling & spinal stability',
        primaryHeads: ['Lats', 'Trapezius', 'Rhomboids', 'Upper Back', 'Mid Back', 'Lower Back']
    },
    Shoulders: {
        commonName: 'Shoulders / Delts',
        formalName: 'Deltoid Musculature',
        subtitle: 'Front (Anterior), Side (Lateral) & Rear (Posterior) Delts',
        shortDescription: 'Overhead pressing, side abduction & shoulder rotation',
        primaryHeads: ['Front Deltoid', 'Side Deltoid', 'Rear Deltoid']
    },
    Biceps: {
        commonName: 'Biceps & Brachialis',
        formalName: 'Biceps Brachii',
        subtitle: 'Long Head (Peak), Short Head (Inner) & Brachialis',
        shortDescription: 'Elbow flexion, arm thickness & forearm supination',
        primaryHeads: ['Biceps Long Head', 'Biceps Short Head', 'Brachialis']
    },
    Triceps: {
        commonName: 'Triceps',
        formalName: 'Triceps Brachii',
        subtitle: 'Long Head, Lateral Head & Medial Head',
        shortDescription: 'Elbow extension, lockout power & arm circumference',
        primaryHeads: ['Triceps Long Head', 'Triceps Lateral Head', 'Triceps Medial Head']
    },
    Forearms: {
        commonName: 'Forearms & Grip',
        formalName: 'Antebrachial Muscles',
        subtitle: 'Brachioradialis, Forearm Flexors & Extensors',
        shortDescription: 'Wrist flexion, extension & crush grip strength',
        primaryHeads: ['Brachioradialis', 'Forearm Flexors', 'Forearm Extensors']
    },
    Abdominals: {
        commonName: 'Abs & Core',
        formalName: 'Rectus Abdominis & Deep Core',
        subtitle: 'Upper/Lower Abs, Obliques & Transverse Abdominis',
        shortDescription: 'Spinal flexion, anti-rotation & intra-abdominal pressure',
        primaryHeads: ['Upper Abs', 'Lower Abs', 'Transverse Abdominis']
    },
    Obliques: {
        commonName: 'Obliques',
        formalName: 'Oblique Abdominis',
        subtitle: 'External & Internal Obliques',
        shortDescription: 'Lateral trunk flexion & torsional power',
        primaryHeads: ['External Obliques', 'Internal Obliques']
    }
};

/**
 * Anatomical Head / Region Display Map with both Scientific and Common Names
 */
export const REGION_DISPLAY_NAMES = {
    // Quadriceps
    'Rectus Femoris': 'Rectus Femoris (Front Quad)',
    'Vastus Lateralis': 'Vastus Lateralis (Outer Quad Sweep)',
    'Vastus Medialis': 'Vastus Medialis (Teardrop)',
    'Vastus Intermedius': 'Vastus Intermedius (Deep Quad)',

    // Hamstrings
    'Biceps Femoris': 'Biceps Femoris (Outer Hamstring)',
    'Semitendinosus': 'Semitendinosus (Inner Hamstring)',
    'Semimembranosus': 'Semimembranosus (Deep Hamstring)',

    // Glutes
    'Gluteus Maximus': 'Gluteus Maximus (Main Glute)',
    'Gluteus Medius': 'Gluteus Medius (Upper/Side Glute)',
    'Gluteus Minimus': 'Gluteus Minimus (Deep Hip Glute)',

    // Calves
    'Gastrocnemius': 'Gastrocnemius (Upper Diamond Calf)',
    'Soleus': 'Soleus (Lower Deep Calf)',

    // Chest
    'Upper Chest': 'Upper Chest (Clavicular Head)',
    'Mid Chest': 'Mid Chest (Sternal Head)',
    'Lower Chest': 'Lower Chest (Costal Head)',

    // Shoulders
    'Front Deltoid': 'Front Deltoid (Anterior Delt)',
    'Side Deltoid': 'Side Deltoid (Lateral Delt)',
    'Rear Deltoid': 'Rear Deltoid (Posterior Delt)',

    // Back
    'Lats': 'Lats (Latissimus Dorsi)',
    'Trapezius': 'Trapezius (Traps - Upper/Mid)',
    'Rhomboids': 'Rhomboids (Mid Back Squeeze)',
    'Upper Back': 'Upper Back (Teres Major / Infraspinatus)',
    'Mid Back': 'Mid Back (Thoracic Extensors)',
    'Lower Back': 'Lower Back (Erector Spinae)',

    // Biceps
    'Biceps Long Head': 'Biceps Long Head (Outer Peak)',
    'Biceps Short Head': 'Biceps Short Head (Inner Thickness)',
    'Brachialis': 'Brachialis (Under Bicep / Upper Arm)',

    // Triceps
    'Triceps Long Head': 'Triceps Long Head (Inner/Overhead)',
    'Triceps Lateral Head': 'Triceps Lateral Head (Outer Sweep)',
    'Triceps Medial Head': 'Triceps Medial Head (Lower Lockout)',

    // Forearms
    'Brachioradialis': 'Brachioradialis (Top Radial Forearm)',
    'Forearm Flexors': 'Forearm Flexors (Inner Forearm / Grip)',
    'Forearm Extensors': 'Forearm Extensors (Outer Forearm)',

    // Abs & Core
    'Upper Abs': 'Upper Abs (Rectus Abdominis)',
    'Lower Abs': 'Lower Abs (Rectus Abdominis)',
    'Transverse Abdominis': 'Transverse Abdominis (Deep Core)',
    'External Obliques': 'External Obliques (Side Flanks)',
    'Internal Obliques': 'Internal Obliques (Deep Side Core)'
};

/**
 * Returns formatted region display name
 */
export const getRegionDisplayName = (region) => {
    return REGION_DISPLAY_NAMES[region] || region;
};

/**
 * Returns formatted group display name
 */
export const getGroupDisplayName = (group) => {
    const info = MUSCLE_GROUP_INFO[group];
    if (info) {
        return `${info.commonName} (${info.subtitle})`;
    }
    return group;
};

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
    'Forearms': ['Brachioradialis', 'Forearm Flexors'],
    'Abdominals': ['Upper Abs', 'Lower Abs'],
    'Abs': ['Upper Abs', 'Lower Abs'],
    'Obliques': ['External Obliques'],
    'Quadriceps': ['Rectus Femoris', 'Vastus Lateralis'],
    'Quads': ['Rectus Femoris', 'Vastus Lateralis'],
    'Legs': ['Rectus Femoris', 'Vastus Lateralis', 'Gluteus Maximus'],
    'Hamstrings': ['Biceps Femoris', 'Semitendinosus'],
    'Glutes': ['Gluteus Maximus', 'Gluteus Medius'],
    'Calves': ['Gastrocnemius', 'Soleus']
};

/**
 * Master dictionary mapping lowercase exercise names and common aliases to accurate anatomy targets
 */
export const EXERCISE_NAME_TARGETS = {
    // ==========================================
    // CHEST
    // ==========================================
    'barbell bench press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'bench press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'flat bench press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'incline barbell press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Lateral Head'] },
    'incline bench press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Lateral Head'] },
    'incline dumbbell press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Lateral Head'] },
    'incline db press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Lateral Head'] },
    'decline barbell press': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'decline bench press': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'decline dumbbell press': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'dumbbell bench press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'incline partial rom bench press': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid'] },
    'machine chest press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'chest fly (machine/cable)': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'cable chest fly': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'cable flyes': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'dumbbell flyes': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'pec deck': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'pec deck fly': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'incline dumbbell fly': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'low-to-high cable fly': { primaryGroup: 'Chest', primaryRegions: ['Upper Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'high-to-low cable fly': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'dips (chest focus)': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Long Head', 'Front Deltoid'] },
    'chest dips': { primaryGroup: 'Chest', primaryRegions: ['Lower Chest'], secondaryGroups: ['Triceps', 'Shoulders'], secondaryRegions: ['Triceps Long Head', 'Front Deltoid'] },
    'push-ups': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Medial Head'] },
    'pushups': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders', 'Triceps'], secondaryRegions: ['Front Deltoid', 'Triceps Medial Head'] },
    'svend press': { primaryGroup: 'Chest', primaryRegions: ['Mid Chest'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },

    // ==========================================
    // BACK
    // ==========================================
    'deadlift': { primaryGroup: 'Back', primaryRegions: ['Lower Back', 'Trapezius'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'barbell deadlift': { primaryGroup: 'Back', primaryRegions: ['Lower Back', 'Trapezius'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'conventional deadlift': { primaryGroup: 'Back', primaryRegions: ['Lower Back', 'Trapezius'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'partial rack deadlift': { primaryGroup: 'Back', primaryRegions: ['Trapezius', 'Mid Back', 'Lower Back'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'rack pull': { primaryGroup: 'Back', primaryRegions: ['Trapezius', 'Mid Back', 'Lower Back'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'pull-ups': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Rhomboids', 'Biceps Short Head'] },
    'pullups': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Rhomboids', 'Biceps Short Head'] },
    'chin-ups': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Biceps Short Head', 'Biceps Long Head'] },
    'chinups': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Biceps Short Head', 'Biceps Long Head'] },
    'lat pulldown': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Biceps', 'Back'], secondaryRegions: ['Biceps Short Head', 'Rhomboids'] },
    'wide-grip lat pulldown': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Biceps', 'Back'], secondaryRegions: ['Biceps Short Head', 'Rhomboids'] },
    'close-grip lat pulldown': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Biceps Long Head'] },
    'bent-over barbell row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Trapezius'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Lats', 'Rhomboids', 'Brachialis'] },
    'barbell row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Trapezius'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Lats', 'Rhomboids', 'Brachialis'] },
    'pendlay row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Trapezius'], secondaryGroups: ['Lats', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] },
    'standing 1-arm dumbbell row': { primaryGroup: 'Back', primaryRegions: ['Rhomboids', 'Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Brachialis'] },
    'single arm dumbbell row': { primaryGroup: 'Back', primaryRegions: ['Rhomboids', 'Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Brachialis'] },
    'dumbbell row': { primaryGroup: 'Back', primaryRegions: ['Rhomboids', 'Lats'], secondaryGroups: ['Biceps'], secondaryRegions: ['Brachialis'] },
    'seated cable row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Rhomboids'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] },
    'cable seated row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Rhomboids'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] },
    't-bar row': { primaryGroup: 'Back', primaryRegions: ['Mid Back', 'Trapezius'], secondaryGroups: ['Lats', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] },
    'chest supported t-bar row': { primaryGroup: 'Back', primaryRegions: ['Upper Back', 'Rhomboids'], secondaryGroups: ['Lats', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] },
    'chest-supported dumbbell row': { primaryGroup: 'Back', primaryRegions: ['Upper Back', 'Rhomboids'], secondaryGroups: ['Lats', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] },
    'face pulls': { primaryGroup: 'Back', primaryRegions: ['Trapezius', 'Rhomboids'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Rear Deltoid'] },
    'cable seated high face pull': { primaryGroup: 'Back', primaryRegions: ['Trapezius', 'Rhomboids'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Rear Deltoid'] },
    'straight-arm lat pulldown': { primaryGroup: 'Back', primaryRegions: ['Lats'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Long Head'] },
    'barbell shrug': { primaryGroup: 'Back', primaryRegions: ['Trapezius'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Flexors'] },
    'dumbbell shrug': { primaryGroup: 'Back', primaryRegions: ['Trapezius'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Flexors'] },
    'hyperextensions (back extensions)': { primaryGroup: 'Back', primaryRegions: ['Lower Back'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'back extensions': { primaryGroup: 'Back', primaryRegions: ['Lower Back'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },

    // ==========================================
    // SHOULDERS
    // ==========================================
    'standing barbell overhead press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'overhead press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'military press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'seated dumbbell shoulder press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid', 'Side Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'dumbbell shoulder press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid', 'Side Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'arnold press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid', 'Side Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },
    'dumbbell lateral raise': { primaryGroup: 'Shoulders', primaryRegions: ['Side Deltoid'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'lateral raise': { primaryGroup: 'Shoulders', primaryRegions: ['Side Deltoid'], secondaryGroups: ['Shoulders'], secondaryRegions: ['Front Deltoid'] },
    'cable lateral raise': { primaryGroup: 'Shoulders', primaryRegions: ['Side Deltoid'], secondaryGroups: [], secondaryRegions: [] },
    'plate front raise': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Chest'], secondaryRegions: ['Upper Chest'] },
    'dumbbell front raise': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Chest'], secondaryRegions: ['Upper Chest'] },
    'bent-over rear delt raise': { primaryGroup: 'Shoulders', primaryRegions: ['Rear Deltoid'], secondaryGroups: ['Back'], secondaryRegions: ['Trapezius', 'Rhomboids'] },
    'rear delt fly': { primaryGroup: 'Shoulders', primaryRegions: ['Rear Deltoid'], secondaryGroups: ['Back'], secondaryRegions: ['Trapezius', 'Rhomboids'] },
    'reverse pec deck fly': { primaryGroup: 'Shoulders', primaryRegions: ['Rear Deltoid'], secondaryGroups: ['Back'], secondaryRegions: ['Trapezius', 'Rhomboids'] },
    'cable rear delt fly': { primaryGroup: 'Shoulders', primaryRegions: ['Rear Deltoid'], secondaryGroups: ['Back'], secondaryRegions: ['Trapezius'] },
    'upright row': { primaryGroup: 'Shoulders', primaryRegions: ['Side Deltoid'], secondaryGroups: ['Back'], secondaryRegions: ['Trapezius'] },
    'machine shoulder press': { primaryGroup: 'Shoulders', primaryRegions: ['Front Deltoid'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Lateral Head'] },

    // ==========================================
    // QUADRICEPS (QUADS)
    // ==========================================
    'barbell back squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'back squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'barbell front squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: ['Glutes', 'Abdominals'], secondaryRegions: ['Gluteus Maximus', 'Upper Abs'] },
    'front squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: ['Glutes', 'Abdominals'], secondaryRegions: ['Gluteus Maximus', 'Upper Abs'] },
    'leg press': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Lateralis', 'Vastus Medialis'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'machine hack squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Medialis', 'Vastus Intermedius'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'hack squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Medialis', 'Vastus Intermedius'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'goblet squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Lateralis'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'box squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Vastus Lateralis', 'Rectus Femoris'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'bulgarian split squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'split squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'walking lunges': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'lunges': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'], secondaryGroups: ['Glutes', 'Hamstrings'], secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris'] },
    'reverse lunge': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'leg extensions': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: [], secondaryRegions: [] },
    'leg extension': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: [], secondaryRegions: [] },
    'machine leg extension': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: [], secondaryRegions: [] },
    'sissy squat': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris', 'Vastus Medialis'], secondaryGroups: [], secondaryRegions: [] },
    'step-ups': { primaryGroup: 'Quadriceps', primaryRegions: ['Rectus Femoris'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },

    // ==========================================
    // HAMSTRINGS
    // ==========================================
    'stiff-leg barbell deadlift': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'stiff leg deadlift': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'romanian deadlift': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'barbell romanian deadlift': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'barbell rdl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'dumbbell romanian deadlift': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'dumbbell rdl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'rdl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },
    'glute-ham raise': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semimembranosus'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'lying machine leg curl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },
    'lying leg curl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },
    'seated leg curl': { primaryGroup: 'Hamstrings', primaryRegions: ['Semitendinosus', 'Semimembranosus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },
    'seated machine leg curl': { primaryGroup: 'Hamstrings', primaryRegions: ['Semitendinosus', 'Semimembranosus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },
    'standing single-leg curl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris'], secondaryGroups: [], secondaryRegions: [] },
    'nordic hamstring curl': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Maximus'] },
    'good mornings': { primaryGroup: 'Hamstrings', primaryRegions: ['Biceps Femoris', 'Semitendinosus'], secondaryGroups: ['Glutes', 'Back'], secondaryRegions: ['Gluteus Maximus', 'Lower Back'] },

    // ==========================================
    // GLUTES
    // ==========================================
    'barbell hip thrust': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Hamstrings', 'Glutes'], secondaryRegions: ['Biceps Femoris', 'Gluteus Medius'] },
    'hip thrust': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Hamstrings', 'Glutes'], secondaryRegions: ['Biceps Femoris', 'Gluteus Medius'] },
    'weighted glute bridge': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Hamstrings'], secondaryRegions: ['Biceps Femoris'] },
    'glute bridge': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Hamstrings'], secondaryRegions: ['Biceps Femoris'] },
    'cable kickbacks': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Medius'] },
    'cable glute kickback': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Medius'] },
    'machine hip abduction': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Medius', 'Gluteus Minimus'], secondaryGroups: [], secondaryRegions: [] },
    'hip abduction': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Medius', 'Gluteus Minimus'], secondaryGroups: [], secondaryRegions: [] },
    'cable pull-through': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Hamstrings'], secondaryRegions: ['Biceps Femoris'] },
    'frog pumps': { primaryGroup: 'Glutes', primaryRegions: ['Gluteus Maximus'], secondaryGroups: ['Glutes'], secondaryRegions: ['Gluteus Medius'] },

    // ==========================================
    // CALVES
    // ==========================================
    'standing calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'standing 1-leg calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'single leg calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'leg press calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'seated machine calf raise': { primaryGroup: 'Calves', primaryRegions: ['Soleus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },
    'seated calf raise': { primaryGroup: 'Calves', primaryRegions: ['Soleus'], secondaryGroups: ['Calves'], secondaryRegions: ['Gastrocnemius'] },
    'donkey calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'smith machine calf raise': { primaryGroup: 'Calves', primaryRegions: ['Gastrocnemius'], secondaryGroups: ['Calves'], secondaryRegions: ['Soleus'] },
    'tibialis raise': { primaryGroup: 'Calves', primaryRegions: ['Soleus'], secondaryGroups: [], secondaryRegions: [] },

    // ==========================================
    // TRICEPS
    // ==========================================
    'triceps pushdown': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Medial Head'] },
    'cable rope pushdown': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: ['Triceps'], secondaryRegions: ['Triceps Medial Head'] },
    'overhead triceps extension': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head'], secondaryGroups: [], secondaryRegions: [] },
    '1-arm overhead triceps extension': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head'], secondaryGroups: [], secondaryRegions: [] },
    'low pulley rope cable extension': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head'], secondaryGroups: [], secondaryRegions: [] },
    'cable overhead tricep extension': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head'], secondaryGroups: [], secondaryRegions: [] },
    'skull crushers': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head', 'Triceps Medial Head'], secondaryGroups: [], secondaryRegions: [] },
    'ez-bar skull crusher': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Long Head', 'Triceps Medial Head'], secondaryGroups: [], secondaryRegions: [] },
    'close-grip barbell bench press': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head', 'Triceps Medial Head'], secondaryGroups: ['Chest'], secondaryRegions: ['Mid Chest'] },
    'close grip bench press': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head', 'Triceps Medial Head'], secondaryGroups: ['Chest'], secondaryRegions: ['Mid Chest'] },
    'narrow-grip dips': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: ['Chest', 'Shoulders'], secondaryRegions: ['Lower Chest', 'Front Deltoid'] },
    'tricep dips': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: ['Chest', 'Shoulders'], secondaryRegions: ['Lower Chest', 'Front Deltoid'] },
    'reverse-grip bench press': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head', 'Triceps Medial Head'], secondaryGroups: ['Chest'], secondaryRegions: ['Upper Chest'] },
    'barbell floor press': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: ['Chest'], secondaryRegions: ['Mid Chest'] },
    'dumbbell tricep kickbacks': { primaryGroup: 'Triceps', primaryRegions: ['Triceps Lateral Head'], secondaryGroups: [], secondaryRegions: [] },

    // ==========================================
    // BICEPS & BRACHIALIS
    // ==========================================
    'standing barbell curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Long Head', 'Biceps Short Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'barbell curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Long Head', 'Biceps Short Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'incline dumbbell curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Long Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'preacher curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Short Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachialis'] },
    'ez-bar preacher curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Short Head'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachialis'] },
    'cross-body hammer curl': { primaryGroup: 'Biceps', primaryRegions: ['Brachialis'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'hammer curl': { primaryGroup: 'Biceps', primaryRegions: ['Brachialis'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'standing dumbbell hammer curl (neutral grip)': { primaryGroup: 'Biceps', primaryRegions: ['Brachialis'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'reverse-grip ez bar curl': { primaryGroup: 'Biceps', primaryRegions: ['Brachialis'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Extensors'] },
    'concentration curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Short Head'], secondaryGroups: [], secondaryRegions: [] },
    'spider curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Short Head'], secondaryGroups: [], secondaryRegions: [] },
    'cable biceps curl': { primaryGroup: 'Biceps', primaryRegions: ['Biceps Long Head'], secondaryGroups: [], secondaryRegions: [] },

    // ==========================================
    // ABS & CORE
    // ==========================================
    'machine crunches': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Lower Abs'] },
    'abdominal crunch machine': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Lower Abs'] },
    'ab crunch machine': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Lower Abs'] },
    'seated cable crunch': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Lower Abs'] },
    'kneeling cable crunch': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Lower Abs'] },
    'cable crunch': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Lower Abs'] },
    'reverse crunch on slant board': { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'hanging pikes / toes-to-bar': { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'hanging leg raise': { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    "captain's chair knee & leg raise": { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'captain chair leg raise': { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'ab wheel rollout': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs', 'Transverse Abdominis'], secondaryGroups: ['Back'], secondaryRegions: ['Lats'] },
    'dragon flag': { primaryGroup: 'Abdominals', primaryRegions: ['Lower Abs', 'Upper Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Transverse Abdominis'] },
    'pushup-position plank': { primaryGroup: 'Abdominals', primaryRegions: ['Transverse Abdominis'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'plank': { primaryGroup: 'Abdominals', primaryRegions: ['Transverse Abdominis'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'side plank': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Transverse Abdominis'] },
    'pallof press': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Transverse Abdominis'] },
    'cable woodchopper (high to low)': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Transverse Abdominis'] },
    'cable woodchopper (low to high)': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'russian twist': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'full contact barbell twist': { primaryGroup: 'Obliques', primaryRegions: ['External Obliques', 'Internal Obliques'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'ab vacuum': { primaryGroup: 'Abdominals', primaryRegions: ['Transverse Abdominis'], secondaryGroups: [], secondaryRegions: [] },
    'dead bug': { primaryGroup: 'Abdominals', primaryRegions: ['Transverse Abdominis', 'Lower Abs'], secondaryGroups: ['Abdominals'], secondaryRegions: ['Upper Abs'] },
    'bicycle crunches': { primaryGroup: 'Abdominals', primaryRegions: ['Upper Abs'], secondaryGroups: ['Obliques'], secondaryRegions: ['External Obliques'] },

    // ==========================================
    // FOREARMS & GRIP
    // ==========================================
    'barbell wrist curl': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'barbell reverse wrist curl': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Extensors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'seated barbell wrist curl (palms up - flexors)': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'seated barbell reverse wrist curl (palms down - extensors)': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Extensors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'dumbbell wrist curl': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'dumbbell reverse wrist curl': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Extensors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'behind-the-back barbell wrist curl': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: [], secondaryRegions: [] },
    'cable wrist curl': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: [], secondaryRegions: [] },
    'cable reverse wrist curl': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Extensors'], secondaryGroups: [], secondaryRegions: [] },
    'wrist roller / forearm roller device': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors', 'Forearm Extensors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'wrist roller': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors', 'Forearm Extensors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'reverse-grip barbell curl': { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis', 'Forearm Extensors'], secondaryGroups: ['Biceps'], secondaryRegions: ['Brachialis'] },
    'reverse-grip cable curl': { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis', 'Forearm Extensors'], secondaryGroups: ['Biceps'], secondaryRegions: ['Brachialis'] },
    'cable rope hammer curl': { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis'], secondaryGroups: ['Biceps'], secondaryRegions: ['Brachialis'] },
    'dead hang (grip & forearm strength hold)': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Back'], secondaryRegions: ['Lats'] },
    'dead hang': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Back'], secondaryRegions: ['Lats'] },
    "heavy farmer's walk / loaded carry": { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis', 'Forearm Flexors'], secondaryGroups: ['Back', 'Shoulders'], secondaryRegions: ['Trapezius', 'Front Deltoid'] },
    "heavy farmer's walk": { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis', 'Forearm Flexors'], secondaryGroups: ['Back', 'Shoulders'], secondaryRegions: ['Trapezius', 'Front Deltoid'] },
    "farmers walk": { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis', 'Forearm Flexors'], secondaryGroups: ['Back', 'Shoulders'], secondaryRegions: ['Trapezius', 'Front Deltoid'] },
    'plate pinch static holds': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Extensors'] },
    'plate pinch static hold': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Extensors'] },
    'plate pinch': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Extensors'] },
    'hand gripper squeeze (captains of crush)': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: [], secondaryRegions: [] },
    'captains of crush grippers': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: [], secondaryRegions: [] },
    'hand grippers': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: [], secondaryRegions: [] },
    'dumbbell radial & ulnar deviation': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Extensors', 'Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Brachioradialis'] },
    'dumbbell forearm pronation & supination': { primaryGroup: 'Forearms', primaryRegions: ['Brachioradialis', 'Forearm Flexors'], secondaryGroups: ['Forearms'], secondaryRegions: ['Forearm Extensors'] },
    'towel grip pull-ups (extreme grip challenge)': { primaryGroup: 'Forearms', primaryRegions: ['Forearm Flexors'], secondaryGroups: ['Back', 'Biceps'], secondaryRegions: ['Lats', 'Brachialis'] }
};

const ALL_VALID_REGIONS = new Set(Object.values(MUSCLE_HIERARCHY).flat());

/**
 * Normalizes group name aliases (e.g., 'Quads' -> 'Quadriceps', 'Abs' -> 'Abdominals')
 */
export const normalizeGroupName = (group) => {
    if (!group) return null;
    const g = group.trim();
    if (g === 'Quads' || g === 'Legs' || g === 'Thighs') return 'Quadriceps';
    if (g === 'Abs' || g === 'Core') return 'Abdominals';
    if (g === 'Hams' || g === 'Hamstring') return 'Hamstrings';
    if (g === 'Glute') return 'Glutes';
    if (g === 'Calf') return 'Calves';
    if (g === 'Shoulder' || g === 'Delts') return 'Shoulders';
    if (g === 'Bicep' || g === 'Arms') return 'Biceps';
    if (g === 'Tricep') return 'Triceps';
    if (g === 'Forearm' || g === 'Grip') return 'Forearms';
    if (g === 'Oblique') return 'Obliques';
    if (MUSCLE_HIERARCHY[g]) return g;
    return null;
};

/**
 * Safely infers muscle group and regions from exercise name keywords
 */
const inferMusclesFromKeywords = (name) => {
    const n = (name || '').toLowerCase();

    // 1. Quads
    if (n.includes('quad') || n.includes('squat') || n.includes('leg press') || n.includes('hack') || n.includes('lunge') || n.includes('split squat') || n.includes('leg ext') || n.includes('sissy') || n.includes('step up') || n.includes('step-up')) {
        return {
            primaryGroup: 'Quadriceps',
            primaryRegions: ['Rectus Femoris', 'Vastus Lateralis'],
            secondaryGroups: ['Glutes', 'Hamstrings'],
            secondaryRegions: ['Gluteus Maximus', 'Biceps Femoris']
        };
    }

    // 2. Hamstrings
    if (n.includes('hamstring') || n.includes('leg curl') || n.includes('rdl') || n.includes('romanian') || n.includes('stiff leg') || n.includes('stiff-leg') || n.includes('good morning') || n.includes('nordic') || n.includes('glute-ham')) {
        return {
            primaryGroup: 'Hamstrings',
            primaryRegions: ['Biceps Femoris', 'Semitendinosus'],
            secondaryGroups: ['Glutes', 'Back'],
            secondaryRegions: ['Gluteus Maximus', 'Lower Back']
        };
    }

    // 3. Glutes
    if (n.includes('glute') || n.includes('hip thrust') || n.includes('glute bridge') || n.includes('kickback') || n.includes('hip abduction') || n.includes('abductor') || n.includes('frog pump')) {
        return {
            primaryGroup: 'Glutes',
            primaryRegions: ['Gluteus Maximus', 'Gluteus Medius'],
            secondaryGroups: ['Hamstrings'],
            secondaryRegions: ['Biceps Femoris']
        };
    }

    // 4. Calves
    if (n.includes('calf') || n.includes('calves') || n.includes('gastrocnemius') || n.includes('soleus') || n.includes('tibialis') || n.includes('donkey')) {
        return {
            primaryGroup: 'Calves',
            primaryRegions: ['Gastrocnemius', 'Soleus'],
            secondaryGroups: [],
            secondaryRegions: []
        };
    }

    // 5. Forearms & Grip
    if (n.includes('wrist') || n.includes('forearm') || n.includes('farmer') || n.includes('grip') || n.includes('pinch') || n.includes('roller') || n.includes('dead hang')) {
        return {
            primaryGroup: 'Forearms',
            primaryRegions: ['Brachioradialis', 'Forearm Flexors'],
            secondaryGroups: [],
            secondaryRegions: []
        };
    }

    // 6. Abs & Core
    if (n.includes('crunch') || n.includes('plank') || n.includes('abs') || n.includes('ab ') || n.includes('situp') || n.includes('sit-up') || n.includes('dragon flag') || n.includes('leg raise') || n.includes('knee raise') || n.includes('rollout') || n.includes('vacuum') || n.includes('woodchopper') || n.includes('russian twist') || n.includes('pallof') || n.includes('oblique')) {
        return {
            primaryGroup: 'Abdominals',
            primaryRegions: ['Upper Abs', 'Lower Abs'],
            secondaryGroups: ['Obliques'],
            secondaryRegions: ['External Obliques']
        };
    }

    // 7. Biceps
    if (n.includes('bicep') || (n.includes('curl') && !n.includes('leg curl') && !n.includes('wrist curl') && !n.includes('hamstring'))) {
        return {
            primaryGroup: 'Biceps',
            primaryRegions: ['Biceps Long Head', 'Biceps Short Head'],
            secondaryGroups: ['Forearms'],
            secondaryRegions: ['Brachioradialis']
        };
    }

    // 8. Triceps
    if (n.includes('tricep') || n.includes('pushdown') || n.includes('skull crusher') || n.includes('french press') || n.includes('tate press') || n.includes('floor press')) {
        return {
            primaryGroup: 'Triceps',
            primaryRegions: ['Triceps Long Head', 'Triceps Lateral Head'],
            secondaryGroups: [],
            secondaryRegions: []
        };
    }

    // 9. Shoulders
    if (n.includes('shoulder') || n.includes('delt') || n.includes('overhead press') || n.includes('ohp') || n.includes('military press') || n.includes('lateral raise') || n.includes('front raise') || n.includes('rear delt') || n.includes('arnold')) {
        return {
            primaryGroup: 'Shoulders',
            primaryRegions: ['Front Deltoid', 'Side Deltoid'],
            secondaryGroups: ['Triceps'],
            secondaryRegions: ['Triceps Lateral Head']
        };
    }

    // 10. Chest
    if (n.includes('chest') || n.includes('bench') || n.includes('pec') || n.includes('pushup') || n.includes('push-up') || n.includes('dip') || n.includes('fly') || n.includes('flye')) {
        return {
            primaryGroup: 'Chest',
            primaryRegions: ['Mid Chest'],
            secondaryGroups: ['Triceps', 'Shoulders'],
            secondaryRegions: ['Triceps Lateral Head', 'Front Deltoid']
        };
    }

    // 11. Back
    if (n.includes('lat') || n.includes('row') || n.includes('pull-up') || n.includes('pullup') || n.includes('chin-up') || n.includes('chinup') || n.includes('deadlift') || n.includes('rack pull') || n.includes('shrug') || n.includes('pulldown') || n.includes('face pull') || n.includes('back')) {
        return {
            primaryGroup: 'Back',
            primaryRegions: ['Lats', 'Upper Back'],
            secondaryGroups: ['Biceps'],
            secondaryRegions: ['Biceps Short Head']
        };
    }

    return null;
};

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

    const rawName = (exercise.name || '').trim();
    const nameKey = rawName.toLowerCase();

    // 1. Direct exercise name exact match from EXERCISE_NAME_TARGETS
    if (EXERCISE_NAME_TARGETS[nameKey]) {
        const target = EXERCISE_NAME_TARGETS[nameKey];
        // If exercise has explicit user overrides with valid regions, merge them
        const hasExplicitValidRegions = Array.isArray(exercise.primaryRegions) &&
            exercise.primaryRegions.length > 0 &&
            exercise.primaryRegions.every(r => ALL_VALID_REGIONS.has(r));

        if (hasExplicitValidRegions) {
            return {
                primaryGroup: target.primaryGroup,
                primaryRegions: exercise.primaryRegions,
                secondaryGroups: Array.isArray(exercise.secondaryMuscleGroups) && exercise.secondaryMuscleGroups.length > 0 ? exercise.secondaryMuscleGroups : target.secondaryGroups,
                secondaryRegions: Array.isArray(exercise.secondaryRegions) && exercise.secondaryRegions.length > 0 ? exercise.secondaryRegions : target.secondaryRegions
            };
        }
        return target;
    }

    // 2. Keyword-based intelligent detection from exercise name
    const keywordMatch = inferMusclesFromKeywords(rawName);

    // 3. Resolve explicit or assigned group
    const explicitGroup = normalizeGroupName(exercise.primaryMuscleGroup) ||
        normalizeGroupName(exercise.muscleGroup) ||
        (keywordMatch ? keywordMatch.primaryGroup : null);

    const primaryGroup = explicitGroup || 'Quadriceps';

    // 4. Resolve Primary Regions
    let primaryRegions = [];
    if (Array.isArray(exercise.primaryRegions) && exercise.primaryRegions.length > 0) {
        primaryRegions = exercise.primaryRegions.flatMap(r => {
            if (ALL_VALID_REGIONS.has(r)) return [r];
            return GROUP_DEFAULT_REGIONS[r] || [];
        });
    } else if (exercise.primaryRegion && ALL_VALID_REGIONS.has(exercise.primaryRegion)) {
        primaryRegions = [exercise.primaryRegion];
    }

    if (primaryRegions.length === 0) {
        if (keywordMatch && keywordMatch.primaryGroup === primaryGroup) {
            primaryRegions = keywordMatch.primaryRegions;
        } else {
            primaryRegions = GROUP_DEFAULT_REGIONS[primaryGroup] || ['Rectus Femoris', 'Vastus Lateralis'];
        }
    }

    // 5. Resolve Secondary Groups & Regions
    let secondaryGroups = Array.isArray(exercise.secondaryMuscleGroups) && exercise.secondaryMuscleGroups.length > 0
        ? exercise.secondaryMuscleGroups.map(normalizeGroupName).filter(Boolean)
        : (keywordMatch ? keywordMatch.secondaryGroups : []);

    let secondaryRegions = [];
    if (Array.isArray(exercise.secondaryRegions) && exercise.secondaryRegions.length > 0) {
        secondaryRegions = exercise.secondaryRegions.flatMap(r => {
            if (ALL_VALID_REGIONS.has(r)) return [r];
            return GROUP_DEFAULT_REGIONS[r] || [];
        });
    } else if (keywordMatch && keywordMatch.primaryGroup === primaryGroup) {
        secondaryRegions = keywordMatch.secondaryRegions;
    }

    return {
        primaryGroup,
        primaryRegions,
        secondaryGroups,
        secondaryRegions
    };
};
