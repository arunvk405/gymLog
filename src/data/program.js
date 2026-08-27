import { ALL_MUSCLE_GROUPS } from './muscles';

export const DEFAULT_PROGRAM = [
  {
    day: 1,
    name: "Chest + Triceps",
    exercises: [
      {
        id: "bench_press",
        name: "Barbell Bench Press",
        sets: 4,
        reps: 6,
        startWeight: 60,
        type: "compound",
        muscleGroup: "Chest",
        primaryMuscleGroup: "Chest",
        primaryRegions: ["Mid Chest"],
        secondaryMuscleGroups: ["Triceps", "Shoulders"],
        secondaryRegions: ["Triceps Lateral Head", "Front Deltoid"],
        progression: 2.5
      },
      {
        id: "incline_db_press",
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: 8,
        startWeight: 20,
        type: "accessory",
        muscleGroup: "Chest",
        primaryMuscleGroup: "Chest",
        primaryRegions: ["Upper Chest"],
        secondaryMuscleGroups: ["Shoulders", "Triceps"],
        secondaryRegions: ["Front Deltoid", "Triceps Lateral Head"],
        progression: 2
      },
      {
        id: "chest_fly",
        name: "Chest Fly (Machine/Cable)",
        sets: 3,
        reps: 12,
        startWeight: 15,
        type: "accessory",
        muscleGroup: "Chest",
        primaryMuscleGroup: "Chest",
        primaryRegions: ["Mid Chest"],
        secondaryMuscleGroups: ["Shoulders"],
        secondaryRegions: ["Front Deltoid"],
        progression: 2.5
      },
      {
        id: "decline_barbell_press",
        name: "Decline Barbell Press",
        sets: 3,
        reps: 8,
        startWeight: 30,
        type: "accessory",
        muscleGroup: "Chest",
        primaryMuscleGroup: "Chest",
        primaryRegions: ["Lower Chest"],
        secondaryMuscleGroups: ["Triceps"],
        secondaryRegions: ["Triceps Lateral Head"],
        progression: 2.5
      },
      {
        id: "tricep_pushdown",
        name: "Triceps Pushdown",
        sets: 3,
        reps: 10,
        startWeight: 25,
        type: "accessory",
        muscleGroup: "Triceps",
        primaryMuscleGroup: "Triceps",
        primaryRegions: ["Triceps Lateral Head", "Triceps Medial Head"],
        secondaryMuscleGroups: ["Triceps"],
        secondaryRegions: ["Triceps Long Head"],
        progression: 2.5
      },
      {
        id: "overhead_tricep_ext",
        name: "Overhead Dumbbell Triceps Extension",
        sets: 3,
        reps: 12,
        startWeight: 12,
        type: "accessory",
        muscleGroup: "Triceps",
        primaryMuscleGroup: "Triceps",
        primaryRegions: ["Triceps Long Head"],
        secondaryMuscleGroups: ["Triceps"],
        secondaryRegions: ["Triceps Lateral Head"],
        progression: 2.5
      }
    ]
  },
  {
    day: 2,
    name: "Back + Biceps",
    exercises: [
      {
        id: "deadlift",
        name: "Deadlift",
        sets: 3,
        reps: 5,
        startWeight: 80,
        type: "compound",
        muscleGroup: "Back",
        primaryMuscleGroup: "Back",
        primaryRegions: ["Lower Back"],
        secondaryMuscleGroups: ["Glutes", "Hamstrings"],
        secondaryRegions: ["Gluteus Maximus", "Biceps Femoris"],
        progression: 5
      },
      {
        id: "barbell_row",
        name: "Barbell Row",
        sets: 4,
        reps: 8,
        startWeight: 45,
        type: "accessory",
        muscleGroup: "Back",
        primaryMuscleGroup: "Back",
        primaryRegions: ["Mid Back"],
        secondaryMuscleGroups: ["Back", "Biceps"],
        secondaryRegions: ["Lats", "Brachialis"],
        progression: 2.5
      },
      {
        id: "lat_pulldown",
        name: "Lat Pulldown",
        sets: 3,
        reps: 10,
        startWeight: 45,
        type: "accessory",
        muscleGroup: "Back",
        primaryMuscleGroup: "Back",
        primaryRegions: ["Lats"],
        secondaryMuscleGroups: ["Back", "Biceps"],
        secondaryRegions: ["Rhomboids", "Biceps Short Head"],
        progression: 5
      },
      {
        id: "seated_cable_row",
        name: "Seated Cable Row",
        sets: 3,
        reps: 10,
        startWeight: 40,
        type: "accessory",
        muscleGroup: "Back",
        primaryMuscleGroup: "Back",
        primaryRegions: ["Mid Back"],
        secondaryMuscleGroups: ["Back", "Biceps"],
        secondaryRegions: ["Rhomboids", "Brachialis"],
        progression: 5
      },
      {
        id: "barbell_curl",
        name: "Barbell Curl",
        sets: 3,
        reps: 8,
        startWeight: 20,
        type: "accessory",
        muscleGroup: "Biceps",
        primaryMuscleGroup: "Biceps",
        primaryRegions: ["Biceps Long Head", "Biceps Short Head"],
        secondaryMuscleGroups: ["Forearms"],
        secondaryRegions: ["Brachioradialis"],
        progression: 2.5
      },
      {
        id: "hammer_curl",
        name: "Hammer Curl",
        sets: 3,
        reps: 10,
        startWeight: 12.5,
        type: "accessory",
        muscleGroup: "Biceps",
        primaryMuscleGroup: "Biceps",
        primaryRegions: ["Brachialis"],
        secondaryMuscleGroups: ["Forearms"],
        secondaryRegions: ["Brachioradialis"],
        progression: 2
      }
    ]
  },
  {
    day: 3,
    name: "Shoulders + Core",
    exercises: [
      {
        id: "ohp",
        name: "Overhead Press",
        sets: 4,
        reps: 6,
        startWeight: 27.5,
        type: "compound",
        muscleGroup: "Shoulders",
        primaryMuscleGroup: "Shoulders",
        primaryRegions: ["Front Deltoid"],
        secondaryMuscleGroups: ["Shoulders", "Triceps"],
        secondaryRegions: ["Side Deltoid", "Triceps Lateral Head"],
        progression: 2.5
      },
      {
        id: "lateral_raises",
        name: "Lateral Raise",
        sets: 4,
        reps: 15,
        startWeight: 7.5,
        type: "accessory",
        muscleGroup: "Shoulders",
        primaryMuscleGroup: "Shoulders",
        primaryRegions: ["Side Deltoid"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 1
      },
      {
        id: "rear_delt_fly",
        name: "Rear Delt Fly",
        sets: 4,
        reps: 15,
        startWeight: 25,
        type: "accessory",
        muscleGroup: "Shoulders",
        primaryMuscleGroup: "Shoulders",
        primaryRegions: ["Rear Deltoid"],
        secondaryMuscleGroups: ["Back"],
        secondaryRegions: ["Trapezius", "Rhomboids"],
        progression: 5
      },
      {
        id: "shrugs",
        name: "Shrugs",
        sets: 3,
        reps: 12,
        startWeight: 25,
        type: "accessory",
        muscleGroup: "Back",
        primaryMuscleGroup: "Back",
        primaryRegions: ["Trapezius"],
        secondaryMuscleGroups: ["Back"],
        secondaryRegions: ["Upper Back"],
        progression: 10
      },
      {
        id: "hanging_leg_raises",
        name: "Hanging Leg Raise",
        sets: 4,
        reps: 15,
        startWeight: 0,
        type: "accessory",
        muscleGroup: "Abdominals",
        primaryMuscleGroup: "Abdominals",
        primaryRegions: ["Lower Abs"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 0
      },
      {
        id: "machine_crunch",
        name: "Machine Crunches",
        sets: 3,
        reps: 15,
        startWeight: 20,
        type: "accessory",
        muscleGroup: "Abdominals",
        primaryMuscleGroup: "Abdominals",
        primaryRegions: ["Upper Abs"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 5
      },
      {
        id: "plank",
        name: "Plank",
        sets: 3,
        reps: 60,
        startWeight: 60,
        unit: "sec",
        type: "accessory",
        muscleGroup: "Abdominals",
        primaryMuscleGroup: "Abdominals",
        primaryRegions: ["Transverse Abdominis"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 0
      }
    ]
  },
  {
    day: 4,
    name: "Legs + Forearms",
    exercises: [
      {
        id: "squat",
        name: "Barbell Squat",
        sets: 4,
        reps: 6,
        startWeight: 60,
        type: "compound",
        muscleGroup: "Quadriceps",
        primaryMuscleGroup: "Quadriceps",
        primaryRegions: ["Rectus Femoris", "Vastus Lateralis"],
        secondaryMuscleGroups: ["Glutes", "Hamstrings"],
        secondaryRegions: ["Gluteus Maximus", "Biceps Femoris"],
        progression: 2.5
      },
      {
        id: "hip_thrust",
        name: "Machine Hip Thrust",
        sets: 3,
        reps: 10,
        startWeight: 40,
        type: "compound",
        muscleGroup: "Glutes",
        primaryMuscleGroup: "Glutes",
        primaryRegions: ["Gluteus Maximus"],
        secondaryMuscleGroups: ["Hamstrings"],
        secondaryRegions: ["Biceps Femoris"],
        progression: 5
      },
      {
        id: "leg_press",
        name: "Leg Press",
        sets: 3,
        reps: 10,
        startWeight: 110,
        type: "accessory",
        muscleGroup: "Quadriceps",
        primaryMuscleGroup: "Quadriceps",
        primaryRegions: ["Vastus Lateralis", "Vastus Medialis"],
        secondaryMuscleGroups: ["Glutes"],
        secondaryRegions: ["Gluteus Maximus"],
        progression: 10
      },
      {
        id: "leg_curl",
        name: "Leg Curl",
        sets: 3,
        reps: 12,
        startWeight: 35,
        type: "accessory",
        muscleGroup: "Hamstrings",
        primaryMuscleGroup: "Hamstrings",
        primaryRegions: ["Biceps Femoris", "Semitendinosus"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 5
      },
      {
        id: "leg_extension",
        name: "Leg Extension",
        sets: 3,
        reps: 15,
        startWeight: 45,
        type: "accessory",
        muscleGroup: "Quadriceps",
        primaryMuscleGroup: "Quadriceps",
        primaryRegions: ["Vastus Medialis", "Rectus Femoris"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 5
      },
      {
        id: "calf_raises",
        name: "Calf Raises",
        sets: 4,
        reps: 15,
        startWeight: 20,
        type: "accessory",
        muscleGroup: "Calves",
        primaryMuscleGroup: "Calves",
        primaryRegions: ["Gastrocnemius"],
        secondaryMuscleGroups: ["Calves"],
        secondaryRegions: ["Soleus"],
        progression: 5
      },
      {
        id: "wrist_curl",
        name: "Wrist Curl",
        sets: 3,
        reps: 15,
        startWeight: 10,
        type: "accessory",
        muscleGroup: "Forearms",
        primaryMuscleGroup: "Forearms",
        primaryRegions: ["Forearm Flexors"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 2.5
      },
      {
        id: "reverse_wrist_curl",
        name: "Reverse Wrist Curl",
        sets: 3,
        reps: 15,
        startWeight: 10,
        type: "accessory",
        muscleGroup: "Forearms",
        primaryMuscleGroup: "Forearms",
        primaryRegions: ["Forearm Extensors"],
        secondaryMuscleGroups: [],
        secondaryRegions: [],
        progression: 2.5
      }
    ]
  }
];

export const DEFAULT_TEMPLATE = {
  id: 'default',
  name: '4-Day Split Workout Plan (Hypertrophy Focus)',
  isDefault: true,
  days: DEFAULT_PROGRAM
};

export const MUSCLE_GROUPS = ALL_MUSCLE_GROUPS;

export const TARGETS = {
  squat: { target: 90, label: "90kg Squat" },
  deadlift: { target: 120, label: "120kg Deadlift" },
  bench_press: { target: 80, label: "80kg Bench" }
};

export const STRENGTH_LEVELS = {
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
