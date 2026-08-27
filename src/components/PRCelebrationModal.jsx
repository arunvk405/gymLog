import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, Trophy, Zap, X, Flame, Sparkles } from 'lucide-react';

const PRCelebrationModal = ({ prData, onClose }) => {
    useEffect(() => {
        if (!prData) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [prData]);

    if (!prData) return null;

    const { exerciseName, weight, reps, estimated1RM, prevMax } = prData;

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 7000,
            background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            overflow: 'hidden'
        }} onClick={onClose}>
            <div
                className="fade-in"
                style={{
                    background: 'linear-gradient(145deg, var(--panel-color) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    border: '2px solid var(--accent-color)',
                    borderRadius: '28px',
                    padding: '2rem 1.5rem',
                    width: '100%',
                    maxWidth: '420px',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px rgba(56, 189, 248, 0.3)',
                    position: 'relative',
                    color: 'var(--text-primary)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Glowing Trophy Icon Header */}
                <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    boxShadow: '0 0 30px var(--accent-color)'
                }}>
                    <Trophy size={36} color="white" />
                </div>

                <div style={{
                    fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-color)',
                    textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                    <Sparkles size={14} /> NEW PERSONAL RECORD <Sparkles size={14} />
                </div>

                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 900 }} className="text-gradient">
                    {exerciseName}
                </h2>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
                    Congratulations! You just smashed your previous best!
                </p>

                {/* PR Numbers Highlight Card */}
                <div style={{
                    background: 'var(--muted-color)', border: '1px solid var(--border-color)',
                    borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
                }}>
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>BEST SET</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-color)' }}>
                            {weight} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>KG</span> × {reps}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>EST. 1RM MAX</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b' }}>
                            {Math.round(estimated1RM)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>KG</span>
                        </div>
                    </div>
                </div>

                {prevMax > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 800, marginBottom: '1.5rem' }}>
                        🔥 Improved from previous max of {prevMax} KG (+{(weight - prevMax).toFixed(1)} KG)!
                    </div>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '0.9rem', borderRadius: '16px', fontWeight: 900,
                        background: 'var(--accent-gradient)', color: 'white', border: 'none',
                        fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '1px',
                        boxShadow: '0 6px 20px rgba(56, 189, 248, 0.4)'
                    }}
                >
                    KEEP CRUSHING IT! 🏋️‍♂️
                </button>
            </div>
        </div>,
        document.body
    );
};

export default PRCelebrationModal;
