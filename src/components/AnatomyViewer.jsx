import React, { useState } from 'react';
import { MUSCLE_HIERARCHY, getGroupForRegion } from '../data/muscles';

/**
 * Interactive SVG Human Muscle Anatomy Visualization
 * Supports Front and Back anatomical views with detailed muscle head highlighting.
 */
const AnatomyViewer = ({
    primaryRegions = [],
    secondaryRegions = [],
    primaryGroup = null,
    onRegionClick = null,
    interactive = false,
    viewMode: initialViewMode = 'both', // 'front', 'back', 'both'
    height = 360,
    className = ""
}) => {
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const [activeTab, setActiveTab] = useState(initialViewMode);

    const isPrimary = (region) => {
        if (!region) return false;
        if (primaryRegions.includes(region)) return true;
        if (primaryGroup && getGroupForRegion(region) === primaryGroup && primaryRegions.length === 0) return true;
        return false;
    };

    const isSecondary = (region) => {
        if (!region) return false;
        return secondaryRegions.includes(region) && !isPrimary(region);
    };

    const getFillColor = (region) => {
        if (hoveredRegion === region) return '#60a5fa'; // Bright blue hover
        if (isPrimary(region)) return '#38bdf8'; // Primary Target Cyan
        if (isSecondary(region)) return '#f59e0b'; // Secondary Target Amber/Gold
        return 'var(--muted-color, #1e293b)'; // Neutral base
    };

    const getStrokeColor = (region) => {
        if (hoveredRegion === region) return '#93c5fd';
        if (isPrimary(region)) return '#0284c7';
        if (isSecondary(region)) return '#d97706';
        return 'var(--border-color, #334155)';
    };

    const getFilterGlow = (region) => {
        if (isPrimary(region)) return 'drop-shadow(0px 0px 6px rgba(56, 189, 248, 0.8))';
        if (isSecondary(region)) return 'drop-shadow(0px 0px 6px rgba(245, 158, 11, 0.8))';
        if (hoveredRegion === region) return 'drop-shadow(0px 0px 4px rgba(96, 165, 250, 0.6))';
        return 'none';
    };

    const handleMouseOver = (region) => {
        setHoveredRegion(region);
    };

    const handleMouseLeave = () => {
        setHoveredRegion(null);
    };

    const handleClick = (region) => {
        if (interactive && onRegionClick) {
            onRegionClick(region, getGroupForRegion(region));
        }
    };

    const renderMusclePath = (id, regionName, pathD, extraProps = {}) => {
        const primary = isPrimary(regionName);
        const secondary = isSecondary(regionName);
        const isHovered = hoveredRegion === regionName;

        return (
            <path
                key={id}
                d={pathD}
                fill={getFillColor(regionName)}
                stroke={getStrokeColor(regionName)}
                strokeWidth={isHovered || primary || secondary ? "1.5" : "0.75"}
                style={{
                    filter: getFilterGlow(regionName),
                    cursor: interactive ? 'pointer' : 'default',
                    transition: 'all 0.25s ease'
                }}
                onMouseOver={() => handleMouseOver(regionName)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(regionName)}
                {...extraProps}
            >
                <title>{regionName} ({getGroupForRegion(regionName)})</title>
            </path>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }} className={className}>
            {/* View Selector Tabs if set to switchable */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', background: 'var(--panel-color)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('both')}
                    style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                        border: 'none', background: activeTab === 'both' ? 'var(--accent-color)' : 'transparent',
                        color: activeTab === 'both' ? 'white' : 'var(--text-secondary)', cursor: 'pointer'
                    }}
                >
                    FULL VIEW
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('front')}
                    style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                        border: 'none', background: activeTab === 'front' ? 'var(--accent-color)' : 'transparent',
                        color: activeTab === 'front' ? 'white' : 'var(--text-secondary)', cursor: 'pointer'
                    }}
                >
                    ANTERIOR (FRONT)
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('back')}
                    style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                        border: 'none', background: activeTab === 'back' ? 'var(--accent-color)' : 'transparent',
                        color: activeTab === 'back' ? 'white' : 'var(--text-secondary)', cursor: 'pointer'
                    }}
                >
                    POSTERIOR (BACK)
                </button>
            </div>

            {/* Hovered / Active Region Tooltip */}
            <div style={{
                height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '8px', fontSize: '0.75rem', fontWeight: 800
            }}>
                {hoveredRegion ? (
                    <span style={{ color: 'var(--accent-color)', background: 'var(--muted-color)', padding: '2px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        {hoveredRegion} ({getGroupForRegion(hoveredRegion)})
                    </span>
                ) : (
                    <span style={{ color: 'var(--text-secondary)', opacity: 0.6, fontSize: '0.7rem' }}>
                        {interactive ? 'Tap muscle region to select' : (primaryRegions.length > 0 ? `Target: ${primaryRegions.join(', ')}` : 'Muscle Anatomy')}
                    </span>
                )}
            </div>

            {/* SVG Anatomy Canvas */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%', overflowX: 'auto' }}>
                {/* FRONT VIEW */}
                {(activeTab === 'front' || activeTab === 'both') && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ANTERIOR</div>
                        <svg viewBox="0 0 200 400" style={{ height: `${height}px`, width: 'auto' }}>
                            {/* Body Contour Outline */}
                            <path
                                d="M100 20 C85 20 80 32 80 45 C80 55 86 62 88 70 C72 75 60 85 52 105 C46 120 40 150 36 185 C34 200 32 230 38 250 C42 260 48 255 48 240 C52 210 56 180 60 160 C62 185 64 220 62 260 C60 300 56 340 58 375 C60 385 70 388 78 388 C84 388 88 370 88 340 C88 310 88 270 92 230 C94 210 96 200 100 200 C104 200 106 210 108 230 C112 270 112 310 112 340 C112 370 116 388 122 388 C130 388 140 385 142 375 C144 340 140 300 138 260 C136 220 138 185 140 160 C144 180 148 210 152 240 C152 255 158 260 162 250 C168 230 166 200 164 185 C160 150 154 120 148 105 C140 85 128 75 112 70 C114 62 120 55 120 45 C120 32 115 20 100 20 Z"
                                fill="none" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"
                            />

                            {/* Head & Neck */}
                            <circle cx="100" cy="42" r="16" fill="var(--muted-color)" stroke="var(--border-color)" strokeWidth="1" opacity="0.3" />

                            {/* CHEST REGIONS */}
                            {/* Upper Chest */}
                            {renderMusclePath('f_chest_upper_l', 'Upper Chest', "M 100 78 L 78 80 C 74 90 85 100 100 98 Z")}
                            {renderMusclePath('f_chest_upper_r', 'Upper Chest', "M 100 78 L 122 80 C 126 90 115 100 100 98 Z")}

                            {/* Mid Chest */}
                            {renderMusclePath('f_chest_mid_l', 'Mid Chest', "M 100 98 C 84 100 72 108 76 122 C 86 124 96 120 100 115 Z")}
                            {renderMusclePath('f_chest_mid_r', 'Mid Chest', "M 100 98 C 116 100 128 108 124 122 C 114 124 104 120 100 115 Z")}

                            {/* Lower Chest */}
                            {renderMusclePath('f_chest_lower_l', 'Lower Chest', "M 100 115 C 94 120 84 124 76 122 C 80 130 92 134 100 128 Z")}
                            {renderMusclePath('f_chest_lower_r', 'Lower Chest', "M 100 115 C 106 120 116 124 124 122 C 120 130 108 134 100 128 Z")}

                            {/* SHOULDERS */}
                            {/* Front Deltoid */}
                            {renderMusclePath('f_delt_front_l', 'Front Deltoid', "M 74 76 C 64 80 60 92 62 104 C 68 102 72 90 76 80 Z")}
                            {renderMusclePath('f_delt_front_r', 'Front Deltoid', "M 126 76 C 136 80 140 92 138 104 C 132 102 128 90 124 80 Z")}

                            {/* Side Deltoid (Front view profile) */}
                            {renderMusclePath('f_delt_side_l', 'Side Deltoid', "M 62 82 C 54 88 52 102 56 112 C 60 108 62 96 64 88 Z")}
                            {renderMusclePath('f_delt_side_r', 'Side Deltoid', "M 138 82 C 146 88 148 102 144 112 C 140 108 138 96 136 88 Z")}

                            {/* BICEPS & BRACHIALIS */}
                            {/* Biceps Long Head (Outer) */}
                            {renderMusclePath('f_biceps_long_l', 'Biceps Long Head', "M 58 114 C 54 124 54 144 60 154 C 64 148 64 128 62 118 Z")}
                            {renderMusclePath('f_biceps_long_r', 'Biceps Long Head', "M 142 114 C 146 124 146 144 140 154 C 136 148 136 128 138 118 Z")}

                            {/* Biceps Short Head (Inner) */}
                            {renderMusclePath('f_biceps_short_l', 'Biceps Short Head', "M 62 118 C 64 128 64 148 60 154 C 68 152 72 136 68 122 Z")}
                            {renderMusclePath('f_biceps_short_r', 'Biceps Short Head', "M 138 118 C 136 128 136 148 140 154 C 132 152 128 136 132 122 Z")}

                            {/* Brachialis */}
                            {renderMusclePath('f_brachialis_l', 'Brachialis', "M 56 132 C 54 138 54 146 58 152 C 58 144 58 138 56 132 Z")}
                            {renderMusclePath('f_brachialis_r', 'Brachialis', "M 144 132 C 146 138 146 146 142 152 C 142 144 142 138 144 132 Z")}

                            {/* FOREARMS */}
                            {/* Brachioradialis */}
                            {renderMusclePath('f_brachioradialis_l', 'Brachioradialis', "M 58 156 C 50 166 46 182 48 198 C 52 186 56 170 60 160 Z")}
                            {renderMusclePath('f_brachioradialis_r', 'Brachioradialis', "M 142 156 C 150 166 154 182 152 198 C 148 186 144 170 140 160 Z")}

                            {/* Forearm Flexors */}
                            {renderMusclePath('f_forearm_flexors_l', 'Forearm Flexors', "M 60 160 C 56 172 52 192 50 208 C 56 198 60 182 62 166 Z")}
                            {renderMusclePath('f_forearm_flexors_r', 'Forearm Flexors', "M 140 160 C 144 172 148 192 150 208 C 144 198 140 182 138 166 Z")}

                            {/* Forearm Extensors */}
                            {renderMusclePath('f_forearm_extensors_l', 'Forearm Extensors', "M 48 198 C 44 212 40 232 44 246 C 46 230 48 214 50 208 Z")}
                            {renderMusclePath('f_forearm_extensors_r', 'Forearm Extensors', "M 152 198 C 156 212 160 232 156 246 C 154 230 152 214 150 208 Z")}

                            {/* ABDOMINALS */}
                            {/* Upper Abs */}
                            {renderMusclePath('f_abs_upper', 'Upper Abs', "M 86 132 L 114 132 L 112 150 L 88 150 Z")}

                            {/* Lower Abs */}
                            {renderMusclePath('f_abs_lower', 'Lower Abs', "M 88 152 L 112 152 L 108 178 L 92 178 Z")}

                            {/* Transverse Abdominis */}
                            {renderMusclePath('f_transverse_abs', 'Transverse Abdominis', "M 92 180 L 108 180 L 104 196 L 96 196 Z")}

                            {/* OBLIQUES */}
                            {/* External Obliques */}
                            {renderMusclePath('f_obliques_ext_l', 'External Obliques', "M 76 130 C 72 145 74 165 84 178 L 86 150 Z")}
                            {renderMusclePath('f_obliques_ext_r', 'External Obliques', "M 124 130 C 128 145 126 165 116 178 L 114 150 Z")}

                            {/* Internal Obliques */}
                            {renderMusclePath('f_obliques_int_l', 'Internal Obliques', "M 84 178 C 82 184 84 192 90 196 L 92 180 Z")}
                            {renderMusclePath('f_obliques_int_r', 'Internal Obliques', "M 116 178 C 118 184 116 192 110 196 L 108 180 Z")}

                            {/* QUADRICEPS */}
                            {/* Rectus Femoris (Central Quad) */}
                            {renderMusclePath('f_quad_rectus_l', 'Rectus Femoris', "M 86 204 C 80 220 78 260 84 286 C 88 260 90 220 88 204 Z")}
                            {renderMusclePath('f_quad_rectus_r', 'Rectus Femoris', "M 114 204 C 120 220 122 260 116 286 C 112 260 110 220 112 204 Z")}

                            {/* Vastus Lateralis (Outer Quad) */}
                            {renderMusclePath('f_quad_lateralis_l', 'Vastus Lateralis', "M 70 208 C 62 230 60 260 74 282 C 76 260 78 230 84 212 Z")}
                            {renderMusclePath('f_quad_lateralis_r', 'Vastus Lateralis', "M 130 208 C 138 230 140 260 126 282 C 124 260 122 230 116 212 Z")}

                            {/* Vastus Medialis (Inner Lower Quad / Teardrop) */}
                            {renderMusclePath('f_quad_medialis_l', 'Vastus Medialis', "M 86 270 C 82 280 84 294 92 296 C 94 288 92 278 88 270 Z")}
                            {renderMusclePath('f_quad_medialis_r', 'Vastus Medialis', "M 114 270 C 118 280 116 294 108 296 C 106 288 108 278 112 270 Z")}

                            {/* Vastus Intermedius (Deep central thigh) */}
                            {renderMusclePath('f_quad_intermedius_l', 'Vastus Intermedius', "M 88 204 C 88 220 88 240 86 250 L 92 250 Z")}
                            {renderMusclePath('f_quad_intermedius_r', 'Vastus Intermedius', "M 112 204 C 112 220 112 240 114 250 L 108 250 Z")}

                            {/* CALVES */}
                            {/* Gastrocnemius (Front view inner/outer profile) */}
                            {renderMusclePath('f_gastrocnemius_l', 'Gastrocnemius', "M 66 312 C 60 330 62 352 74 362 C 78 350 78 330 74 316 Z")}
                            {renderMusclePath('f_gastrocnemius_r', 'Gastrocnemius', "M 134 312 C 140 330 138 352 126 362 C 122 350 122 330 126 316 Z")}

                            {/* Soleus */}
                            {renderMusclePath('f_soleus_l', 'Soleus', "M 74 362 C 72 370 74 378 78 382 C 80 376 80 368 76 362 Z")}
                            {renderMusclePath('f_soleus_r', 'Soleus', "M 126 362 C 128 370 126 378 122 382 C 120 376 120 368 124 362 Z")}
                        </svg>
                    </div>
                )}

                {/* BACK VIEW */}
                {(activeTab === 'back' || activeTab === 'both') && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>POSTERIOR</div>
                        <svg viewBox="0 0 200 400" style={{ height: `${height}px`, width: 'auto' }}>
                            {/* Body Contour Outline */}
                            <path
                                d="M100 20 C85 20 80 32 80 45 C80 55 86 62 88 70 C72 75 60 85 52 105 C46 120 40 150 36 185 C34 200 32 230 38 250 C42 260 48 255 48 240 C52 210 56 180 60 160 C62 185 64 220 62 260 C60 300 56 340 58 375 C60 385 70 388 78 388 C84 388 88 370 88 340 C88 310 88 270 92 230 C94 210 96 200 100 200 C104 200 106 210 108 230 C112 270 112 310 112 340 C112 370 116 388 122 388 C130 388 140 385 142 375 C144 340 140 300 138 260 C136 220 138 185 140 160 C144 180 148 210 152 240 C152 255 158 260 162 250 C168 230 166 200 164 185 C160 150 154 120 148 105 C140 85 128 75 112 70 C114 62 120 55 120 45 C120 32 115 20 100 20 Z"
                                fill="none" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"
                            />

                            {/* Head & Neck Back */}
                            <circle cx="100" cy="42" r="16" fill="var(--muted-color)" stroke="var(--border-color)" strokeWidth="1" opacity="0.3" />

                            {/* TRAPEZIUS */}
                            {renderMusclePath('b_traps', 'Trapezius', "M 100 52 L 86 68 L 76 76 L 100 105 L 124 76 L 114 68 Z")}

                            {/* SHOULDERS - REAR & SIDE DELTS */}
                            {/* Rear Deltoid */}
                            {renderMusclePath('b_delt_rear_l', 'Rear Deltoid', "M 76 76 C 64 80 58 92 60 104 C 68 102 72 90 76 80 Z")}
                            {renderMusclePath('b_delt_rear_r', 'Rear Deltoid', "M 124 76 C 136 80 142 92 140 104 C 132 102 128 90 124 80 Z")}

                            {/* Side Deltoid (Back view profile) */}
                            {renderMusclePath('b_delt_side_l', 'Side Deltoid', "M 60 82 C 52 88 50 102 54 112 C 58 108 60 96 62 88 Z")}
                            {renderMusclePath('b_delt_side_r', 'Side Deltoid', "M 140 82 C 148 88 150 102 146 112 C 142 108 140 96 138 88 Z")}

                            {/* RHOMBOIDS */}
                            {renderMusclePath('b_rhomboids_l', 'Rhomboids', "M 100 90 L 86 96 L 90 110 L 100 105 Z")}
                            {renderMusclePath('b_rhomboids_r', 'Rhomboids', "M 100 90 L 114 96 L 110 110 L 100 105 Z")}

                            {/* BACK - UPPER & MID BACK */}
                            {renderMusclePath('b_upper_back', 'Upper Back', "M 100 75 L 82 82 L 88 104 L 100 100 L 112 104 L 118 82 Z")}
                            {renderMusclePath('b_mid_back', 'Mid Back', "M 100 105 L 86 112 L 90 135 L 100 140 L 110 135 L 114 112 Z")}

                            {/* LATS (Latissimus Dorsi) */}
                            {renderMusclePath('b_lats_l', 'Lats', "M 86 108 C 72 120 70 145 88 160 C 92 145 90 125 86 108 Z")}
                            {renderMusclePath('b_lats_r', 'Lats', "M 114 108 C 128 120 130 145 112 160 C 108 145 110 125 114 108 Z")}

                            {/* LOWER BACK */}
                            {renderMusclePath('b_lower_back', 'Lower Back', "M 100 140 L 88 145 L 86 174 L 100 178 L 114 174 L 112 145 Z")}

                            {/* TRICEPS */}
                            {/* Triceps Long Head */}
                            {renderMusclePath('b_tri_long_l', 'Triceps Long Head', "M 62 110 C 64 122 66 138 62 152 C 58 142 58 126 60 116 Z")}
                            {renderMusclePath('b_tri_long_r', 'Triceps Long Head', "M 138 110 C 136 122 134 138 138 152 C 142 142 142 126 140 116 Z")}

                            {/* Triceps Lateral Head */}
                            {renderMusclePath('b_tri_lateral_l', 'Triceps Lateral Head', "M 56 114 C 52 124 50 136 54 148 C 58 140 60 126 58 118 Z")}
                            {renderMusclePath('b_tri_lateral_r', 'Triceps Lateral Head', "M 144 114 C 148 124 150 136 146 148 C 142 140 140 126 142 118 Z")}

                            {/* Triceps Medial Head */}
                            {renderMusclePath('b_tri_medial_l', 'Triceps Medial Head', "M 62 146 C 60 152 58 156 60 160 C 62 156 64 150 62 146 Z")}
                            {renderMusclePath('b_tri_medial_r', 'Triceps Medial Head', "M 138 146 C 140 152 142 156 140 160 C 138 156 136 150 138 146 Z")}

                            {/* GLUTES */}
                            {/* Gluteus Medius */}
                            {renderMusclePath('b_glute_medius_l', 'Gluteus Medius', "M 86 174 C 74 178 70 190 74 200 C 80 194 86 186 88 178 Z")}
                            {renderMusclePath('b_glute_medius_r', 'Gluteus Medius', "M 114 174 C 126 178 130 190 126 200 C 120 194 114 186 112 178 Z")}

                            {/* Gluteus Minimus (Deep lateral glute) */}
                            {renderMusclePath('b_glute_minimus_l', 'Gluteus Minimus', "M 74 176 C 70 182 68 188 70 192 L 74 186 Z")}
                            {renderMusclePath('b_glute_minimus_r', 'Gluteus Minimus', "M 126 176 C 130 182 132 188 130 192 L 126 186 Z")}

                            {/* Gluteus Maximus */}
                            {renderMusclePath('b_glute_maximus_l', 'Gluteus Maximus', "M 100 178 L 88 178 C 76 190 76 220 96 230 C 100 216 100 196 100 178 Z")}
                            {renderMusclePath('b_glute_maximus_r', 'Gluteus Maximus', "M 100 178 L 112 178 C 124 190 124 220 104 230 C 100 216 100 196 100 178 Z")}

                            {/* HAMSTRINGS */}
                            {/* Biceps Femoris (Outer Hamstring) */}
                            {renderMusclePath('b_ham_biceps_l', 'Biceps Femoris', "M 76 232 C 68 250 68 280 78 296 C 82 280 82 250 82 232 Z")}
                            {renderMusclePath('b_ham_biceps_r', 'Biceps Femoris', "M 124 232 C 132 250 132 280 122 296 C 118 280 118 250 118 232 Z")}

                            {/* Semitendinosus (Inner Hamstring) */}
                            {renderMusclePath('b_ham_semitend_l', 'Semitendinosus', "M 84 232 C 84 250 84 280 88 296 C 92 280 94 250 94 232 Z")}
                            {renderMusclePath('b_ham_semitend_r', 'Semitendinosus', "M 116 232 C 116 250 116 280 112 296 C 108 280 106 250 106 232 Z")}

                            {/* Semimembranosus (Deep inner hamstring) */}
                            {renderMusclePath('b_ham_semimemb_l', 'Semimembranosus', "M 94 232 C 94 250 92 280 90 294 C 96 280 98 250 98 232 Z")}
                            {renderMusclePath('b_ham_semimemb_r', 'Semimembranosus', "M 106 232 C 106 250 108 280 110 294 C 104 280 102 250 102 232 Z")}

                            {/* CALVES */}
                            {/* Gastrocnemius */}
                            {renderMusclePath('b_gastrocnemius_l', 'Gastrocnemius', "M 66 312 C 60 330 62 352 74 362 C 82 350 84 330 76 312 Z")}
                            {renderMusclePath('b_gastrocnemius_r', 'Gastrocnemius', "M 134 312 C 140 330 138 352 126 362 C 118 350 116 330 124 312 Z")}

                            {/* Soleus */}
                            {renderMusclePath('b_soleus_l', 'Soleus', "M 74 362 C 72 370 74 378 78 384 C 82 376 82 368 78 362 Z")}
                            {renderMusclePath('b_soleus_r', 'Soleus', "M 126 362 C 128 370 126 378 122 384 C 118 376 118 368 122 362 Z")}
                        </svg>
                    </div>
                )}
            </div>

            {/* Legend / Key */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px rgba(56,189,248,0.8)' }}></span>
                    <span style={{ color: 'var(--text-primary)' }}>Primary Target</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.8)' }}></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Secondary Target</span>
                </div>
            </div>
        </div>
    );
};

export default AnatomyViewer;
