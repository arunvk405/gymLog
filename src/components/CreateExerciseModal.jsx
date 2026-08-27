import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Save, Target, Dumbbell, Zap, Pencil, Lock } from 'lucide-react';
import MuscleSelector from './MuscleSelector';
import AnatomyViewer from './AnatomyViewer';
import { ALL_MUSCLE_GROUPS, getMuscleRegions, normalizeExerciseMuscles } from '../data/muscles';
import { useAuth } from '../context/AuthContext';
import { canEditExercise, ADMIN_EMAIL } from '../utils/storage';
import { toast } from 'react-hot-toast';

const CreateExerciseModal = ({ onSave, onClose, exerciseToEdit = null }) => {
    const { user } = useAuth();
    const isEditing = !!exerciseToEdit;
    const norm = exerciseToEdit ? normalizeExerciseMuscles(exerciseToEdit) : null;

    // Enforce permission check if editing existing exercise
    useEffect(() => {
        if (exerciseToEdit && !canEditExercise(exerciseToEdit, user)) {
            toast.error(`Only the creator or Admin (${ADMIN_EMAIL}) can edit this exercise`);
            onClose();
        }
    }, [exerciseToEdit, user]);

    const [name, setName] = useState(exerciseToEdit?.name || '');
    const [type, setType] = useState(exerciseToEdit?.type || 'accessory');
    const [defaultSets, setDefaultSets] = useState(exerciseToEdit?.defaultSets !== undefined ? exerciseToEdit.defaultSets : 3);
    const [defaultReps, setDefaultReps] = useState(exerciseToEdit?.defaultReps !== undefined ? exerciseToEdit.defaultReps : 10);
    const [defaultWeight, setDefaultWeight] = useState(exerciseToEdit?.defaultWeight !== undefined ? exerciseToEdit.defaultWeight : 20);
    const [progression, setProgression] = useState(exerciseToEdit?.progression !== undefined ? exerciseToEdit.progression : 2.5);

    // Primary Muscle Targeting
    const [primaryGroup, setPrimaryGroup] = useState(norm?.primaryGroup || exerciseToEdit?.primaryMuscleGroup || exerciseToEdit?.muscleGroup || 'Chest');
    const [primaryRegions, setPrimaryRegions] = useState(norm?.primaryRegions || ['Mid Chest']);

    // Secondary Muscle Targeting
    const [secondaryGroup, setSecondaryGroup] = useState(norm?.secondaryGroups?.[0] || exerciseToEdit?.secondaryMuscleGroups?.[0] || 'Triceps');
    const [secondaryRegions, setSecondaryRegions] = useState(norm?.secondaryRegions || []);

    const [activeTab, setActiveTab] = useState('primary'); // 'primary' | 'secondary'

    // Lock body background scroll when modal is active to eliminate double scrollbars
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const handleTogglePrimaryRegion = (region) => {
        setPrimaryRegions(prev => {
            if (prev.includes(region)) {
                if (prev.length === 1) return prev; // keep at least 1 primary region
                return prev.filter(r => r !== region);
            }
            return [...prev, region];
        });
    };

    const handleToggleSecondaryRegion = (region) => {
        setSecondaryRegions(prev => {
            if (prev.includes(region)) {
                return prev.filter(r => r !== region);
            }
            return [...prev, region];
        });
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Please enter an exercise name');
            return;
        }

        const exerciseData = {
            ...exerciseToEdit,
            id: exerciseToEdit ? exerciseToEdit.id : `custom_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: name.trim(),
            muscleGroup: primaryGroup,
            primaryMuscleGroup: primaryGroup,
            primaryRegions: primaryRegions.length > 0 ? primaryRegions : [getMuscleRegions(primaryGroup)[0]],
            secondaryMuscleGroups: secondaryRegions.length > 0 ? [secondaryGroup] : [],
            secondaryRegions: secondaryRegions,
            type: type,
            defaultSets: parseInt(defaultSets) || 3,
            defaultReps: parseInt(defaultReps) || 10,
            defaultWeight: parseFloat(defaultWeight) || 0,
            progression: parseFloat(progression) || 2.5,
            isCustom: isEditing ? (exerciseToEdit.isCustom !== undefined ? exerciseToEdit.isCustom : true) : true,
            createdBy: exerciseToEdit?.createdBy || user?.uid || 'guest',
            createdByEmail: exerciseToEdit?.createdByEmail || user?.email || ''
        };

        onSave(exerciseData);
        toast.success(isEditing ? `Updated exercise: ${exerciseData.name}` : `Created custom exercise: ${exerciseData.name}`);
        onClose();
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 5000,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
            padding: 0,
            overflow: 'hidden'
        }} onClick={onClose}>
            {/* Modal Sheet Container */}
            <div
                className="fade-in"
                style={{
                    background: 'var(--panel-color)',
                    borderTop: '1px solid var(--border-color)',
                    borderRadius: '24px 24px 0 0',
                    width: '100%',
                    maxWidth: '600px',
                    height: '92vh',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
                    position: 'relative',
                    color: 'var(--text-primary)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header (Sticky Top) */}
                <div style={{
                    padding: '1.25rem 1.25rem 1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--panel-color)', flexShrink: 0, zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '12px', color: 'var(--accent-color)' }}>
                            {isEditing ? <Pencil size={18} /> : <Plus size={18} />}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase' }} className="text-gradient">
                            {isEditing ? 'Edit Exercise' : 'Create Exercise'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="secondary dp-btn"
                        onClick={onClose}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body - Single Main Scrollable Area */}
                <div style={{
                    flex: 1, overflowY: 'auto', overflowX: 'hidden',
                    padding: '1.25rem',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain'
                }}>
                    {/* Exercise Name */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block', letterSpacing: '0.5px' }}>
                            EXERCISE NAME
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Incline Cable Chest Fly"
                            style={{
                                width: '100%', fontSize: '1rem', fontWeight: 700,
                                padding: '0.85rem 1rem', borderRadius: '14px',
                                border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    {/* Type & Progression */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                CATEGORY TYPE
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '12px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                    fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)'
                                }}
                            >
                                <option value="accessory">Accessory</option>
                                <option value="compound">Compound</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                +KG PROGRESSION
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                value={progression}
                                onChange={(e) => setProgression(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '12px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                    fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Default Specs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                DEFAULT SETS
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="15"
                                value={defaultSets}
                                onChange={(e) => setDefaultSets(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.65rem', borderRadius: '12px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                    fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                DEFAULT REPS
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={defaultReps}
                                onChange={(e) => setDefaultReps(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.65rem', borderRadius: '12px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                    fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                START WEIGHT (KG)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={defaultWeight}
                                onChange={(e) => setDefaultWeight(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.65rem', borderRadius: '12px',
                                    border: '1px solid var(--border-color)', background: 'var(--bg-color)',
                                    fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Target Muscle Selector Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('primary')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
                                border: activeTab === 'primary' ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                                background: activeTab === 'primary' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-color)',
                                color: activeTab === 'primary' ? '#38bdf8' : 'var(--text-secondary)',
                                cursor: 'pointer', transition: 'all 0.15s ease'
                            }}
                        >
                            PRIMARY MUSCLE
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('secondary')}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
                                border: activeTab === 'secondary' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                                background: activeTab === 'secondary' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-color)',
                                color: activeTab === 'secondary' ? '#f59e0b' : 'var(--text-secondary)',
                                cursor: 'pointer', transition: 'all 0.15s ease'
                            }}
                        >
                            SECONDARY MUSCLE
                        </button>
                    </div>

                    {/* Muscle Group -> Region/Head Selector */}
                    {activeTab === 'primary' ? (
                        <MuscleSelector
                            selectedGroup={primaryGroup}
                            selectedRegions={primaryRegions}
                            onSelectGroup={(g) => {
                                setPrimaryGroup(g);
                                const regions = getMuscleRegions(g);
                                setPrimaryRegions(regions.length > 0 ? [regions[0]] : []);
                            }}
                            onToggleRegion={handleTogglePrimaryRegion}
                            title="Select Primary Muscle Group & Specific Head"
                        />
                    ) : (
                        <MuscleSelector
                            selectedGroup={secondaryGroup}
                            selectedRegions={secondaryRegions}
                            onSelectGroup={(g) => {
                                setSecondaryGroup(g);
                            }}
                            onToggleRegion={handleToggleSecondaryRegion}
                            title="Select Secondary Muscle Group & Specific Head"
                        />
                    )}

                    {/* Anatomy Preview */}
                    <div style={{
                        background: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <AnatomyViewer
                            primaryRegions={primaryRegions}
                            secondaryRegions={secondaryRegions}
                            primaryGroup={primaryGroup}
                            height={170}
                        />
                    </div>
                </div>

                {/* Footer (Sticky Save Action) */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--panel-color)',
                    zIndex: 10, flexShrink: 0
                }}>
                    <button
                        type="button"
                        onClick={handleSave}
                        style={{
                            width: '100%', padding: '0.95rem', borderRadius: '16px',
                            background: 'var(--text-primary)', color: 'var(--bg-color)',
                            fontWeight: 900, fontSize: '0.95rem', border: 'none',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '8px', textTransform: 'uppercase',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                        }}
                    >
                        {isEditing ? <Save size={18} /> : <Plus size={18} />}
                        {isEditing ? 'Save Exercise Changes' : 'Add Custom Exercise'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateExerciseModal;
