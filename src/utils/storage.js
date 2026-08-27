import { db, auth, storage } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { EXERCISE_DATABASE } from '../data/exercises';

export const saveWorkout = async (workout, uid, workoutDate) => {
    if (!uid) throw new Error("User not authenticated");

    const sessionDate = workoutDate ? new Date(workoutDate + 'T12:00:00') : new Date();

    const workoutData = {
        ...workout,
        userId: uid,
        timestamp: sessionDate.getTime(),
        date: sessionDate.toISOString(),
        app_version: 'bulkbro_v1'
    };

    try {
        const docRef = await addDoc(collection(db, 'workouts'), workoutData);
        return docRef.id;
    } catch (e) {
        console.error("Firestore Save Error:", e);
        throw e;
    }
};

export const updateWorkout = async (workoutId, data) => {
    if (!workoutId) throw new Error("No workout ID");
    try {
        await setDoc(doc(db, 'workouts', workoutId), data, { merge: true });
    } catch (e) {
        console.error("Update workout error:", e);
        throw e;
    }
}; export const deleteWorkout = async (workoutId) => {
    if (!workoutId) throw new Error("No workout ID");
    try {
        await deleteDoc(doc(db, 'workouts', workoutId));
    } catch (e) {
        console.error("Delete workout error:", e);
        throw e;
    }
};

export const fetchHistory = async (uid) => {
    if (!uid) return [];
    try {
        const q = query(
            collection(db, 'workouts'),
            where('userId', '==', uid)
        );
        const querySnapshot = await getDocs(q);
        const history = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Include Firestore document ID for React keys
            const session = {
                id: doc.id,
                ...data
            };

            if (session.date && typeof session.date.toDate === 'function') {
                session.date = session.date.toDate().toISOString();
            }
            history.push(session);
        });

        const sorted = history.sort((a, b) => new Date(b.date) - new Date(a.date));

        return sorted;
    } catch (e) {
        console.error("Firebase fetchHistory error:", e);
        return [];
    }
};

export const saveProfile = async (profile, uid) => {
    if (!uid) return;
    try {
        await setDoc(doc(db, 'profiles', uid), {
            ...profile,
            updatedAt: new Date().toISOString()
        });
    } catch (e) {
        console.error("Profile Save Error:", e);
    }
};

export const fetchProfile = async (uid) => {
    if (!uid) return null;
    try {
        const docRef = doc(db, 'profiles', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
    } catch (e) {
        console.error("Profile Fetch Error:", e);
    }
    return {
        bodyweight: 75,
        height: 175,
        age: 25,
        gender: 'male',
        activityLevel: 'moderate',
        photoURL: null,
        bodyfat: 15,
        isNewUser: true
    };
};

export const logWeightHistory = async (uid, weight, bodyfat) => {
    if (!uid) return;
    try {
        const timestamp = new Date().getTime();
        const date = new Date().toISOString();
        await addDoc(collection(db, 'weight_history'), {
            userId: uid,
            weight: parseFloat(weight),
            bodyfat: parseFloat(bodyfat) || 0,
            timestamp,
            date
        });

        // Also update current bodyweight in profile for convenience
        const profileRef = doc(db, 'profiles', uid);
        await setDoc(profileRef, {
            bodyweight: parseFloat(weight),
            bodyfat: parseFloat(bodyfat) || 15
        }, { merge: true });

    } catch (e) {
        console.error("Weight Log Error:", e);
        throw e;
    }
};

export const fetchWeightHistory = async (uid) => {
    if (!uid) return [];
    try {
        const q = query(
            collection(db, 'weight_history'),
            where('userId', '==', uid)
        );
        const snap = await getDocs(q);
        const history = [];
        snap.forEach(d => history.push({ id: d.id, ...d.data() }));
        return history.sort((a, b) => a.timestamp - b.timestamp);
    } catch (e) {
        console.error("Fetch weight history error:", e);
        return [];
    }
};

export const uploadProfilePhoto = async (file, uid) => {
    if (!file || !uid) return null;
    const storageRef = ref(storage, `profiles/${uid}/${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};

// ========== TEMPLATE MANAGEMENT ==========

export const saveTemplate = async (template, uid) => {
    if (!uid) throw new Error("User not authenticated");

    // Create a clean copy without internal metadata like _docId
    const cleanTemplate = { ...template };
    Object.keys(cleanTemplate).forEach(key => {
        if (key.startsWith('_')) delete cleanTemplate[key];
    });

    const templateId = cleanTemplate.id || `template_${Date.now()}`;
    const docId = `${uid}_${templateId}`;

    try {
        await setDoc(doc(db, 'templates', docId), {
            ...cleanTemplate,
            id: templateId,
            userId: uid,
            updatedAt: new Date().toISOString()
        });
        return templateId;
    } catch (e) {
        console.error("Firestore Save Template Error:", e);
        throw e;
    }
};

export const fetchTemplates = async (uid) => {
    if (!uid) return [];
    try {
        const q = query(collection(db, 'templates'), where('userId', '==', uid));
        const snap = await getDocs(q);
        const templates = [];
        snap.forEach(d => {
            const data = d.data();
            templates.push({
                ...data,
                id: data.id || d.id,
                _docId: d.id // Real Firestore doc key
            });
        });
        return templates;
    } catch (e) {
        console.error("Fetch templates error:", e);
        return [];
    }
};

export const deleteTemplate = async (id, uid, docId) => {
    if (!uid || !id) return;
    try {
        // If we have the exact docId from fetchTemplates, use it.
        // Otherwise try the standard prefixed naming.
        const targetId = docId || `${uid}_${id}`;
        await deleteDoc(doc(db, 'templates', targetId));
    } catch (e) {
        console.error("Firestore Delete Template Error:", e);
        throw e;
    }
};

// ========== EXERCISE DATABASE ==========

const LOCAL_EXERCISES_KEY = 'bulkbro_exercise_db';
let exerciseCache = null;

export const ADMIN_EMAIL = 'arunvk405@gmail.com';

export const canEditExercise = (exercise, user) => {
    if (!exercise) return false;
    const userEmail = user?.email?.toLowerCase() || '';
    const isAdmin = userEmail === ADMIN_EMAIL;
    if (isAdmin) return true;

    // Custom exercises created by current user or local custom exercises
    if (exercise.isCustom || exercise.createdBy || exercise.createdByEmail) {
        if (exercise.createdBy && user?.uid && exercise.createdBy === user.uid) return true;
        if (exercise.createdByEmail && userEmail && exercise.createdByEmail.toLowerCase() === userEmail) return true;
        if (exercise.isCustom && !exercise.createdBy && !exercise.createdByEmail) return true;
    }

    return false;
};

export const seedExercises = async (exercises) => {
    try {
        const batch = [];
        for (const ex of exercises) {
            batch.push(setDoc(doc(db, 'exercises', ex.id), ex));
        }
        await Promise.all(batch);
        return true;
    } catch (e) {
        console.error("Seed exercises error:", e);
        throw e;
    }
};

export const fetchExercises = async () => {
    try {
        let localList = [];
        const localStored = localStorage.getItem(LOCAL_EXERCISES_KEY);
        if (localStored) {
            try {
                const parsed = JSON.parse(localStored);
                if (Array.isArray(parsed)) {
                    localList = parsed;
                }
            } catch (e) {
                console.error("Error parsing local exercises:", e);
            }
        }

        let remoteList = [];
        try {
            const snap = await getDocs(collection(db, 'exercises'));
            snap.forEach(d => remoteList.push(d.data()));
        } catch (e) {
            // Silent fallback if offline or no Firestore rules
        }

        const exerciseMap = new Map();

        // 1. Add all built-in defaults from EXERCISE_DATABASE
        EXERCISE_DATABASE.forEach(ex => {
            exerciseMap.set(String(ex.id), ex);
        });

        // 2. Overlay remote Firestore exercises
        remoteList.forEach(ex => {
            if (ex && ex.id) {
                const existing = exerciseMap.get(String(ex.id)) || {};
                exerciseMap.set(String(ex.id), { ...existing, ...ex });
            }
        });

        // 3. Overlay local storage exercises / user edits
        localList.forEach(ex => {
            if (ex && ex.id) {
                const existing = exerciseMap.get(String(ex.id)) || {};
                exerciseMap.set(String(ex.id), { ...existing, ...ex });
            }
        });

        const merged = Array.from(exerciseMap.values());
        exerciseCache = merged;
        localStorage.setItem(LOCAL_EXERCISES_KEY, JSON.stringify(merged));
        return exerciseCache;
    } catch (err) {
        console.error("Fetch exercises overall error:", err);
        exerciseCache = EXERCISE_DATABASE;
        return EXERCISE_DATABASE;
    }
};

export const saveExerciseToStorage = async (exercise, uid) => {
    try {
        const currentDb = await fetchExercises();
        const updated = [...currentDb];
        const existingIdx = updated.findIndex(e => e.id === exercise.id);

        if (existingIdx >= 0) {
            updated[existingIdx] = { ...updated[existingIdx], ...exercise };
        } else {
            updated.push(exercise);
        }

        exerciseCache = updated;
        localStorage.setItem(LOCAL_EXERCISES_KEY, JSON.stringify(updated));

        if (uid) {
            try {
                await setDoc(doc(db, 'exercises', exercise.id), {
                    ...exercise,
                    userId: uid,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } catch (e) {
                console.warn("Firestore exercise save fallback:", e);
            }
        }
        return updated;
    } catch (e) {
        console.error("Error in saveExerciseToStorage:", e);
        throw e;
    }
};

export const deleteExerciseFromStorage = async (exerciseId, uid) => {
    try {
        const currentDb = await fetchExercises();
        const updated = currentDb.filter(e => String(e.id) !== String(exerciseId));

        exerciseCache = updated;
        localStorage.setItem(LOCAL_EXERCISES_KEY, JSON.stringify(updated));

        if (uid) {
            try {
                await deleteDoc(doc(db, 'exercises', String(exerciseId)));
            } catch (e) {
                console.warn("Firestore delete exercise fallback:", e);
            }
        }
        return updated;
    } catch (e) {
        console.error("Error in deleteExerciseFromStorage:", e);
        throw e;
    }
};

export const resetExercisesToDefaultStorage = async (uid) => {
    try {
        localStorage.removeItem(LOCAL_EXERCISES_KEY);
        exerciseCache = EXERCISE_DATABASE;
        return EXERCISE_DATABASE;
    } catch (e) {
        console.error("Reset exercises error:", e);
        return EXERCISE_DATABASE;
    }
};
