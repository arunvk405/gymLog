import React, { useState, useEffect } from 'react';
import { Scale, Percent, Check, Loader2, Calendar, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

const WeightLogModal = ({ onSave, onCancel, onDelete, initialData, currentWeight, currentBodyfat }) => {
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const isEdit = !!initialData?.id;

    // Resolve initial date in YYYY-MM-DD format
    const getInitialDate = () => {
        if (initialData?.date) {
            try {
                return initialData.date.split('T')[0];
            } catch (e) {}
        }
        if (initialData?.timestamp) {
            try {
                return format(new Date(initialData.timestamp), 'yyyy-MM-dd');
            } catch (e) {}
        }
        return format(new Date(), 'yyyy-MM-dd');
    };

    const [weight, setWeight] = useState(initialData?.weight !== undefined ? initialData.weight : (currentWeight || ''));
    const [bodyfat, setBodyfat] = useState(initialData?.bodyfat !== undefined && initialData?.bodyfat > 0 ? initialData.bodyfat : (currentBodyfat || ''));
    const [date, setDate] = useState(getInitialDate());
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weight) return;
        setLoading(true);
        try {
            await onSave({
                id: initialData?.id,
                weight: parseFloat(weight),
                bodyfat: bodyfat !== '' ? parseFloat(bodyfat) : 0,
                customDate: date
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !initialData?.id) return;
        setDeleting(true);
        try {
            await onDelete(initialData.id);
        } finally {
            setDeleting(false);
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
            padding: 'calc(1.5rem + env(safe-area-inset-top, 0px)) calc(1rem + env(safe-area-inset-right, 0px)) calc(1.5rem + env(safe-area-inset-bottom, 0px)) calc(1rem + env(safe-area-inset-left, 0px))'
        }}>
            <div className="panel fade-in" style={{ width: '100%', maxWidth: '420px', border: '1px solid var(--accent-color)', position: 'relative' }}>
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        padding: '4px',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '18px',
                        background: 'rgba(88, 166, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.8rem',
                        color: 'var(--accent-color)'
                    }}>
                        <Scale size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{isEdit ? 'Edit Weight Log' : 'Log Body Weight'}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                        {isEdit ? 'Update or correct this weight entry' : 'Track your bodyweight and progress over time'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.8rem' }}>
                        {/* Date Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                Date
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>

                        {/* Weight Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                Body Weight (kg) *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Scale size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="number"
                                    step="0.01"
                                    max="500"
                                    min="20"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="e.g. 75.5"
                                    required
                                    style={{ paddingLeft: '40px' }}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Body Fat Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                                Body Fat % <span style={{ opacity: 0.6, textTransform: 'none' }}>(optional)</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Percent size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="number"
                                    step="0.1"
                                    max="60"
                                    min="3"
                                    value={bodyfat}
                                    onChange={(e) => setBodyfat(e.target.value)}
                                    placeholder="e.g. 15.0"
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delete Confirmation Alert */}
                    {showDeleteConfirm && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '1.2rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--error-color)', marginBottom: '8px' }}>
                                Delete this weight log?
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    style={{ background: 'var(--error-color)', color: 'white', padding: '6px 12px', fontSize: '0.75rem' }}
                                >
                                    {deleting ? <Loader2 size={14} className="spin" /> : 'Confirm Delete'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {isEdit && !showDeleteConfirm && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--error-color)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    padding: '0 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Delete Log"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            type="button"
                            className="secondary"
                            onClick={onCancel}
                            style={{ flex: 1 }}
                            disabled={loading || deleting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            disabled={loading || deleting || !weight}
                        >
                            {loading ? <Loader2 size={18} className="spin" /> : <><Check size={18} /> {isEdit ? 'Save Changes' : 'Save Progress'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WeightLogModal;
