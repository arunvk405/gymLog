import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveProfile } from '../utils/storage';
import { LogOut, UserCircle, ChefHat, Camera, Upload, Loader2, Check, X } from 'lucide-react';
import ImageCropper from './ImageCropper';

const Profile = ({ profile, setProfile }) => {
    const { user, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(profile);
    const [uploading, setUploading] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const fileInputRef = useRef(null);

    if (!profile) return <div className="fade-in">Loading profile...</div>;

    const heightM = profile.height / 100;
    const bmi = (profile.bodyweight / (heightM * heightM)).toFixed(1);

    const getBmiCategory = (val) => {
        if (val < 18.5) return { label: 'Underweight', color: '#ffc107' };
        if (val < 25) return { label: 'Healthy', color: 'var(--success-color)' };
        if (val < 30) return { label: 'Overweight', color: '#fd7e14' };
        return { label: 'Obese', color: 'var(--error-color)' };
    };

    const bmiCat = getBmiCategory(bmi);

    const calculateNutrition = () => {
        let bmr;
        if (profile.gender === 'male') {
            bmr = 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age + 5;
        } else {
            bmr = 10 * profile.bodyweight + 6.25 * profile.height - 5 * profile.age - 161;
        }

        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725
        };

        const tdee = Math.round(bmr * activityMultipliers[profile.activityLevel || 'moderate']);

        // Pro Gym Freak Specs
        const isMale = profile.gender === 'male';
        return {
            calories: tdee,
            protein: Math.round(profile.bodyweight * 2.2), // 2.2g per kg (1g per lb)
            fats: Math.round((tdee * 0.25) / 9), // 25% of cals
            carbs: Math.round((tdee - (profile.bodyweight * 2.2 * 4) - ((tdee * 0.25))) / 4),
            water: (profile.bodyweight * 0.04).toFixed(1), // 40ml per kg
            sodium: 2300,
            zinc: isMale ? 11 : 8,
            magnesium: isMale ? 420 : 320,
            vitaminD: '2000-5000 IU',
            creatine: '5g'
        };
    };

    const nut = calculateNutrition();

    const handlePhotoAction = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setImageToCrop(reader.result);
        };
    };

    const handleCropComplete = async (croppedImageBase64) => {
        setUploading(true);
        setImageToCrop(null);
        try {
            const updated = { ...profile, photoURL: croppedImageBase64 };
            await saveProfile(updated, user.uid);
            setProfile(updated);
        } catch (err) {
            console.error("Save Photo Error:", err);
            alert("Failed to save cropped photo.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        await saveProfile(tempProfile, user.uid);
        setProfile(tempProfile);
        setEditing(false);
    };

    return (
        <div className="fade-in">
            {imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setImageToCrop(null)}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Account</h1>
                <button className="secondary" onClick={logout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <div className="panel" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.2rem' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent-color)', background: 'var(--panel-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {uploading ? (
                            <Loader2 size={40} className="spin" color="var(--accent-color)" />
                        ) : profile.photoURL ? (
                            <img
                                src={profile.photoURL}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div style="color:var(--text-secondary)"><UserCircle size={60} /></div>';
                                }}
                            />
                        ) : (
                            <div style={{ color: 'var(--text-secondary)' }}>
                                <UserCircle size={70} />
                            </div>
                        )}
                    </div>

                    <label style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        background: 'var(--accent-color)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        transition: 'transform 0.2s',
                        zIndex: 10
                    }}>
                        <Camera size={18} color="white" />
                        <input type="file" accept="image/*" onChange={handlePhotoAction} style={{ display: 'none' }} />
                    </label>
                </div>

                <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.4rem', fontWeight: 800 }}>{profile.displayName || 'Gym Member'}</h2>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
                <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(88, 166, 255, 0.1)',
                    color: 'var(--accent-color)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {profile.goal?.replace('_', ' ') || 'MUSCLE GAIN'}
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Body Mass Index</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: bmiCat.color }}>{bmi}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: bmiCat.color, background: `${bmiCat.color}15`, padding: '2px 8px', borderRadius: '10px' }}>{bmiCat.label.toUpperCase()}</div>
                </div>
                <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Calories</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{nut.calories}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>KCAL / DAY</div>
                </div>
            </div>

            {editing ? (
                <div className="panel">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Full Name</label>
                            <input type="text" value={tempProfile.displayName || ''} onChange={(e) => setTempProfile({ ...tempProfile, displayName: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Weight (kg)</label>
                            <input type="number" value={tempProfile.bodyweight} onChange={(e) => setTempProfile({ ...tempProfile, bodyweight: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Height (cm)</label>
                            <input type="number" value={tempProfile.height} onChange={(e) => setTempProfile({ ...tempProfile, height: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Age</label>
                            <input type="number" value={tempProfile.age} onChange={(e) => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Gender</label>
                            <select value={tempProfile.gender} onChange={(e) => setTempProfile({ ...tempProfile, gender: e.target.value })}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Fitness Goal</label>
                            <select
                                value={tempProfile.goal || 'muscle_gain'}
                                onChange={(e) => setTempProfile({ ...tempProfile, goal: e.target.value })}
                                style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}>
                                <option value="muscle_gain">Build Muscle</option>
                                <option value="fat_loss">Fat Loss</option>
                                <option value="strength">Increase Strength</option>
                                <option value="endurance">Endurance</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Activity Level</label>
                            <select value={tempProfile.activityLevel} onChange={(e) => setTempProfile({ ...tempProfile, activityLevel: e.target.value })}>
                                <option value="sedentary">Sedentary</option>
                                <option value="light">Lightly Active</option>
                                <option value="moderate">Moderately Active</option>
                                <option value="active">Very Active</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button style={{ flex: 1 }} onClick={handleSave}>Save</button>
                        <button className="secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <button className="secondary" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => setEditing(true)}>Edit Biometrics</button>
            )}

            <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <ChefHat size={18} color="var(--accent-color)" />
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Nutrition for Lifts</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div className="stat-box" style={{ background: 'rgba(88, 166, 255, 0.05)' }}>
                        <div className="stat-label">Protein</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{nut.protein}g</div>
                    </div>
                    <div className="stat-box" style={{ background: 'rgba(63, 185, 80, 0.05)' }}>
                        <div className="stat-label">Carbs</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{nut.carbs}g</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Fats</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{nut.fats}g</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Water</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{nut.water}L</div>
                    </div>
                </div>

                <div style={{ marginTop: '1.2rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '0.5rem' }}>MICROS & SUPPLEMENTS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>Zinc: <span style={{ color: 'white' }}>{nut.zinc}mg</span></div>
                        <div style={{ color: 'var(--text-secondary)' }}>Magnesium: <span style={{ color: 'white' }}>{nut.magnesium}mg</span></div>
                        <div style={{ color: 'var(--text-secondary)' }}>Vit D3: <span style={{ color: 'white' }}>{nut.vitaminD}</span></div>
                        <div style={{ color: 'var(--text-secondary)' }}>Creatine: <span style={{ color: 'white' }}>{nut.creatine}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
