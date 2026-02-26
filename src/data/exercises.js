export const EXERCISE_DATABASE = [
    // CHEST
    { id: 'barbell_bench_press', name: 'Barbell Bench Press', muscleGroup: 'Chest', type: 'compound', defaultSets: 4, defaultReps: 6, defaultWeight: 60, progression: 2.5 },
    { id: 'incline_barbell_press', name: 'Incline Barbell Press', muscleGroup: 'Chest', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 40, progression: 2.5 },
    { id: 'decline_barbell_press', name: 'Decline Barbell Press', muscleGroup: 'Chest', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 40, progression: 2.5 },
    { id: 'dumbbell_bench_press', name: 'Dumbbell Bench Press', muscleGroup: 'Chest', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 20, progression: 2 },
    { id: 'incline_db_press', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', type: 'accessory', defaultSets: 3, defaultReps: 8, defaultWeight: 18, progression: 2 },
    { id: 'decline_db_press', name: 'Decline Dumbbell Press', muscleGroup: 'Chest', type: 'accessory', defaultSets: 3, defaultReps: 8, defaultWeight: 18, progression: 2 },
    { id: 'chest_press_machine', name: 'Chest Press Machine', muscleGroup: 'Chest', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 30, progression: 5 },
    { id: 'cable_chest_fly', name: 'Cable Chest Fly', muscleGroup: 'Chest', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 10, progression: 2.5 },
    { id: 'dumbbell_fly', name: 'Dumbbell Fly', muscleGroup: 'Chest', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 12, progression: 2 },
    { id: 'pec_deck', name: 'Pec Deck Machine', muscleGroup: 'Chest', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 30, progression: 5 },
    { id: 'push_ups', name: 'Push-ups', muscleGroup: 'Chest', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 0, progression: 0 },
    { id: 'dips_chest', name: 'Dips (Chest Focus)', muscleGroup: 'Chest', type: 'compound', defaultSets: 3, defaultReps: 10, defaultWeight: 0, progression: 0 },

    // BACK
    { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back', type: 'compound', defaultSets: 4, defaultReps: 5, defaultWeight: 60, progression: 5 },
    { id: 'sumo_deadlift', name: 'Sumo Deadlift', muscleGroup: 'Back', type: 'compound', defaultSets: 4, defaultReps: 5, defaultWeight: 60, progression: 5 },
    { id: 'barbell_row', name: 'Barbell Row', muscleGroup: 'Back', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 40, progression: 2.5 },
    { id: 'pendlay_row', name: 'Pendlay Row', muscleGroup: 'Back', type: 'compound', defaultSets: 3, defaultReps: 5, defaultWeight: 40, progression: 2.5 },
    { id: 'dumbbell_row', name: 'Dumbbell Row', muscleGroup: 'Back', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 20, progression: 2 },
    { id: 'lat_pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', type: 'accessory', defaultSets: 4, defaultReps: 8, defaultWeight: 45, progression: 5 },
    { id: 'close_grip_pulldown', name: 'Close Grip Lat Pulldown', muscleGroup: 'Back', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 40, progression: 5 },
    { id: 'seated_cable_row', name: 'Seated Cable Row', muscleGroup: 'Back', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 40, progression: 5 },
    { id: 'pull_ups', name: 'Pull-ups', muscleGroup: 'Back', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 0, progression: 0 },
    { id: 'chin_ups', name: 'Chin-ups', muscleGroup: 'Back', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 0, progression: 0 },
    { id: 't_bar_row', name: 'T-Bar Row', muscleGroup: 'Back', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 30, progression: 5 },
    { id: 'cable_pullover', name: 'Cable Pullover', muscleGroup: 'Back', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 20, progression: 2.5 },
    { id: 'machine_row', name: 'Machine Row', muscleGroup: 'Back', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 40, progression: 5 },

    // SHOULDERS
    { id: 'overhead_press', name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', type: 'compound', defaultSets: 4, defaultReps: 6, defaultWeight: 35, progression: 2.5 },
    { id: 'seated_db_press', name: 'Seated Dumbbell Press', muscleGroup: 'Shoulders', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 16, progression: 2 },
    { id: 'arnold_press', name: 'Arnold Press', muscleGroup: 'Shoulders', type: 'compound', defaultSets: 3, defaultReps: 10, defaultWeight: 14, progression: 2 },
    { id: 'lateral_raises', name: 'Lateral Raises', muscleGroup: 'Shoulders', type: 'accessory', defaultSets: 4, defaultReps: 12, defaultWeight: 8, progression: 1 },
    { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 5, progression: 1 },
    { id: 'front_raises', name: 'Front Raises', muscleGroup: 'Shoulders', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 8, progression: 1 },
    { id: 'rear_delt_fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 8, progression: 1 },
    { id: 'face_pulls', name: 'Face Pulls', muscleGroup: 'Shoulders', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 15, progression: 2.5 },
    { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 25, progression: 5 },
    { id: 'upright_row', name: 'Upright Row', muscleGroup: 'Shoulders', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 20, progression: 2.5 },

    // LEGS
    { id: 'barbell_squat', name: 'Barbell Squat', muscleGroup: 'Legs', type: 'compound', defaultSets: 4, defaultReps: 6, defaultWeight: 50, progression: 2.5 },
    { id: 'front_squat', name: 'Front Squat', muscleGroup: 'Legs', type: 'compound', defaultSets: 3, defaultReps: 6, defaultWeight: 40, progression: 2.5 },
    { id: 'goblet_squat', name: 'Goblet Squat', muscleGroup: 'Legs', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 20, progression: 2 },
    { id: 'leg_press', name: 'Leg Press', muscleGroup: 'Legs', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 110, progression: 10 },
    { id: 'hack_squat', name: 'Hack Squat', muscleGroup: 'Legs', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 60, progression: 5 },
    { id: 'romanian_deadlift', name: 'Romanian Deadlift', muscleGroup: 'Legs', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 50, progression: 5 },
    { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 14, progression: 2 },
    { id: 'walking_lunges', name: 'Walking Lunges', muscleGroup: 'Legs', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 14, progression: 2 },
    { id: 'leg_extension', name: 'Leg Extension', muscleGroup: 'Legs', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 55, progression: 5 },
    { id: 'hamstring_curl', name: 'Hamstring Curl', muscleGroup: 'Legs', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 40, progression: 5 },
    { id: 'leg_curl_seated', name: 'Seated Leg Curl', muscleGroup: 'Legs', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 35, progression: 5 },

    // GLUTES
    { id: 'hip_thrust', name: 'Hip Thrust', muscleGroup: 'Glutes', type: 'compound', defaultSets: 3, defaultReps: 10, defaultWeight: 60, progression: 5 },
    { id: 'glute_bridge', name: 'Glute Bridge', muscleGroup: 'Glutes', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 40, progression: 5 },
    { id: 'cable_kickback', name: 'Cable Kickback', muscleGroup: 'Glutes', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 10, progression: 2.5 },

    // CALVES
    { id: 'standing_calf_raise', name: 'Standing Calf Raise', muscleGroup: 'Calves', type: 'accessory', defaultSets: 4, defaultReps: 15, defaultWeight: 40, progression: 5 },
    { id: 'seated_calf_raise', name: 'Seated Calf Raise', muscleGroup: 'Calves', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 30, progression: 5 },
    { id: 'calf_press_leg_press', name: 'Calf Press (Leg Press)', muscleGroup: 'Calves', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 80, progression: 10 },

    // BICEPS
    { id: 'barbell_curl', name: 'Barbell Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 8, defaultWeight: 20, progression: 2.5 },
    { id: 'ez_bar_curl', name: 'EZ Bar Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 20, progression: 2.5 },
    { id: 'dumbbell_curl', name: 'Dumbbell Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 12, progression: 2 },
    { id: 'hammer_curl', name: 'Hammer Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 12, progression: 2 },
    { id: 'concentration_curl', name: 'Concentration Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 10, progression: 1 },
    { id: 'cable_curl', name: 'Cable Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 15, progression: 2.5 },
    { id: 'preacher_curl', name: 'Preacher Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 15, progression: 2.5 },
    { id: 'incline_db_curl', name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 10, progression: 1 },

    // TRICEPS
    { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscleGroup: 'Triceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 20, progression: 2.5 },
    { id: 'rope_pushdown', name: 'Rope Pushdown', muscleGroup: 'Triceps', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 15, progression: 2.5 },
    { id: 'overhead_tricep_ext', name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 15, progression: 2.5 },
    { id: 'skull_crushers', name: 'Skull Crushers', muscleGroup: 'Triceps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 20, progression: 2.5 },
    { id: 'close_grip_bench', name: 'Close Grip Bench Press', muscleGroup: 'Triceps', type: 'compound', defaultSets: 3, defaultReps: 8, defaultWeight: 40, progression: 2.5 },
    { id: 'dips_tricep', name: 'Dips (Tricep Focus)', muscleGroup: 'Triceps', type: 'compound', defaultSets: 3, defaultReps: 10, defaultWeight: 0, progression: 0 },
    { id: 'kickbacks', name: 'Tricep Kickbacks', muscleGroup: 'Triceps', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 8, progression: 1 },

    // TRAPS
    { id: 'barbell_shrugs', name: 'Barbell Shrugs', muscleGroup: 'Traps', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 60, progression: 10 },
    { id: 'dumbbell_shrugs', name: 'Dumbbell Shrugs', muscleGroup: 'Traps', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 20, progression: 2 },

    // CORE
    { id: 'hanging_leg_raise', name: 'Hanging Leg Raises', muscleGroup: 'Core', type: 'accessory', defaultSets: 3, defaultReps: 12, defaultWeight: 0, progression: 0 },
    { id: 'cable_crunch', name: 'Cable Crunch', muscleGroup: 'Core', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 25, progression: 2.5 },
    { id: 'ab_rollout', name: 'Ab Rollout', muscleGroup: 'Core', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 0, progression: 0 },
    { id: 'plank', name: 'Plank', muscleGroup: 'Core', type: 'accessory', defaultSets: 3, defaultReps: 60, defaultWeight: 0, progression: 0 },
    { id: 'russian_twist', name: 'Russian Twist', muscleGroup: 'Core', type: 'accessory', defaultSets: 3, defaultReps: 20, defaultWeight: 10, progression: 2 },
    { id: 'mountain_climbers', name: 'Mountain Climbers', muscleGroup: 'Core', type: 'accessory', defaultSets: 3, defaultReps: 20, defaultWeight: 0, progression: 0 },
    { id: 'decline_crunch', name: 'Decline Crunch', muscleGroup: 'Core', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 0, progression: 0 },

    // FOREARMS
    { id: 'wrist_curl', name: 'Wrist Curl', muscleGroup: 'Forearms', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 10, progression: 1 },
    { id: 'reverse_wrist_curl', name: 'Reverse Wrist Curl', muscleGroup: 'Forearms', type: 'accessory', defaultSets: 3, defaultReps: 15, defaultWeight: 8, progression: 1 },

    // FULL BODY / COMPOUND
    { id: 'farmers_walk', name: "Farmer's Walk", muscleGroup: 'Full Body', type: 'compound', defaultSets: 3, defaultReps: 1, defaultWeight: 40, progression: 5 },
    { id: 'clean_and_press', name: 'Clean and Press', muscleGroup: 'Full Body', type: 'compound', defaultSets: 3, defaultReps: 5, defaultWeight: 30, progression: 2.5 },
    { id: 'kettlebell_swing', name: 'Kettlebell Swing', muscleGroup: 'Full Body', type: 'compound', defaultSets: 3, defaultReps: 15, defaultWeight: 16, progression: 4 },
    { id: 'burpees', name: 'Burpees', muscleGroup: 'Full Body', type: 'accessory', defaultSets: 3, defaultReps: 10, defaultWeight: 0, progression: 0 },
    { id: 'battle_ropes', name: 'Battle Ropes', muscleGroup: 'Full Body', type: 'accessory', defaultSets: 3, defaultReps: 30, defaultWeight: 0, progression: 0 },
];
