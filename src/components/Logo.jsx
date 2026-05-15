import React from 'react';

const Logo = ({ size = 100, horizontal = false }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: horizontal ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: horizontal ? '0' : '32px'
        }}>
            <div style={{ position: 'relative', width: size, height: size }} className="icon-pulse">
                <svg viewBox="0 0 100 100" width={size} height={size}>
                    <defs>
                        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'var(--accent-color)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    {/* Stylized Dumbbell / Weight Plate */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="4 4" />
                    <rect x="20" y="42" width="60" height="16" rx="4" fill="url(#logo-grad)" />
                    <rect x="15" y="30" width="12" height="40" rx="3" fill="url(#logo-grad)" />
                    <rect x="73" y="30" width="12" height="40" rx="3" fill="url(#logo-grad)" />
                    {/* Glow effect */}
                    <circle cx="50" cy="50" r="30" fill="var(--accent-color)" opacity="0.1" />
                </svg>
            </div>
            <div style={{ textAlign: horizontal ? 'left' : 'center' }}>
                <h1 style={{
                    fontSize: (size * 0.35) + 'px',
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-1.5px',
                    lineHeight: 1
                }} className="text-gradient">
                    BULK<span style={{ color: 'var(--text-primary)' }}>BRO</span>
                </h1>
                <p style={{
                    fontSize: (size * 0.08) + 'px',
                    color: 'var(--text-secondary)',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    margin: '4px 0 0 0',
                    fontWeight: 800,
                    opacity: 0.8
                }}>
                    EST. 2024 • ELITE
                </p>
            </div>
        </div>
    );
};

export default Logo;

