import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveProfile } from '../utils/storage';
import { LogOut, UserCircle, ChefHat, Camera, Upload, Loader2, Check, X, Moon, Sun, Share2, Dumbbell, Palette, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImageCropper from './ImageCropper';
import ExerciseMasterModal from './ExerciseMasterModal';

const ACCENT_THEMES = [
    { id: 'cyber', name: 'Cyber Neon', color: '#38bdf8' },
    { id: 'crimson', name: 'Crimson Power', color: '#ef4444' },
    { id: 'gold', name: 'Titanium Gold', color: '#f59e0b' },
    { id: 'emerald', name: 'Emerald Titan', color: '#10b981' }
];

const Profile = ({ profile, setProfile, theme, toggleTheme, accentTheme, onAccentChange, history, exerciseDb, onSaveExercise, onDeleteExercise, onResetExercises }) => {
    const { user, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(profile);
    const [uploading, setUploading] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [showExerciseMaster, setShowExerciseMaster] = useState(false);
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
        let bmr = (10 * profile.bodyweight) + (6.25 * profile.height) - (5 * profile.age);
        if (profile.gender === 'male') bmr += 5;
        else bmr -= 161;

        let tdee = bmr * 1.55;

        if (profile.goal === 'muscle_gain') tdee += 300;
        else if (profile.goal === 'fat_loss') tdee -= 400;

        const protein = Math.round(profile.bodyweight * 2.2);
        const fats = Math.round(profile.bodyweight * 0.9);
        const proteinCal = protein * 4;
        const fatCal = fats * 9;
        const carbCal = Math.max(0, tdee - (proteinCal + fatCal));
        const carbs = Math.round(carbCal / 4);

        const water = (profile.bodyweight * 0.04).toFixed(1);
        const zinc = profile.gender === 'male' ? 15 : 11;
        const magnesium = profile.gender === 'male' ? 420 : 320;
        const vitaminD = '4000 IU';
        const creatine = '5g Daily';

        return {
            calories: Math.round(tdee),
            protein,
            carbs,
            fats,
            water,
            zinc,
            magnesium,
            vitaminD,
            creatine
        };
    };

    const nut = calculateNutrition();

    const handleSave = async () => {
        try {
            setProfile(tempProfile);
            await saveProfile(user.uid, tempProfile);
            setEditing(false);
            toast.success("Profile saved!");
        } catch (e) {
            toast.error("Failed to save profile");
        }
    };

    const handlePhotoAction = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImageBase64) => {
        setImageToCrop(null);
        setUploading(true);

        try {
            const updated = { ...profile, photoURL: croppedImageBase64 };
            setProfile(updated);
            setTempProfile(updated);
            await saveProfile(user.uid, updated);
            toast.success("Profile photo updated!");
        } catch (e) {
            console.error("Photo save error:", e);
            toast.error("Failed to save profile photo.");
        } finally {
            setUploading(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'BulkBro App',
                text: 'Track your strength gains with BulkBro!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("App link copied to clipboard!");
        }
    };

    const handleExportJSON = () => {
        try {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history || [], null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `bulkbro_history_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            toast.success("History exported as JSON!");
        } catch (e) {
            toast.error("Export failed");
        }
    };

    const handleExportCSV = () => {
        try {
            let csvContent = "Date,Workout,Exercise,Set,Weight_KG,Reps,Completed\n";
            (history || []).forEach(session => {
                const dateStr = session.date ? new Date(session.date).toLocaleDateString() : 'Unknown';
                const workoutName = (session.name || 'Workout').replace(/,/g, '');
                (session.exercises || []).forEach(ex => {
                    const exName = (ex.name || '').replace(/,/g, '');
                    (ex.sets || []).forEach((s, idx) => {
                        csvContent += `${dateStr},"${workoutName}","${exName}",${idx + 1},${s.weight || 0},${s.reps || 0},${s.completed ? 'YES' : 'NO'}\n`;
                    });
                });
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `bulkbro_workout_history_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("History exported as CSV!");
        } catch (e) {
            toast.error("CSV Export failed");
        }
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '3rem' }}>
            {imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setImageToCrop(null)}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }} className="text-gradient">Profile & Settings</h1>
                <button className="secondary" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="panel" style={{ textAlign: 'center', position: 'relative', marginBottom: '1.5rem', background: 'var(--panel-color)', border: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1rem' }}>
                    {profile.photoURL ? (
                        <img
                            src={profile.photoURL}
                            alt="Profile"
                            style={{
                                width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                                border: '3px solid var(--accent-color)', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%', background: 'var(--muted-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--border-color)', color: 'var(--text-secondary)'
                        }}>
                            <UserCircle size={54} />
                        </div>
                    )}

                    {uploading && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <Loader2 size={24} className="icon-pulse" />
                        </div>
                    )}

                    <label style={{
                        position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-color)',
                        borderRadius: '50%', width: '32px', height: '32px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '2px solid var(--panel-color)',
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
                    background: 'var(--muted-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: '1px solid var(--border-color)'
                }}>
                    {profile.goal?.replace('_', ' ') || 'MUSCLE GAIN'}
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-box" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Body Mass Index</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: bmiCat.color }}>{bmi}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: bmiCat.color, background: `${bmiCat.color}15`, padding: '2px 8px', borderRadius: '10px' }}>{bmiCat.label.toUpperCase()}</div>
                </div>
                <div className="stat-box" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Calories</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>{nut.calories}</div>
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
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Training Goal</label>
                            <select value={tempProfile.goal} onChange={(e) => setTempProfile({ ...tempProfile, goal: e.target.value })}>
                                <option value="muscle_gain">Muscle Building / Hypertrophy</option>
                                <option value="fat_loss">Fat Loss / Definition</option>
                                <option value="strength">Pure Strength</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={handleSave} style={{ flex: 1 }}>Save Changes</button>
                        <button className="secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>Cancel</button>
                    </div>
                </div>
            ) : (
                <>
                    <button className="secondary" onClick={() => setEditing(true)} style={{ width: '100%', marginBottom: '1.5rem' }}>
                        Edit Body Stats
                    </button>

                    {/* APP THEME & ACCENT COLOR PREFERENCES */}
                    <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <Palette size={18} color="var(--accent-color)" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>App Aesthetics & Accent Color</h3>
                        </div>

                        {/* Light / Dark Mode Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: 'var(--muted-color)', borderRadius: '14px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Appearance Mode</span>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800,
                                    background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                {theme === 'dark' ? <Moon size={14} color="#38bdf8" /> : <Sun size={14} color="#f59e0b" />}
                                <span>{theme === 'dark' ? 'DARK MODE' : 'LIGHT MODE'}</span>
                            </button>
                        </div>

                        {/* Accent Theme Color Chips */}
                        <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                                ACCENT COLOR THEME
                            </span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                {ACCENT_THEMES.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => onAccentChange && onAccentChange(t.id)}
                                        style={{
                                            padding: '8px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
                                            background: accentTheme === t.id ? `${t.color}20` : 'var(--muted-color)',
                                            border: accentTheme === t.id ? `2px solid ${t.color}` : '1px solid var(--border-color)',
                                            color: accentTheme === t.id ? t.color : 'var(--text-primary)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color }}></div>
                                        <span>{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MASTER EXERCISE LIBRARY LINK */}
                    <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                                    <Dumbbell size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Exercise Master & Explorer</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Interactive Body Map & Exercise Library</div>
                                </div>
                            </div>
                            <button
                                className="dp-btn"
                                onClick={() => setShowExerciseMaster(true)}
                                style={{
                                    padding: '0.6rem 1.1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800,
                                    background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                                }}
                            >
                                OPEN
                            </button>
                        </div>
                    </div>

                    {/* DATA BACKUP & EXPORT PANEL */}
                    <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                            <Download size={18} color="var(--accent-color)" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Export & Backup Training Data</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Download a full backup of your workout history and logs to own your training data.
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                className="secondary"
                                onClick={handleExportCSV}
                                style={{ flex: 1, padding: '0.7rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <FileText size={14} /> EXPORT CSV
                            </button>
                            <button
                                type="button"
                                className="secondary"
                                onClick={handleExportJSON}
                                style={{ flex: 1, padding: '0.7rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <Download size={14} /> EXPORT JSON
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <button className="secondary" onClick={handleShare} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'none' }}>
                            <Share2 size={18} /> Share App
                        </button>
                    </div>

                    <div className="panel" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <ChefHat size={18} color="var(--accent-color)" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Nutrition Guide</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                            <div className="stat-box" style={{ background: 'var(--muted-color)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>PROTEIN</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{nut.protein}g</div>
                            </div>
                            <div className="stat-box" style={{ background: 'var(--muted-color)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>CARBS</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{nut.carbs}g</div>
                            </div>
                            <div className="stat-box" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>FATS</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{nut.fats}g</div>
                            </div>
                            <div className="stat-box" style={{ background: 'var(--panel-color)', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}>WATER</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{nut.water}L</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'var(--muted-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>MICROS & SUPPLEMENTS</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Zinc: <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{nut.zinc}mg</span></div>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Magnesium: <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{nut.magnesium}mg</span></div>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Vit D3: <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{nut.vitaminD}</span></div>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Creatine: <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{nut.creatine}</span></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>BULKBRO v1.0.2</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '4px' }}>Precision Training Intelligence</div>
                    </div>
                </>
            )}

            {showExerciseMaster && (
                <ExerciseMasterModal
                    exerciseDb={exerciseDb || []}
                    user={user}
                    onSaveExercise={onSaveExercise}
                    onDeleteExercise={onDeleteExercise}
                    onResetExercises={onResetExercises}
                    onClose={() => setShowExerciseMaster(false)}
                />
            )}
        </div>
    );
};

export default Profile;
