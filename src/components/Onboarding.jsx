import React, { useState } from 'react';
import { saveProfile } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Activity, ChevronRight, Loader2 } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        displayName: user.displayName || '',
        bodyweight: 75,
        height: 175,
        age: 25,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'muscle_gain',
        photoURL: user.photoURL || null
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalProfile = { ...profile, isNewUser: false };
            await saveProfile(finalProfile, user.uid);
            onComplete(finalProfile);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '2rem 1rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--text-primary)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
                    <Activity size={35} />
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Create Your Profile</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tailor your experience based on your body and goals.</p>
            </div>

            <form onSubmit={handleSave} style={{ width: '100%', maxWidth: '400px' }}>
                <div className="panel" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Your Name"
                            value={profile.displayName}
                            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                            style={{ padding: '0.8rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Weight (kg)</label>
                            <input
                                type="number"
                                required
                                value={profile.bodyweight}
                                onChange={(e) => setProfile({ ...profile, bodyweight: parseFloat(e.target.value) })}
                                style={{ padding: '0.8rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Height (cm)</label>
                            <input
                                type="number"
                                required
                                value={profile.height}
                                onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                                style={{ padding: '0.8rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Age</label>
                            <input
                                type="number"
                                required
                                value={profile.age}
                                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                                style={{ padding: '0.8rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Gender</label>
                            <select
                                value={profile.gender}
                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                style={{ padding: '0.8rem' }}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Fitness Goal</label>
                        <select
                            value={profile.goal}
                            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                            style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}
                        >
                            <option value="muscle_gain">Build Muscle</option>
                            <option value="fat_loss">Fat Loss</option>
                            <option value="strength">Increase Strength</option>
                            <option value="endurance">Endurance</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Activity Level</label>
                        <select
                            value={profile.activityLevel}
                            onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                            style={{ padding: '0.8rem' }}
                        >
                            <option value="sedentary">Sedentary (Office job)</option>
                            <option value="light">Lightly Active (1-2 days/wk)</option>
                            <option value="moderate">Moderately Active (3-5 days/wk)</option>
                            <option value="active">Very Active (6-7 days/wk)</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        marginTop: '2rem',
                        padding: '1.2rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '1.1rem',
                        fontWeight: 800
                    }}
                >
                    {loading ? <Loader2 size={24} className="spin" /> : <>Let's Lift <ChevronRight size={22} /></>}
                </button>
            </form>
        </div>
    );
};

export default Onboarding;
