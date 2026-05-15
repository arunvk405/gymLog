import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
    isSameDay, isToday
} from 'date-fns';

const CustomDatePicker = ({ value, onChange, onClose, maxDate, align = 'left' }) => {
    const selectedDate = value ? new Date(value + 'T12:00:00') : new Date();
    const [viewDate, setViewDate] = useState(selectedDate);

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(viewDate));
        const end = endOfWeek(endOfMonth(viewDate));
        return eachDayOfInterval({ start, end });
    }, [viewDate]);

    const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const pick = (date) => {
        if (maxDate && date > new Date(maxDate + 'T23:59:59')) return;
        onChange(format(date, 'yyyy-MM-dd'));
        onClose();
    };

    return (
        <>
            {/* Full-screen transparent trap — click outside to close */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 998,
                    background: 'transparent',
                }}
            />

            {/* Calendar dropdown */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    ...(align === 'right' ? { right: 0 } : align === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : { left: 0 }),
                    zIndex: 9999,
                    background: 'var(--panel-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1rem',
                    width: '290px',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
                }}
            >
                {/* Month navigation */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.9rem',
                }}>
                    <button
                        className="dp-btn"
                        onClick={() => setViewDate(v => subMonths(v, 1))}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--muted-color)' }}
                    >
                        <ChevronLeft size={16} color="var(--text-primary)" />
                    </button>

                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {format(viewDate, 'MMMM yyyy')}
                    </span>

                    <button
                        className="dp-btn"
                        onClick={() => setViewDate(v => addMonths(v, 1))}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--muted-color)' }}
                    >
                        <ChevronRight size={16} color="var(--text-primary)" />
                    </button>
                </div>

                {/* Weekday labels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.3rem' }}>
                    {WEEK.map((d, i) => (
                        <div key={i} style={{
                            textAlign: 'center', fontSize: '0.6rem',
                            fontWeight: 700, color: 'var(--text-secondary)',
                        }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                    {days.map((date, i) => {
                        const sel = isSameDay(date, selectedDate);
                        const inMonth = isSameMonth(date, viewDate);
                        const tod = isToday(date);
                        const dis = maxDate && date > new Date(maxDate + 'T23:59:59');

                        return (
                            <button
                                key={i}
                                className="dp-btn"
                                onClick={() => !dis && pick(date)}
                                style={{
                                    aspectRatio: '1/1',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: sel ? 800 : 500,
                                    cursor: dis ? 'not-allowed' : 'pointer',
                                    background: sel
                                        ? 'var(--accent-color)'
                                        : tod ? 'var(--muted-color)' : 'transparent',
                                    color: sel ? 'white'
                                        : inMonth ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    opacity: (!inMonth || dis) ? 0.3 : 1,
                                }}
                            >
                                {format(date, 'd')}
                            </button>
                        );
                    })}
                </div>

                {/* Today shortcut */}
                <button
                    className="dp-btn"
                    onClick={() => pick(new Date())}
                    style={{
                        width: '100%', marginTop: '0.9rem',
                        padding: '0.6rem', borderRadius: '12px',
                        background: 'var(--muted-color)',
                        color: 'var(--accent-color)',
                        fontSize: '0.8rem', fontWeight: 800,
                        display: 'flex', justifyContent: 'center',
                    }}
                >
                    TODAY
                </button>
            </div>
        </>
    );
};

export default CustomDatePicker;
