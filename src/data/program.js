export const DEFAULT_PROGRAM = [
  {
    day: 1,
    name: "Chest + Triceps",
    exercises: [
      { id: "bench_press", name: "Barbell Bench Press", sets: 4, reps: 6, startWeight: 60, type: "compound", muscleGroup: "Chest", progression: 2.5 },
      { id: "incline_db_press", name: "Incline Dumbbell Press", sets: 3, reps: 8, startWeight: 20, type: "accessory", muscleGroup: "Chest", progression: 2 },
      { id: "chest_fly", name: "Chest Fly (Machine/Cable)", sets: 3, reps: 12, startWeight: 15, type: "accessory", muscleGroup: "Chest", progression: 2.5 },
      { id: "dips_push_ups", name: "Dips or Push-Ups", sets: 3, reps: 0, startWeight: 0, type: "accessory", muscleGroup: "Chest", progression: 0 },
      { id: "tricep_pushdown", name: "Triceps Pushdown", sets: 3, reps: 10, startWeight: 25, type: "accessory", muscleGroup: "Triceps", progression: 2.5 },
      { id: "overhead_tricep_ext", name: "Overhead Dumbbell Triceps Extension", sets: 3, reps: 12, startWeight: 12, type: "accessory", muscleGroup: "Triceps", progression: 2.5 }
    ]
  },
  {
    day: 2,
    name: "Back + Biceps",
    exercises: [
      { id: "deadlift", name: "Deadlift", sets: 3, reps: 5, startWeight: 80, type: "compound", muscleGroup: "Back", progression: 5 },
      { id: "barbell_row", name: "Barbell Row", sets: 4, reps: 8, startWeight: 45, type: "accessory", muscleGroup: "Back", progression: 2.5 },
      { id: "lat_pulldown", name: "Lat Pulldown", sets: 3, reps: 10, startWeight: 45, type: "accessory", muscleGroup: "Back", progression: 5 },
      { id: "seated_cable_row", name: "Seated Cable Row", sets: 3, reps: 10, startWeight: 40, type: "accessory", muscleGroup: "Back", progression: 5 },
      { id: "barbell_curl", name: "Barbell Curl", sets: 3, reps: 8, startWeight: 20, type: "accessory", muscleGroup: "Biceps", progression: 2.5 },
      { id: "hammer_curl", name: "Hammer Curl", sets: 3, reps: 10, startWeight: 12.5, type: "accessory", muscleGroup: "Biceps", progression: 2 }
    ]
  },
  {
    day: 3,
    name: "Shoulders + Core",
    exercises: [
      { id: "ohp", name: "Overhead Press", sets: 4, reps: 6, startWeight: 27.5, type: "compound", muscleGroup: "Shoulders", progression: 2.5 },
      { id: "lateral_raises", name: "Lateral Raise", sets: 4, reps: 15, startWeight: 7.5, type: "accessory", muscleGroup: "Shoulders", progression: 1 },
      { id: "rear_delt_fly", name: "Rear Delt Fly", sets: 4, reps: 15, startWeight: 25, type: "accessory", muscleGroup: "Shoulders", progression: 5 },
      { id: "shrugs", name: "Shrugs", sets: 3, reps: 12, startWeight: 25, type: "accessory", muscleGroup: "Traps", progression: 10 },
      { id: "hanging_leg_raises", name: "Hanging Leg Raise", sets: 4, reps: 15, startWeight: 0, type: "accessory", muscleGroup: "Core", progression: 0 },
      { id: "machine_crunch", name: "Machine Crunches", sets: 3, reps: 15, startWeight: 20, type: "accessory", muscleGroup: "Core", progression: 5 },
      { id: "plank", name: "Plank", sets: 3, reps: 60, startWeight: 60, unit: "sec", type: "accessory", muscleGroup: "Core", progression: 0 },
    ]
  },
  {
    day: 4,
    name: "Legs + Forearms",
    exercises: [
      { id: "squat", name: "Barbell Squat", sets: 4, reps: 6, startWeight: 60, type: "compound", muscleGroup: "Legs", progression: 2.5 },
      { id: "hip_thrust", name: "Machine Hip Thrust", sets: 3, reps: 10, startWeight: 40, type: "compound", muscleGroup: "Glutes", progression: 5 },
      { id: "leg_press", name: "Leg Press", sets: 3, reps: 10, startWeight: 110, type: "accessory", muscleGroup: "Legs", progression: 10 },
      { id: "leg_curl", name: "Leg Curl", sets: 3, reps: 12, startWeight: 35, type: "accessory", muscleGroup: "Legs", progression: 5 },
      { id: "leg_extension", name: "Leg Extension", sets: 3, reps: 15, startWeight: 45, type: "accessory", muscleGroup: "Legs", progression: 5 },
      { id: "calf_raises", name: "Calf Raises", sets: 4, reps: 15, startWeight: 20, type: "accessory", muscleGroup: "Calves", progression: 5 },
      { id: "wrist_curl", name: "Wrist Curl", sets: 3, reps: 15, startWeight: 10, type: "accessory", muscleGroup: "Forearms", progression: 2.5 },
      { id: "reverse_wrist_curl", name: "Reverse Wrist Curl", sets: 3, reps: 15, startWeight: 10, type: "accessory", muscleGroup: "Forearms", progression: 2.5 }
    ]
  }
];

export const DEFAULT_TEMPLATE = {
  id: 'default',
  name: '4-Day Split Workout Plan (Hypertrophy Focus)',
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
