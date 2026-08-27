import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Target, Dumbbell, Zap, Layers, CheckCircle2, ShieldAlert, Cpu, Activity, Award } from 'lucide-react';
import AnatomyViewer from './AnatomyViewer';
import { normalizeExerciseMuscles } from '../data/muscles';

const getEquipmentName = (exercise) => {
    if (exercise.equipment) return exercise.equipment;
    const name = (exercise.name || '').toLowerCase();
    if (name.includes('barbell')) return 'Barbell';
    if (name.includes('dumbbell') || name.includes('db')) return 'Dumbbell';
    if (name.includes('cable')) return 'Cable';
    if (name.includes('machine') || name.includes('press machine') || name.includes('deck') || name.includes('pulldown')) return 'Machine';
    if (name.includes('kettlebell') || name.includes('kb')) return 'Kettlebell';
    if (name.includes('smith')) return 'Smith Machine';
    if (name.includes('push-up') || name.includes('dip') || name.includes('chin-up') || name.includes('pull-up') || name.includes('plank')) return 'Bodyweight';
    return 'Free Weight / Gym Equipment';
};

const getExecutionTips = (exercise) => {
    const name = (exercise.name || '').toLowerCase();
    if (name.includes('bench press')) {
        return [
            'Maintain a slight arch in your lower back with feet firmly planted on the floor.',
            'Retract and depress your shoulder blades (pull them together and down).',
            'Lower the bar under control (2-second negative) to mid-chest level.',
            'Drive upward explosive through the palms without letting your shoulders round forward.'
        ];
    }
    if (name.includes('squat')) {
        return [
            'Keep your chest up and brace your core tightly before initiating the descent.',
            'Break at the hips and knees simultaneously, spreading knees in line with toes.',
            'Squat deep (at least parallel or lower) while maintaining a neutral spine.',
            'Push evenly through your mid-foot and heel to return to top standing position.'
        ];
    }
    if (name.includes('deadlift')) {
        return [
            'Position feet hip-width apart with the bar directly over mid-foot.',
            'Hinge at hips, grip the bar tightly, and pull the slack out of the barbell before lifting.',
            'Keep your lats engaged ("squeeze armpits") and pull bar close against legs.',
            'Lock out at top by squeezing glutes—avoid hyper-extending your lower back.'
        ];
    }
    if (name.includes('overhead press') || name.includes('ohp')) {
        return [
            'Stand tall with glutes and core squeezed to prevent leaning back excessively.',
            'Press the bar upward in a straight line, pulling your head back slightly until bar passes forehead.',
            'Lock out overhead with arms fully extended over mid-foot.',
            'Control the descent back to upper chest / front delts.'
        ];
    }
    if (name.includes('row')) {
        return [
            'Maintain a flat back and hinged torso position (30° to 45° angle).',
            'Lead the pulling movement with your elbows, driving them back toward your hips.',
            'Squeeze your shoulder blades together tightly at the top for 1 full second.',
            'Control the stretch on the way down without letting your lower back round.'
        ];
    }
    if (name.includes('fly') || name.includes('pec deck')) {
        return [
            'Maintain a subtle, fixed bend in your elbows throughout the arc motion.',
            'Focus on hugging a wide tree trunk to maximize chest contraction at peak.',
            'Slowly stretch the chest on the negative without over-stretching the anterior shoulder capsule.'
        ];
    }
    if (name.includes('curl')) {
        return [
            'Keep your upper arms pinned to your sides—avoid swinging or using momentum.',
            'Flex your biceps hard at the peak contraction for 1 second.',
            'Lower the weight with a controlled 2–3 second negative stretch.'
        ];
    }
    if (name.includes('tricep') || name.includes('pushdown') || name.includes('extension')) {
        return [
            'Lock your elbows into position as hinges.',
            'Focus strictly on flexing the elbow joint to contract the triceps long or lateral heads.',
            'Squeeze hard at full extension without flaring elbows outward.'
        ];
    }
    if (name.includes('calf')) {
        return [
            'Pause for 2 full seconds at the peak contraction while flexing calves.',
            'Lower slowly into a full deep stretch at the bottom and hold for 1 second.',
            'Eliminate momentum/bouncing to ensure the Achilles tendon does not steal workload.'
        ];
    }
    return [
        'Maintain a solid, braced core and neutral spine posture throughout the movement.',
        'Use a controlled rep tempo: 2-second negative (eccentric) and explosive positive (concentric).',
        'Focus on mind-muscle connection with the target muscle group.'
    ];
};

const ExerciseDetailModal = ({ exercise, onClose }) => {
    useEffect(() => {
        if (!exercise) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [exercise]);

    if (!exercise) return null;

    const { primaryGroup, primaryRegions, secondaryGroups, secondaryRegions } = normalizeExerciseMuscles(exercise);
    const equipment = getEquipmentName(exercise);
    const executionTips = getExecutionTips(exercise);
    const isCompound = (exercise.type || '').toLowerCase() === 'compound';

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 5500,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            overflow: 'hidden'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '540px',
                maxHeight: '92vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                padding: '1.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                position: 'relative',
                color: 'var(--text-primary)'
            }} onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    type="button"
                    className="icon-btn"
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                        borderRadius: '50%', width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)', cursor: 'pointer'
                    }}
                >
                    <X size={18} />
                </button>

                {/* Header Section */}
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span style={{
                            padding: '4px 10px', borderRadius: '8px',
                            background: isCompound ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            border: isCompound ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '0.65rem', fontWeight: 900,
                            color: isCompound ? 'var(--accent-color)' : '#f59e0b',
                            textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                            <Cpu size={12} /> {isCompound ? 'Compound Movement' : 'Isolation / Accessory'}
                        </span>

                        <span style={{
                            padding: '4px 10px', borderRadius: '8px',
                            background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                            fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                            <Dumbbell size={12} /> {equipment}
                        </span>
                    </div>

                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        {exercise.name}
                    </h2>
                </div>

                {/* Interactive Anatomy Viewer */}
                <div style={{
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1rem',
                    marginBottom: '1.25rem'
                }}>
                    <AnatomyViewer
                        primaryRegions={primaryRegions}
                        secondaryRegions={secondaryRegions}
                        primaryGroup={primaryGroup}
                        height={240}
                    />
                </div>

                {/* Target Muscle Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    {/* Primary Target Card */}
                    <div style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '16px',
                        padding: '1rem'
                    }}>
                        <div style={{
                            fontSize: '0.7rem', fontWeight: 900, color: '#38bdf8',
                            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <Target size={14} /> PRIMARY MUSCLE TARGET
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>
                            {primaryGroup}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {primaryRegions.map(region => (
                                <span key={region} style={{
                                    background: '#38bdf8', color: '#0f172a',
                                    fontSize: '0.75rem', fontWeight: 800,
                                    padding: '4px 10px', borderRadius: '8px'
                                }}>
                                    {region}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Target Card */}
                    {secondaryRegions.length > 0 && (
                        <div style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '16px',
                            padding: '1rem'
                        }}>
                            <div style={{
                                fontSize: '0.7rem', fontWeight: 900, color: '#f59e0b',
                                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <Zap size={14} /> SECONDARY MUSCLE TARGETS
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                {secondaryGroups.join(', ') || 'Synergist Muscles'}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {secondaryRegions.map(region => (
                                    <span key={region} style={{
                                        background: '#f59e0b', color: '#0f172a',
                                        fontSize: '0.75rem', fontWeight: 800,
                                        padding: '4px 10px', borderRadius: '8px'
                                    }}>
                                        {region}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Execution Guide & Science Form Tips */}
                <div style={{
                    background: 'var(--muted-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '1rem'
                }}>
                    <div style={{
                        fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-color)',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <Award size={14} /> FORM & EXECUTION GUIDE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {executionTips.map((tip, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <CheckCircle2 size={16} color="var(--accent-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                    {tip}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ExerciseDetailModal;
