import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';

const PLATE_DENOMINATIONS = [25, 20, 15, 10, 5, 2.5, 1.25];

const PLATE_STYLES = {
    25: { bg: '#ef4444', text: '#ffffff', label: '25', height: '120px', width: '28px', border: 'none' }, // Red
    20: { bg: '#3b82f6', text: '#ffffff', label: '20', height: '112px', width: '28px', border: 'none' }, // Blue
    15: { bg: '#eab308', text: '#000000', label: '15', height: '102px', width: '26px', border: 'none' }, // Yellow
    10: { bg: '#10b981', text: '#ffffff', label: '10', height: '92px', width: '24px', border: 'none' },  // Green
    5: { bg: '#f8fafc', text: '#0f172a', label: '5', height: '78px', width: '22px', border: '1px solid #cbd5e1' }, // White
    2.5: { bg: '#1e293b', text: '#ffffff', label: '2.5', height: '64px', width: '18px', border: 'none' }, // Black
    1.25: { bg: '#64748b', text: '#ffffff', label: '1.25', height: '52px', width: '16px', border: 'none' } // Grey
};

const PlateCalculatorModal = ({ initialWeight, onSave, onClose }) => {
    const [targetWeight, setTargetWeight] = useState(parseFloat(initialWeight) || 20);
    const [barWeight, setBarWeight] = useState(20); // Default 20kg standard bar

    // Calculate weight per side
    const weightPerSide = Math.max(0, (targetWeight - barWeight) / 2);

    // Greedy calculation of plates
    const calculatePlates = () => {
        let remaining = weightPerSide;
        const result = [];
        PLATE_DENOMINATIONS.forEach(denom => {
            const count = Math.floor(remaining / denom);
            for (let i = 0; i < count; i++) {
                result.push(denom);
            }
            remaining = Math.round((remaining % denom) * 100) / 100;
        });
        return {
            plates: result,
            unresolved: remaining
        };
    };

    const { plates, unresolved } = calculatePlates();

    // Summarize plate counts for quick text reading
    const plateSummary = plates.reduce((acc, p) => {
        acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});

    const adjustWeight = (amount) => {
        setTargetWeight(prev => Math.max(0, Math.round((prev + amount) * 100) / 100));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fade-in 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--panel-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '460px',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                animation: 'slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Plate Calculator
                    </h3>
                    <button 
                        onClick={onClose} 
                        style={{
                            background: 'var(--muted-color)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '6px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            boxShadow: 'none'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Weight Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => adjustWeight(-2.5)}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--muted-color)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                boxShadow: 'none'
                            }}
                        >
                            <Minus size={18} />
                        </button>
                        
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={targetWeight}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setTargetWeight(isNaN(val) ? '' : val);
                                    }}
                                    onBlur={() => {
                                        if (targetWeight === '' || targetWeight < 0) {
                                            setTargetWeight(20);
                                        }
                                    }}
                                    style={{
                                        width: '120px',
                                        fontSize: '2.2rem',
                                        fontWeight: 900,
                                        border: 'none',
                                        background: 'none',
                                        textAlign: 'center',
                                        padding: 0,
                                        margin: 0,
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700, marginLeft: '2px' }}>KG</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Target Weight
                            </span>
                        </div>

                        <button
                            onClick={() => adjustWeight(2.5)}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--muted-color)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                boxShadow: 'none'
                            }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Quick Select Buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {[-10, -5, 5, 10].map(amount => (
                            <button
                                key={amount}
                                onClick={() => adjustWeight(amount)}
                                style={{
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '8px',
                                    background: 'var(--muted-color)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    boxShadow: 'none'
                                }}
                            >
                                {amount > 0 ? '+' : ''}{amount}kg
                            </button>
                        ))}
                    </div>
                </div>

                {/* Barbell Weight Toggle */}
                <div style={{ background: 'var(--muted-color)', padding: '0.8rem 1rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Barbell Weight
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {barWeight} kg
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[20, 15, 10, 0].map(w => (
                            <button
                                key={w}
                                onClick={() => setBarWeight(w)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 0',
                                    borderRadius: '10px',
                                    background: barWeight === w ? 'var(--accent-color)' : 'var(--panel-color)',
                                    border: '1px solid var(--border-color)',
                                    color: barWeight === w ? '#ffffff' : 'var(--text-primary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    boxShadow: 'none'
                                }}
                            >
                                {w === 0 ? 'No Bar' : `${w}kg`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visual Barbell Representation */}
                <div style={{
                    height: '160px',
                    background: 'var(--muted-color)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', justifyContent: 'center' }}>
                        {/* Bar Shaft (Center part left-of-sleeve) */}
                        <div style={{
                            width: '40px',
                            height: '14px',
                            background: '#94a3b8',
                            borderTopLeftRadius: '3px',
                            borderBottomLeftRadius: '3px',
                            border: '1px solid #64748b',
                            borderRight: 'none'
                        }} />

                        {/* Barbell Collar (Thick stopper ring) */}
                        <div style={{
                            width: '12px',
                            height: '42px',
                            background: '#cbd5e1',
                            border: '1px solid #64748b',
                            borderRadius: '3px',
                            zIndex: 2
                        }} />

                        {/* Barbell Sleeve (Where plates sit) */}
                        <div style={{
                            width: '180px',
                            height: '20px',
                            background: '#cbd5e1',
                            border: '1px solid #475569',
                            borderLeft: 'none',
                            borderTopRightRadius: '4px',
                            borderBottomRightRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '4px',
                            gap: '2px',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {/* Plates rendered stack-wise */}
                            {plates.map((denom, index) => {
                                const style = PLATE_STYLES[denom];
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            width: style.width,
                                            height: style.height,
                                            backgroundColor: style.bg,
                                            color: style.text,
                                            border: style.border,
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.6rem',
                                            fontWeight: 900,
                                            boxShadow: '2px 0 5px rgba(0,0,0,0.15)',
                                            flexShrink: 0,
                                            zIndex: 5
                                        }}
                                    >
                                        <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                                            {style.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, marginTop: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Visual loading for one side
                    </div>
                </div>

                {/* Plates Breakdown Summary */}
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Plates needed (Each side)
                    </div>
                    {plates.length === 0 ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, fontStyle: 'italic' }}>
                            {weightPerSide === 0 ? 'No plates needed. Just lift the bar!' : 'Weight is lighter than the bar!'}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {Object.entries(plateSummary).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])).map(([denom, count]) => {
                                const style = PLATE_STYLES[denom];
                                return (
                                    <div
                                        key={denom}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: 'var(--muted-color)',
                                            border: '1px solid var(--border-color)',
                                            padding: '4px 10px',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '3px',
                                            backgroundColor: style.bg,
                                            border: style.border,
                                            boxShadow: 'inset 0 0 2px rgba(0,0,0,0.2)'
                                        }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                            {denom} kg × {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {unresolved > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--error-color)', fontWeight: 700, marginTop: '8px' }}>
                            * Remainder: {unresolved} kg (Not loadable with standard plates)
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                    <button
                        onClick={() => onSave(targetWeight)}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '14px',
                            background: 'var(--accent-gradient)',
                            color: '#ffffff',
                            fontWeight: 800,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '0.85rem'
                        }}
                    >
                        <Check size={16} /> Apply Weight
                    </button>
                    <button
                        className="secondary"
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '14px',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlateCalculatorModal;
