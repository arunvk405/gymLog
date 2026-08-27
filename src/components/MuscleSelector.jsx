import React, { useState } from 'react';
import { MUSCLE_HIERARCHY, ALL_MUSCLE_GROUPS, getMuscleRegions } from '../data/muscles';
import { Check, ChevronRight, Layers, Target } from 'lucide-react';

/**
 * Hierarchical Muscle Selector UI Component
 * Workflow: Muscle Group -> Muscle Region / Head
 */
const MuscleSelector = ({
    selectedGroup = 'Chest',
    selectedRegions = [],
    onSelectGroup = () => {},
    onToggleRegion = () => {},
    isMultiSelect = true,
    title = "Target Muscle Classification"
}) => {
    const [activeGroup, setActiveGroup] = useState(selectedGroup || ALL_MUSCLE_GROUPS[0]);
    const availableRegions = getMuscleRegions(activeGroup);

    const handleGroupClick = (group) => {
        setActiveGroup(group);
        onSelectGroup(group);
    };

    const handleRegionClick = (region) => {
        onToggleRegion(region, activeGroup);
    };

    return (
        <div style={{
            background: 'var(--panel-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1rem'
        }}>
            {title && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '0.8rem', color: 'var(--text-secondary)',
                    fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                    <Target size={14} color="var(--accent-color)" />
                    <span>{title}</span>
                </div>
            )}

            {/* Step 1: Major Muscle Group Chips */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
                    1. SELECT MAJOR MUSCLE GROUP
                </div>
                <div style={{
                    display: 'flex', gap: '6px', overflowX: 'auto', overflowY: 'hidden',
                    paddingBottom: '6px', scrollbarWidth: 'thin', overscrollBehavior: 'contain'
                }}>
                    {ALL_MUSCLE_GROUPS.map((group) => {
                        const isActive = activeGroup === group;
                        const hasSelectedRegionsInGroup = getMuscleRegions(group).some(r => selectedRegions.includes(r));

                        return (
                            <button
                                key={group}
                                type="button"
                                onClick={() => handleGroupClick(group)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    border: isActive ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                                    background: isActive ? 'var(--accent-color)' : (hasSelectedRegionsInGroup ? 'var(--muted-color)' : 'var(--bg-color)'),
                                    color: isActive ? 'white' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {group}
                                {hasSelectedRegionsInGroup && !isActive && (
                                    <span style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: 'var(--accent-color)'
                                    }}></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step 2: Specific Region / Head Pills */}
            <div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px'
                }}>
                    <span>2. SELECT SPECIFIC REGION / HEAD ({activeGroup})</span>
                    <span style={{ color: 'var(--accent-color)' }}>
                        {selectedRegions.filter(r => availableRegions.includes(r)).length} selected
                    </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableRegions.map((region) => {
                        const isSelected = selectedRegions.includes(region);

                        return (
                            <button
                                key={region}
                                type="button"
                                onClick={() => handleRegionClick(region)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-color)',
                                    color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {isSelected ? (
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: 'var(--accent-color)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        <Check size={10} strokeWidth={3} />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        border: '1px solid var(--border-color)'
                                    }}></div>
                                )}
                                <span>{region}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MuscleSelector;
