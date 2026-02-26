import { db, auth, storage } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const saveWorkout = async (workout, uid, workoutDate) => {
    if (!uid) throw new Error("User not authenticated");

    const sessionDate = workoutDate ? new Date(workoutDate + 'T12:00:00') : new Date();

    const workoutData = {
        ...workout,
        userId: uid,
        timestamp: sessionDate.getTime(),
        date: sessionDate.toISOString(),
        app_version: 'gymlog_v1'
    };

    try {
        console.log("Saving to new GymLog project...", workoutData);
        const docRef = await addDoc(collection(db, 'workouts'), workoutData);
        console.log("Workout saved! ID:", docRef.id);
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
};

export const fetchHistory = async (uid) => {
    if (!uid) return [];
    try {
        console.log(`Searching for workouts where userId == ${uid}...`);
        const q = query(
            collection(db, 'workouts'),
            where('userId', '==', uid)
        );
        const querySnapshot = await getDocs(q);
        const history = [];
        console.log(`Found ${querySnapshot.size} total documents in 'workouts' for this user.`);

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
        console.log("Final processed history:", sorted);
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
        isNewUser: true
    };
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
        console.log("Template saved successfully:", templateId);
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
        console.log(`Deleting template: ${id} (DocPath: ${targetId})`);
        await deleteDoc(doc(db, 'templates', targetId));
        console.log("Template deleted successfully from Firestore");
    } catch (e) {
        console.error("Firestore Delete Template Error:", e);
        throw e;
    }
};

// ========== EXERCISE DATABASE ==========

export const seedExercises = async (exercises) => {
    try {
        const batch = [];
        for (const ex of exercises) {
            batch.push(setDoc(doc(db, 'exercises', ex.id), ex));
        }
        await Promise.all(batch);
        console.log(`Seeded ${exercises.length} exercises to Firestore`);
        return true;
    } catch (e) {
        console.error("Seed exercises error:", e);
        throw e;
    }
};

// In-memory cache so we don't fetch on every render
let exerciseCache = null;

export const fetchExercises = async () => {
    if (exerciseCache) return exerciseCache;
    try {
        const snap = await getDocs(collection(db, 'exercises'));
        const exercises = [];
        snap.forEach(d => exercises.push(d.data()));
        if (exercises.length > 0) {
            exerciseCache = exercises.sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup) || a.name.localeCompare(b.name));
            return exerciseCache;
        }
    } catch (e) {
        console.error("Fetch exercises error:", e);
    }
    return null; // null means "not seeded yet"
};
