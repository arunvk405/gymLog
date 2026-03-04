import React, { useState } from 'react';
import { Scale, Percent, Check, Loader2 } from 'lucide-react';

const WeightLogModal = ({ onSave, onCancel, currentWeight, currentBodyfat }) => {
    const [weight, setWeight] = useState(currentWeight || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weight) return;
        setLoading(true);
        try {
            await onSave(weight);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem'
        }}>
            <div className="panel fade-in" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--accent-color)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '20px',
                        background: 'rgba(88, 166, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'var(--accent-color)'
                    }}>
                        <Scale size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Weekly Check-in</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        It's Monday! Let's track your progress.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                            Current Weight (kg)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Scale size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g. 75.5"
                                required
                                style={{ paddingLeft: '40px' }}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            className="secondary"
                            onClick={onCancel}
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            Later
                        </button>
                        <button
                            type="submit"
                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            disabled={loading || !weight}
                        >
                            {loading ? <Loader2 size={20} className="spin" /> : <><Check size={20} /> Save Progress</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WeightLogModal;
