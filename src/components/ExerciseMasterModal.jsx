import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Plus, Pencil, Trash2, Eye, EyeOff, RotateCcw, Info, Dumbbell, Shield, Target, Activity, Zap, BicepsFlexed, Sword, Lock, AlertTriangle, UserCheck, Filter, Cpu, SlidersHorizontal } from 'lucide-react';
import { ALL_MUSCLE_GROUPS, getMuscleRegions, normalizeExerciseMuscles } from '../data/muscles';
import CreateExerciseModal from './CreateExerciseModal';
import ExerciseDetailModal from './ExerciseDetailModal';
import AnatomyViewer from './AnatomyViewer';
import { useAuth } from '../context/AuthContext';
import { canEditExercise, ADMIN_EMAIL } from '../utils/storage';
import { toast } from 'react-hot-toast';

const EQUIPMENT_OPTIONS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell'];
const MECHANICS_OPTIONS = ['All', 'Compound', 'Isolation'];

const ExerciseMasterModal = ({ exerciseDb, onSaveExercise, onDeleteExercise, onResetExercises, onClose }) => {
    const { user } = useAuth();
    const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

    const [search, setSearch] = useState('');
    const [filterGroup, setFilterGroup] = useState('All');
    const [equipmentFilter, setEquipmentFilter] = useState('All');
    const [mechanicsFilter, setMechanicsFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('active'); // 'all' | 'active' | 'hidden'
    const [showBodyMap, setShowBodyMap] = useState(false);

    const [editingExercise, setEditingExercise] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [inspectingExercise, setInspectingExercise] = useState(null);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const groups = useMemo(() => ['All', ...ALL_MUSCLE_GROUPS], []);

    // Prevent background page body scrolling while ExerciseMasterModal is active
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const filteredExercises = useMemo(() => {
        let list = exerciseDb || [];

        // 1. Status Filter
        if (statusFilter === 'active') {
            list = list.filter(e => !e.hidden);
        } else if (statusFilter === 'hidden') {
            list = list.filter(e => e.hidden);
        }

        // 2. Muscle Group Filter
        if (filterGroup !== 'All') {
            list = list.filter(e => {
                const norm = normalizeExerciseMuscles(e);
                return norm.primaryGroup === filterGroup || norm.secondaryGroups.includes(filterGroup);
            });
        }

        // 3. Equipment Filter
        if (equipmentFilter !== 'All') {
            const eq = equipmentFilter.toLowerCase();
            list = list.filter(e => {
                const name = (e.name || '').toLowerCase();
                const equip = (e.equipment || '').toLowerCase();
                return equip.includes(eq) || name.includes(eq);
            });
        }

        // 4. Mechanics Filter
        if (mechanicsFilter !== 'All') {
            const isComp = mechanicsFilter === 'Compound';
            list = list.filter(e => {
                const type = (e.type || 'accessory').toLowerCase();
                return isComp ? type === 'compound' : type !== 'compound';
            });
        }

        // 5. Search Query
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(e => {
                const norm = normalizeExerciseMuscles(e);
                return e.name.toLowerCase().includes(q) ||
                    norm.primaryGroup.toLowerCase().includes(q) ||
                    norm.primaryRegions.some(r => r.toLowerCase().includes(q)) ||
                    norm.secondaryRegions.some(r => r.toLowerCase().includes(q));
            });
        }

        return list;
    }, [exerciseDb, search, filterGroup, statusFilter, equipmentFilter, mechanicsFilter]);

    const handleToggleHide = (exercise) => {
        const updated = {
            ...exercise,
            hidden: !exercise.hidden
        };
        onSaveExercise(updated);
        toast.success(updated.hidden ? `Hidden from split add: ${exercise.name}` : `Enabled in split add: ${exercise.name}`);
    };

    const handleRequestDelete = (exercise) => {
        if (!canEditExercise(exercise, user)) {
            toast.error(`Only the creator or Admin (${ADMIN_EMAIL}) can delete this exercise`);
            return;
        }
        setExerciseToDelete(exercise);
    };

    const confirmDelete = () => {
        if (!exerciseToDelete) return;
        const targetId = exerciseToDelete.id;
        onDeleteExercise(targetId);
        setExerciseToDelete(null);
    };

    const handleRequestReset = () => {
        if (!isAdmin) {
            toast.error(`Only Admin (${ADMIN_EMAIL}) can reset the global master database`);
            return;
        }
        setShowResetConfirm(true);
    };

    const confirmReset = () => {
        onResetExercises();
        setShowResetConfirm(false);
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 4000,
            background: 'var(--bg-color)', display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header Bar */}
            <div style={{
                background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)',
                padding: '1.25rem 1rem 1rem 1rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '12px', color: 'var(--accent-color)' }}>
                            <Dumbbell size={20} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase' }} className="text-gradient">
                                    Exercise Master & Explorer
                                </h2>
                                {isAdmin ? (
                                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#0f172a', background: '#38bdf8', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                                        ADMIN
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--muted-color)', padding: '2px 8px', borderRadius: '6px' }}>
                                        USER ACCESS
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                Interactive Body Map & Science-Backed Muscle Filters
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setShowBodyMap(!showBodyMap)}
                            className="dp-btn"
                            style={{
                                padding: '0.6rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
                                background: showBodyMap ? 'var(--accent-color)' : 'var(--muted-color)',
                                color: showBodyMap ? 'white' : 'var(--text-primary)',
                                border: '1px solid var(--border-color)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            <Activity size={16} />
                            <span>{showBodyMap ? 'HIDE BODY MAP' : 'BODY MAP'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="dp-btn"
                            style={{
                                padding: '0.6rem 0.9rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
                                background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
                            }}
                        >
                            <Plus size={16} />
                            <span>ADD</span>
                        </button>

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
                </div>

                {/* Interactive Anatomy Viewer Body Map Drawer */}
                {showBodyMap && (
                    <div style={{
                        background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                        borderRadius: '20px', padding: '1rem', marginBottom: '0.75rem',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: '8px'
                        }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                TAP ANY MUSCLE TO FILTER EXERCISES
                            </span>
                            {filterGroup !== 'All' && (
                                <button
                                    onClick={() => setFilterGroup('All')}
                                    style={{
                                        background: 'rgba(56, 189, 248, 0.15)', border: 'none',
                                        color: 'var(--accent-color)', fontSize: '0.65rem', fontWeight: 800,
                                        padding: '2px 8px', borderRadius: '6px', cursor: 'pointer'
                                    }}
                                >
                                    RESET FILTER ({filterGroup})
                                </button>
                            )}
                        </div>
                        <AnatomyViewer
                            primaryGroup={filterGroup !== 'All' ? filterGroup : null}
                            height={220}
                            interactive={true}
                            onRegionClick={(region, group) => {
                                setFilterGroup(group);
                                toast.success(`Filtered: ${group} (${region})`);
                            }}
                        />
                    </div>
                )}

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search master exercises by name, head, or muscle..."
                        style={{ paddingLeft: '2.4rem', fontSize: '0.9rem', width: '100%', borderRadius: '14px' }}
                    />
                </div>

                {/* Muscle Group Filter Chips */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '4px', marginBottom: '6px', overscrollBehavior: 'contain' }}>
                    {groups.map(g => (
                        <button
                            key={g}
                            onClick={() => setFilterGroup(g)}
                            style={{
                                padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                                whiteSpace: 'nowrap', cursor: 'pointer', border: '1px solid var(--border-color)',
                                background: filterGroup === g ? 'var(--accent-color)' : 'var(--panel-color)',
                                color: filterGroup === g ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {g}
                        </button>
                    ))}
                </div>

                {/* Multi-Dimensional Equipment & Mechanics Filter Chips */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '4px', marginBottom: '6px', overscrollBehavior: 'contain' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', alignSelf: 'center', marginRight: '2px' }}>
                        EQUIP:
                    </span>
                    {EQUIPMENT_OPTIONS.map(eq => (
                        <button
                            key={eq}
                            onClick={() => setEquipmentFilter(eq)}
                            style={{
                                padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800,
                                whiteSpace: 'nowrap', cursor: 'pointer', border: '1px solid var(--border-color)',
                                background: equipmentFilter === eq ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                                color: equipmentFilter === eq ? 'var(--accent-color)' : 'var(--text-secondary)'
                            }}
                        >
                            {eq}
                        </button>
                    ))}
                </div>

                {/* Mechanics Filter & Active/Hidden Toggle */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>TYPE:</span>
                        {MECHANICS_OPTIONS.map(mech => (
                            <button
                                key={mech}
                                onClick={() => setMechanicsFilter(mech)}
                                style={{
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800,
                                    border: '1px solid var(--border-color)',
                                    background: mechanicsFilter === mech ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                    color: mechanicsFilter === mech ? '#f59e0b' : 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {mech}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: 'auto' }}>
                        <button
                            onClick={() => setStatusFilter('active')}
                            style={{
                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800,
                                border: '1px solid var(--border-color)',
                                background: statusFilter === 'active' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                color: statusFilter === 'active' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter('hidden')}
                            style={{
                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800,
                                border: '1px solid var(--border-color)',
                                background: statusFilter === 'hidden' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                color: statusFilter === 'hidden' ? 'var(--error-color)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            Hidden ({exerciseDb.filter(e => e.hidden).length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('all')}
                            style={{
                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800,
                                border: '1px solid var(--border-color)',
                                background: statusFilter === 'all' ? 'var(--muted-color)' : 'transparent',
                                color: statusFilter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            All ({exerciseDb.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* List of Master Exercises */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1rem 1rem calc(2rem + env(safe-area-inset-bottom, 0px)) 1rem', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                {filteredExercises.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        <Dumbbell size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>No Master Exercises Found</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try resetting equipment or muscle group filters</div>
                    </div>
                ) : (
                    filteredExercises.map((ex) => {
                        const norm = normalizeExerciseMuscles(ex);
                        const isHidden = ex.hidden;
                        const canEdit = canEditExercise(ex, user);
                        const isCompound = (ex.type || '').toLowerCase() === 'compound';

                        return (
                            <div
                                key={ex.id}
                                style={{
                                    width: '100%', padding: '1rem', marginBottom: '10px',
                                    background: 'var(--panel-color)',
                                    border: isHidden ? '1px dashed var(--border-color)' : '1px solid var(--border-color)',
                                    borderRadius: '18px', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    color: 'var(--text-primary)', opacity: isHidden ? 0.6 : 1,
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                                    {/* Icon / Edit Indicator */}
                                    {canEdit ? (
                                        <button
                                            type="button"
                                            onClick={() => setEditingExercise(ex)}
                                            title="Edit Exercise"
                                            style={{
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                background: 'rgba(56, 189, 248, 0.15)',
                                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', color: 'var(--accent-color)',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                    ) : (
                                        <div
                                            title={`Editable only by creator or Admin (${ADMIN_EMAIL})`}
                                            style={{
                                                width: '42px', height: '42px', borderRadius: '12px',
                                                background: 'var(--muted-color)',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--text-secondary)', opacity: 0.7,
                                                flexShrink: 0
                                            }}
                                        >
                                            <Lock size={16} />
                                        </div>
                                    )}

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: 800 }}>{ex.name}</span>
                                            {isCompound && (
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 900, color: '#f59e0b',
                                                    background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
                                                    padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase'
                                                }}>
                                                    Compound
                                                </span>
                                            )}
                                            {ex.isCustom && (
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 900, color: '#38bdf8',
                                                    background: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: '6px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Custom
                                                </span>
                                            )}
                                            {isHidden && (
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 900, color: 'var(--error-color)',
                                                    background: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '6px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Hidden in Split Add
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                                            {/* Primary Muscle Badge */}
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 800, color: '#0f172a',
                                                background: '#38bdf8', padding: '2px 8px', borderRadius: '6px'
                                            }}>
                                                Primary: {norm.primaryRegions.join(', ')}
                                            </span>

                                            {/* Secondary Muscle Badge */}
                                            {norm.secondaryRegions.length > 0 && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b',
                                                    background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
                                                    padding: '2px 8px', borderRadius: '6px'
                                                }}>
                                                    Sec: {norm.secondaryRegions.join(', ')}
                                                </span>
                                            )}

                                            {/* Default Config Specs */}
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)',
                                                background: 'var(--muted-color)', padding: '2px 8px', borderRadius: '6px'
                                            }}>
                                                {ex.defaultSets || 3} sets × {ex.defaultReps || 10} reps @ {ex.defaultWeight || 0}kg (+{ex.progression || 2.5}kg)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons Right */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setInspectingExercise(ex)}
                                        style={{
                                            background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                                            borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)'
                                        }}
                                        title="View Anatomy & Execution Guide"
                                    >
                                        <Info size={16} />
                                    </button>

                                    {canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingExercise(ex)}
                                            style={{
                                                background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)',
                                                borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--accent-color)'
                                            }}
                                            title="Edit Exercise"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleToggleHide(ex)}
                                        style={{
                                            background: isHidden ? 'rgba(239, 68, 68, 0.15)' : 'var(--muted-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '10px', padding: '8px', cursor: 'pointer',
                                            color: isHidden ? 'var(--error-color)' : 'var(--text-secondary)'
                                        }}
                                        title={isHidden ? "Enable in Split Add" : "Hide from Split Add"}
                                    >
                                        {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>

                                    {canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => handleRequestDelete(ex)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'var(--error-color)'
                                            }}
                                            title="Delete Exercise"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Bar */}
            {isAdmin && (
                <div style={{
                    padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)',
                    background: 'var(--panel-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Master Database Admin Tools ({ADMIN_EMAIL})
                    </div>
                    <button
                        type="button"
                        onClick={handleRequestReset}
                        style={{
                            background: 'transparent', border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '8px',
                            fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                    >
                        <RotateCcw size={12} />
                        <span>RESET DEFAULTS</span>
                    </button>
                </div>
            )}

            {/* In-App Delete Confirmation Modal */}
            {exerciseToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 6000,
                    background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem'
                }} onClick={() => setExerciseToDelete(null)}>
                    <div
                        className="fade-in"
                        style={{
                            background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                            borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '400px',
                            textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            color: 'var(--text-primary)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)', color: 'var(--error-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <Trash2 size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 900 }}>
                            Delete Exercise?
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
                            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{exerciseToDelete.name}"</strong> from your Master Library?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setExerciseToDelete(null)}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                style={{
                                    flex: 1, padding: '0.8rem', borderRadius: '14px', fontWeight: 900,
                                    background: 'var(--error-color)', color: 'white', border: 'none',
                                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Reset Confirmation Modal */}
            {showResetConfirm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 6000,
                    background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem'
                }} onClick={() => setShowResetConfirm(false)}>
                    <div
                        className="fade-in"
                        style={{
                            background: 'var(--panel-color)', border: '1px solid var(--border-color)',
                            borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '420px',
                            textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            color: 'var(--text-primary)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 900 }}>
                            Reset Master Database?
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
                            Are you sure you want to reset all exercises back to the original default database? Any custom exercises will be cleared.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setShowResetConfirm(false)}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmReset}
                                style={{
                                    flex: 1, padding: '0.8rem', borderRadius: '14px', fontWeight: 900,
                                    background: '#f59e0b', color: '#0f172a', border: 'none',
                                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                                }}
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingExercise) && (
                <CreateExerciseModal
                    exerciseToEdit={editingExercise}
                    onSave={(updatedEx) => {
                        onSaveExercise(updatedEx);
                        setShowCreateModal(false);
                        setEditingExercise(null);
                    }}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingExercise(null);
                    }}
                />
            )}

            {/* Inspect Detail Modal */}
            {inspectingExercise && (
                <ExerciseDetailModal
                    exercise={inspectingExercise}
                    onClose={() => setInspectingExercise(null)}
                />
            )}
        </div>,
        document.body
    );
};

export default ExerciseMasterModal;
