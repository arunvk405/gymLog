import { db, auth, storage } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const saveWorkout = async (workout, uid) => {
    if (!uid) throw new Error("User not authenticated");

    const workoutData = {
        ...workout,
        userId: uid,
        timestamp: new Date().getTime(),
        date: new Date().toISOString(),
        // Since this is a new project, we don't strictly need a version tag to avoid conflicts,
        // but it's good practice for future schema changes.
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
