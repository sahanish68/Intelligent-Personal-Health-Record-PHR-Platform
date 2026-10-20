import React from 'react';

const HumanBodyMap = ({ activeParts = [] }) => {
    // Helper to check if a specific body part was returned by the AI
    const isActive = (partName) => activeParts.includes(partName);

    // Define relative coordinates for the hotspots on the silhouette
    const bodyPartsCoordinates = {
        head: { top: '8%', left: '50%' },
        neck: { top: '18%', left: '50%' },
        chest: { top: '28%', left: '50%' },
        stomach: { top: '42%', left: '50%' },
        pelvis: { top: '55%', left: '50%' },
        arm_right: { top: '35%', left: '35%' }, // Viewer's left
        arm_left: { top: '35%', left: '65%' },  // Viewer's right
        leg_right: { top: '75%', left: '42%' }, // Viewer's left
        leg_left: { top: '75%', left: '58%' },  // Viewer's right
        back: { top: '35%', left: '50%' } // General back area
    };

    return (
        <div style={styles.container}>

            {/* Stitch MCP Generated Concept: Image with Hotspots */}
            <div style={styles.mapWrapper}>
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoW_MUF3HQQfkIzUDGUDG9-po7POL8S5I1KPQL0nCWI10g2QkNLtKG3UOSygRqlLlcieBdkwM1YHkAEGfD37zbtKQ8PvWt4w4kPyELPzwifRTdjo55hp7VG4A7rswOcuV48-mAihBbcQIi6P-uFKghWe6EMi99y_Id7OiyJC3uYVwHVblM-aX5xvjt2259HSEnMRA3wFZlryTX2hTAGm1HpB1r3VFIxx9BRPoqgA1sbhKiNm5QCgZKlD4IzXtIHGHhQ91cAiuuQ02Y"
                    alt="Human digital twin silhouette"
                    style={styles.silhouetteImage}
                />

                {/* Render glowing hotspots for active parts */}
                {Object.keys(bodyPartsCoordinates).map((part) => {
                    if (isActive(part)) {
                        return (
                            <div
                                key={part}
                                style={{
                                    ...styles.hotspot,
                                    top: bodyPartsCoordinates[part].top,
                                    left: bodyPartsCoordinates[part].left,
                                    animation: 'pulse 1.5s infinite' // Optional if using external CSS, otherwise fallback below
                                }}
                            >
                                <div style={styles.hotspotInner}></div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {activeParts.length > 0 && (
                <div style={styles.legend}>
                    <strong>Condition Mapped To:</strong>
                    <div style={styles.badgeContainer}>
                        {activeParts.map(part => (
                            <span key={part} style={styles.badge}>{part.replace('_', ' ').toUpperCase()}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'relative'
    },
    mapWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '350px',
        aspectRatio: '1 / 2.2',
        display: 'flex',
        justifyContent: 'center'
    },
    silhouetteImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: 'drop-shadow(0 10px 20px rgba(52, 152, 219, 0.4)) opacity(0.8) hue-rotate(180deg)' // Optional tweak for style
    },
    hotspot: {
        position: 'absolute',
        width: '30px',
        height: '30px',
        backgroundColor: 'rgba(231, 76, 60, 0.3)',
        borderRadius: '50%',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(231, 76, 60, 0.8)',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 15px rgba(231, 76, 60, 0.9)'
    },
    hotspotInner: {
        width: '10px',
        height: '10px',
        backgroundColor: 'rgba(231, 76, 60, 1)',
        borderRadius: '50%',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
    },
    legend: {
        marginTop: '20px',
        background: 'rgba(0,0,0,0.4)',
        padding: '10px 15px',
        borderRadius: '12px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(231, 76, 60, 0.3)',
        textAlign: 'center',
        width: '100%'
    },
    badgeContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        marginTop: '8px'
    },
    badge: {
        background: 'rgba(231, 76, 60, 0.2)',
        color: '#ff7675',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(231, 76, 60, 0.5)'
    }
};

export default HumanBodyMap;
