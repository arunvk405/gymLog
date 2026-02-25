import React from 'react';

const Logo = ({ size = 100, horizontal = false }) => {
    const primaryColor = '#58a6ff'; // Accent color from App.css
    const secondaryColor = '#3fb950'; // Success color from App.css

    return (
        <div style={{
            display: 'flex',
            flexDirection: horizontal ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '32px'
        }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg viewBox="0 0 100 100" width={size} height={size}>
                    <defs>
                        <linearGradient id="gym-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: primaryColor, stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#1f6feb', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gym-grad)" strokeWidth="4" />
                    <path
                        d="M30 50 L45 65 L70 35"
                        fill="none"
                        stroke={secondaryColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M20 50 H80 M50 20 V80"
                        stroke="white"
                        strokeWidth="2"
                        opacity="0.2"
                    />
                </svg>
            </div>
            <div style={{ textAlign: horizontal ? 'left' : 'center' }}>
                <h1 style={{
                    fontSize: (size * 0.4) + 'px',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '-1px',
                    color: 'white'
                }}>
                    Gym<span style={{ color: primaryColor }}>Log</span>
                </h1>
                <p style={{
                    fontSize: (size * 0.1) + 'px',
                    color: 'var(--text-secondary)',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    margin: '-4px 0 0 0',
                    fontWeight: 600
                }}>
                    STRENGTH MINDFULNESS
                </p>
            </div>
        </div>
    );
};

export default Logo;
