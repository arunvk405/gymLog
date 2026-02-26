export const DEFAULT_PROGRAM = [
  {
    day: 1,
    name: "Chest & Triceps",
    exercises: [
      { id: "bench_press", name: "Barbell Bench Press", sets: 4, reps: 6, startWeight: 60, type: "compound", muscleGroup: "Chest", progression: 2.5 },
      { id: "incline_db_press", name: "Incline DB Press", sets: 3, reps: 8, startWeight: 18, type: "accessory", muscleGroup: "Chest", progression: 2 },
      { id: "chest_press", name: "Chest Press Machine", sets: 3, reps: 10, startWeight: 30, type: "accessory", muscleGroup: "Chest", progression: 5 },
      { id: "tricep_pushdown", name: "Tricep Pushdown", sets: 3, reps: 10, startWeight: 20, type: "accessory", muscleGroup: "Triceps", progression: 2.5 },
      { id: "overhead_tricep_ext", name: "Overhead Tricep Extension", sets: 3, reps: 10, startWeight: 15, type: "accessory", muscleGroup: "Triceps", progression: 2.5 }
    ]
  },
  {
    day: 2,
    name: "Back & Biceps",
    exercises: [
      { id: "deadlift", name: "Deadlift", sets: 4, reps: 5, startWeight: 60, type: "compound", muscleGroup: "Back", progression: 5 },
      { id: "lat_pulldown", name: "Lat Pulldown", sets: 4, reps: 8, startWeight: 45, type: "accessory", muscleGroup: "Back", progression: 5 },
      { id: "barbell_row", name: "Barbell Row", sets: 3, reps: 8, startWeight: 40, type: "accessory", muscleGroup: "Back", progression: 2.5 },
      { id: "seated_cable_row", name: "Seated Cable Row", sets: 3, reps: 10, startWeight: 40, type: "accessory", muscleGroup: "Back", progression: 5 },
      { id: "barbell_curl", name: "Barbell Curl", sets: 3, reps: 8, startWeight: 20, type: "accessory", muscleGroup: "Biceps", progression: 2.5 },
      { id: "hammer_curl", name: "Hammer Curl", sets: 3, reps: 10, startWeight: 12, type: "accessory", muscleGroup: "Biceps", progression: 2 }
    ]
  },
  {
    day: 3,
    name: "Legs (Strength Focus)",
    exercises: [
      { id: "squat", name: "Barbell Squat", sets: 4, reps: 6, startWeight: 50, type: "compound", muscleGroup: "Legs", progression: 2.5 },
      { id: "leg_press", name: "Leg Press", sets: 3, reps: 10, startWeight: 110, type: "accessory", muscleGroup: "Legs", progression: 10 },
      { id: "rdl", name: "Romanian Deadlift", sets: 3, reps: 8, startWeight: 50, type: "accessory", muscleGroup: "Legs", progression: 5 },
      { id: "leg_extension", name: "Leg Extension", sets: 3, reps: 12, startWeight: 55, type: "accessory", muscleGroup: "Legs", progression: 5 },
      { id: "hamstring_curl", name: "Hamstring Curl", sets: 3, reps: 12, startWeight: 40, type: "accessory", muscleGroup: "Legs", progression: 5 },
      { id: "calf_raises", name: "Calf Raises", sets: 4, reps: 15, startWeight: 40, type: "accessory", muscleGroup: "Legs", progression: 5 }
    ]
  },
  {
    day: 4,
    name: "Shoulders & Core",
    exercises: [
      { id: "ohp", name: "Overhead Barbell Press", sets: 4, reps: 6, startWeight: 35, type: "compound", muscleGroup: "Shoulders", progression: 2.5 },
      { id: "lateral_raises", name: "Lateral Raises", sets: 4, reps: 12, startWeight: 8, type: "accessory", muscleGroup: "Shoulders", progression: 1 },
      { id: "rear_delt_fly", name: "Rear Delt Fly", sets: 3, reps: 12, startWeight: 30, type: "accessory", muscleGroup: "Shoulders", progression: 5 },
      { id: "shrugs", name: "Shrugs", sets: 3, reps: 10, startWeight: 60, type: "accessory", muscleGroup: "Traps", progression: 10 },
      { id: "hanging_leg_raises", name: "Hanging Leg Raises", sets: 3, reps: 12, startWeight: 0, type: "accessory", muscleGroup: "Core", progression: 0 },
      { id: "plank", name: "Plank", sets: 3, reps: 1, startWeight: 60, unit: "sec", type: "accessory", muscleGroup: "Core", progression: 0 }
    ]
  },
  {
    day: 5,
    name: "Full Body Progression",
    exercises: [
      { id: "squat_d5", name: "Barbell Squat", sets: 3, reps: 5, startWeight: 50, type: "compound", muscleGroup: "Legs", progression: 2.5, syncWith: "squat" },
      { id: "bench_press_d5", name: "Barbell Bench Press", sets: 3, reps: 5, startWeight: 60, type: "compound", muscleGroup: "Chest", progression: 2.5, syncWith: "bench_press" },
      { id: "deadlift_d5", name: "Deadlift", sets: 3, reps: 3, startWeight: 60, type: "compound", muscleGroup: "Back", progression: 5, syncWith: "deadlift" },
      { id: "pull_ups", name: "Pull-ups", sets: 3, reps: 8, startWeight: 0, type: "accessory", muscleGroup: "Back", progression: 0 },
      { id: "farmers_walk", name: "Farmer's Walk", sets: 3, reps: 1, startWeight: 40, unit: "rounds", type: "accessory", muscleGroup: "Full Body", progression: 5 }
    ]
  }
];

export const DEFAULT_TEMPLATE = {
  id: 'default',
  name: '5-Day Strength & Hypertrophy',
  isDefault: true,
  days: DEFAULT_PROGRAM
};

export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core', 'Traps', 'Full Body', 'Forearms', 'Glutes', 'Calves'
];


export const TARGETS = {
  squat: { target: 90, label: "90kg Squat" },
  deadlift: { target: 120, label: "120kg Deadlift" },
  bench_press: { target: 80, label: "80kg Bench" }
};

export const STRENGTH_LEVELS = {
  // Squat / Bodyweight
  SQUAT: {
    Beginner: 0.75,
    Novice: 1.0,
    Intermediate: 1.5,
    Advanced: 2.0
  },
  BENCH: {
    Beginner: 0.5,
    Novice: 0.75,
    Intermediate: 1.1,
    Advanced: 1.5
  },
  DEADLIFT: {
    Beginner: 1.0,
    Novice: 1.25,
    Intermediate: 1.8,
    Advanced: 2.5
  }
};
