"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Shield, AlertTriangle, Eye, Lock, Zap } from 'lucide-react';

const MODEL_URL = '/models';

const DystopianFaceScanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
    const [scanning, setScanning] = useState(false);
    const [systemStatus, setSystemStatus] = useState('INITIALIZING');
    const [threatLevel, setThreatLevel] = useState('LOW');
    const [faceStats, setFaceStats] = useState<{
        faces: Array<{
            confidence?: number;
            box?: { x: number; y: number; width: number; height: number };
            descriptor?: Float32Array;
        }>;
    }>({ faces: [] });
    const [userStats, setUserStats] = useState<any[]>([]); // Array for multiple users
    const [scanLines, setScanLines] = useState(0);
    const [glitchEffect, setGlitchEffect] = useState(false);
    const [connectionLines, setConnectionLines] = useState<Array<{
        start: { x: number; y: number };
        end: { x: number; y: number };
        color: string;
    }>>([]);

    useEffect(() => {
        const loadModels = async () => {
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            setSystemStatus('OPERATIONAL');
            setLoading(false);
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!loading) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setScanning(true);
                setSystemStatus('SCANNING');
            });
        }
    }, [loading]);

    const sendDescriptorToServer = async (descriptor: Float32Array, faceIndex: number) => {
        try {
            const data = await fetch('/api/face/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descriptor: Array.from(descriptor) }),
            });
            const result = await data.json();

            // Update specific user in array
            setUserStats(prev => {
                const newStats = [...prev];
                newStats[faceIndex] = result.user;
                return newStats;
            });
            setSystemStatus('MATCHES FOUND');

            console.log(`Descriptor sent for face ${faceIndex}`);
            return result;
        } catch (err) {
            console.error('Failed to send descriptor:', err);
            setSystemStatus('CONNECTION LOST');

            // Fallback to mock data for demo
            const mockData = {
                name: `SUBJECT-${Math.floor(Math.random() * 9999)}`,
                citizenId: `GOV-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}`,
                ratingScore: Math.floor(Math.random() * 40) + 15,
                criminalScore: Math.floor(Math.random() * 85) + 10,
                relationScore: Math.floor(Math.random() * 30) + 20,
                otherScore: Math.floor(Math.random() * 60) + 25,
                totalScore: 0,
                classification: ['PERSON OF INTEREST', 'CITIZEN', 'WANTED', 'SURVEILLANCE TARGET'][Math.floor(Math.random() * 4)],
                lastSeen: '2025-08-09 14:32:07',
                locationHistory: ['SECTOR-7', 'DISTRICT-12', 'CHECKPOINT-A4']
            };
            mockData.totalScore = mockData.ratingScore + mockData.criminalScore + mockData.relationScore + mockData.otherScore;

            setUserStats(prev => {
                const newStats = [...prev];
                newStats[faceIndex] = mockData;
                return newStats;
            });
            setSystemStatus('OFFLINE MODE');
        }
    };

    // Scan line animation
    useEffect(() => {
        const interval = setInterval(() => {
            setScanLines(prev => (prev + 2) % 480);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Glitch effect
    useEffect(() => {
        const glitchInterval = setInterval(() => {
            setGlitchEffect(true);
            setTimeout(() => setGlitchEffect(false), 150);
        }, Math.random() * 8000 + 3000);
        return () => clearInterval(glitchInterval);
    }, []);

    // Calculate connection lines
    useEffect(() => {
        if (faceStats.faces.length > 0 && userStats.length > 0 && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const videoElement = videoRef.current;
            const statsPanel = containerRef.current.querySelector('[data-stats-panel]') as HTMLElement;

            if (videoElement && statsPanel) {
                const videoRect = videoElement.getBoundingClientRect();
                const statsPanelRect = statsPanel.getBoundingClientRect();

                const lines = faceStats.faces.map((face, index) => {
                    if (face.box && userStats[index]) {
                        // Calculate face center relative to container
                        const faceCenter = {
                            x: videoRect.left - containerRect.left + face.box.x + face.box.width / 2,
                            y: videoRect.top - containerRect.top + face.box.y + face.box.height / 2
                        };

                        // Calculate stats panel connection point
                        const statsPanelConnection = {
                            x: statsPanelRect.left - containerRect.left,
                            y: statsPanelRect.top - containerRect.top + (index * 240) + 120 // Adjust for panel height
                        };

                        const colors = ['#00ff88', '#ff0040', '#ffff00', '#ff8800', '#8800ff'];

                        return {
                            start: faceCenter,
                            end: statsPanelConnection,
                            color: colors[index % colors.length]
                        };
                    }
                    return null;
                }).filter(Boolean) as Array<{
                    start: { x: number; y: number };
                    end: { x: number; y: number };
                    color: string;
                }>;

                setConnectionLines(lines);
            }
        }
    }, [faceStats.faces, userStats]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!loading) {
            setScanning(true);
            interval = setInterval(async () => {
                if (videoRef.current) {
                    // Use detectAllFaces instead of detectSingleFace
                    const detections = await faceapi
                        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptors();

                    // Clear canvas before drawing
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }

                    if (detections.length > 0) {
                        const faces = detections.map((detection, index) => {
                            const { box, score } = detection.detection;
                            return {
                                confidence: score,
                                box: { x: box.x, y: box.y, width: box.width, height: box.height },
                                descriptor: detection.descriptor
                            };
                        });

                        setFaceStats({ faces });

                        // Draw targeting system for each face
                        if (canvasRef.current) {
                            const ctx = canvasRef.current.getContext('2d');
                            if (ctx) {
                                faces.forEach((face, index) => {
                                    const { box } = face;
                                    const hasUserData = userStats[index];

                                    ctx.save();

                                    // Main bounding box - different colors for different faces
                                    const colors = ['#00ff88', '#ff0040', '#ffff00', '#ff8800', '#8800ff'];
                                    ctx.strokeStyle = hasUserData ? '#ff0040' : colors[index % colors.length];
                                    ctx.lineWidth = 3;
                                    ctx.setLineDash([]);
                                    ctx.strokeRect(box.x, box.y, box.width, box.height);

                                    // Face number label
                                    ctx.fillStyle = 'rgba(0,0,0,0.8)';
                                    ctx.fillRect(box.x, box.y - 25, 60, 20);
                                    ctx.fillStyle = colors[index % colors.length];
                                    ctx.font = 'bold 14px monospace';
                                    const label = `FACE ${index + 1}`;
                                    ctx.fillText(label, box.x + 5, box.y - 10);

                                    // Corner brackets
                                    const bracketSize = 20;
                                    ctx.strokeStyle = '#00ffff';
                                    ctx.lineWidth = 4;
                                    // Top-left
                                    ctx.beginPath();
                                    ctx.moveTo(box.x, box.y + bracketSize);
                                    ctx.lineTo(box.x, box.y);
                                    ctx.lineTo(box.x + bracketSize, box.y);
                                    ctx.stroke();
                                    // Top-right
                                    ctx.beginPath();
                                    ctx.moveTo(box.x + box.width - bracketSize, box.y);
                                    ctx.lineTo(box.x + box.width, box.y);
                                    ctx.lineTo(box.x + box.width, box.y + bracketSize);
                                    ctx.stroke();
                                    // Bottom-left
                                    ctx.beginPath();
                                    ctx.moveTo(box.x, box.y + box.height - bracketSize);
                                    ctx.lineTo(box.x, box.y + box.height);
                                    ctx.lineTo(box.x + bracketSize, box.y + box.height);
                                    ctx.stroke();
                                    // Bottom-right
                                    ctx.beginPath();
                                    ctx.moveTo(box.x + box.width - bracketSize, box.y + box.height);
                                    ctx.lineTo(box.x + box.width, box.y + box.height);
                                    ctx.lineTo(box.x + box.width, box.y + box.height - bracketSize);
                                    ctx.stroke();

                                    // Crosshair
                                    ctx.strokeStyle = '#ff0040';
                                    ctx.lineWidth = 2;
                                    const centerX = box.x + box.width / 2;
                                    const centerY = box.y + box.height / 2;
                                    ctx.beginPath();
                                    ctx.moveTo(centerX - 10, centerY);
                                    ctx.lineTo(centerX + 10, centerY);
                                    ctx.moveTo(centerX, centerY - 10);
                                    ctx.lineTo(centerX, centerY + 10);
                                    ctx.stroke();

                                    ctx.restore();
                                });
                            }
                        }

                        // Process descriptors for faces that don't have user data yet
                        faces.forEach(async (face, index) => {
                            if (face.descriptor && !userStats[index]) {
                                console.log(`Face descriptor ${index}:`, face.descriptor);
                                const info = await sendDescriptorToServer(face.descriptor, index);
                                if (info) {
                                    console.log(`Server response for face ${index}:`, info);
                                }
                            }
                        });
                    } else {
                        setFaceStats({ faces: [] });
                        setUserStats([]); // Clear the user stats array completely
                        setConnectionLines([]); // Clear connection lines
                        if (userStats.length > 0) {
                            setSystemStatus('TARGETS LOST');
                        }
                    }
                }
            }, 500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [loading, descriptor, userStats]);

    const getThreatColor = (level: string) => {
        switch (level) {
            case 'HIGH': return '#ff0040';
            case 'MEDIUM': return '#ff8800';
            default: return '#00ff88';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPERATIONAL': return '#00ff88';
            case 'SCANNING': return '#00ffff';
            case 'MATCHES FOUND': return '#ff8800';
            case 'TARGET LOST': return '#ff0040';
            default: return '#888';
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                minHeight: '100vh',
                color: '#00ff88',
                fontFamily: 'monospace',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Connection lines SVG overlay */}
            {connectionLines.length > 0 && (
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 10
                    }}
                >
                    {connectionLines.map((line, index) => (
                        <g key={index}>
                            {/* Main connection line */}
                            <line
                                x1={line.start.x}
                                y1={line.start.y}
                                x2={line.end.x}
                                y2={line.end.y}
                                stroke={line.color}
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                opacity="0.8"
                            />
                            {/* Animated pulse effect */}
                            <line
                                x1={line.start.x}
                                y1={line.start.y}
                                x2={line.end.x}
                                y2={line.end.y}
                                stroke={line.color}
                                strokeWidth="1"
                                opacity="0.3"
                            >
                                <animate
                                    attributeName="stroke-dasharray"
                                    values="0,100;50,50;100,0"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            </line>
                            {/* Connection point dots */}
                            <circle
                                cx={line.start.x}
                                cy={line.start.y}
                                r="4"
                                fill={line.color}
                                opacity="0.9"
                            >
                                <animate
                                    attributeName="r"
                                    values="4;6;4"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </circle>
                            <circle
                                cx={line.end.x}
                                cy={line.end.y}
                                r="3"
                                fill={line.color}
                                opacity="0.7"
                            />
                        </g>
                    ))}
                </svg>
            )}

            {/* Background grid */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
          linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)
        `,
                backgroundSize: '50px 50px',
                zIndex: -1,
                opacity: 0.3
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '20px',
                background: 'rgba(0,0,0,0.8)',
                borderRadius: '8px',
                border: '2px solid #00ff88',
                boxShadow: '0 0 20px rgba(0,255,136,0.3)',
                position: 'relative',
                zIndex: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Shield size={32} color="#00ff88" />
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                            CENTRAL SURVEILLANCE SYSTEM
                        </div>
                        <div style={{ fontSize: '14px', color: '#888' }}>
                            NEURAL IDENTIFICATION PROTOCOL v4.7.2
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: getStatusColor(systemStatus), fontWeight: 'bold' }}>
                            STATUS: {systemStatus}
                        </div>
                        <div style={{ color: getThreatColor(threatLevel), fontWeight: 'bold' }}>
                            THREAT: {threatLevel}
                        </div>
                    </div>
                    <Eye size={28} color="#00ffff" />
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '30px',
                justifyContent: 'center',
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 5
            }}>
                {/* Main scanner */}
                <div style={{
                    position: 'relative',
                    background: 'rgba(0,0,0,0.9)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '3px solid #00ff88',
                    boxShadow: '0 0 30px rgba(0,255,136,0.4)'
                }}>
                    <div style={{ position: 'relative', width: 640, height: 480 }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            width={640}
                            height={480}
                            style={{
                                borderRadius: '8px',
                                filter: glitchEffect ? 'hue-rotate(180deg) contrast(150%)' : 'none',
                                transition: 'filter 0.1s',
                                background: '#000'
                            }}
                        />

                        {/* Demo placeholder when no camera */}
                        {!videoRef.current?.srcObject && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#00ff88',
                                fontSize: '18px',
                                borderRadius: '8px'
                            }}>
                                DEMO MODE - SIMULATED FEED
                            </div>
                        )}

                        {/* Scan lines overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            overflow: 'hidden',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: `${scanLines}px`,
                                left: 0,
                                right: 0,
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
                                boxShadow: '0 0 10px #00ffff'
                            }} />
                            <div style={{
                                position: 'absolute',
                                top: `${(scanLines + 50) % 480}px`,
                                left: 0,
                                right: 0,
                                height: '1px',
                                background: 'rgba(0,255,136,0.5)'
                            }} />
                        </div>

                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                pointerEvents: 'none',
                            }}
                        />

                        {/* Loading overlay */}
                        {loading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.8)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: '#00ff88',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}>
                                <div style={{ marginBottom: '20px' }}>INITIALIZING NEURAL NETWORKS...</div>
                                <div style={{
                                    width: '200px',
                                    height: '4px',
                                    background: '#333',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #00ff88, #00ffff)',
                                        animation: 'loading 2s infinite'
                                    }} />
                                </div>
                            </div>
                        )}

                        {/* Status indicators */}
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}>
                            <div style={{
                                background: 'rgba(0,0,0,0.8)',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#00ff88'
                            }}>
                                REC ●
                            </div>
                            <div style={{
                                background: 'rgba(0,0,0,0.8)',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#00ffff'
                            }}>
                                NEURAL: ACTIVE
                            </div>
                        </div>

                        {/* Scanning message */}
                        {faceStats.faces.length <= 0 && !loading && (
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                background: 'rgba(0,0,0,0.9)',
                                padding: '15px 25px',
                                borderRadius: '8px',
                                border: '2px solid #00ffff',
                                color: '#00ffff',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                boxShadow: '0 0 15px rgba(0,255,255,0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Zap size={18} />
                                    SCANNING FOR BIOMETRIC SIGNATURES...
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subject profiles */}
                {userStats.length > 0 && (
                    <div
                        data-stats-panel
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            maxWidth: '350px',
                            maxHeight: '600px',
                            overflowY: 'auto'
                        }}
                    >
                        {userStats.map((user, index) => user && (
                            <div key={index} style={{
                                background: 'rgba(0,0,0,0.9)',
                                border: '3px solid #ff0040',
                                borderRadius: '12px',
                                padding: '15px',
                                boxShadow: '0 0 20px rgba(255,0,64,0.3)',
                                position: 'relative'
                            }}>
                                {/* Connection indicator */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: ['#00ff88', '#ff0040', '#ffff00', '#ff8800', '#8800ff'][index % 5],
                                    boxShadow: `0 0 10px ${['#00ff88', '#ff0040', '#ffff00', '#ff8800', '#8800ff'][index % 5]}`
                                }} />

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '15px',
                                    paddingBottom: '8px',
                                    borderBottom: '2px solid #ff0040'
                                }}>
                                    <AlertTriangle size={20} color="#ff0040" />
                                    <div style={{ color: '#ff0040', fontSize: '16px', fontWeight: 'bold' }}>
                                        SUBJECT {index + 1} IDENTIFIED
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                                        ID: {user.citizenId}
                                    </div>
                                    <div style={{
                                        color: '#ff0040',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        background: 'rgba(255,0,64,0.1)',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {user.classification}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    {[
                                        { label: "SOCIAL", value: user.ratingScore, color: "#4f8cff" },
                                        { label: "CRIMINAL", value: user.criminalScore, color: "#ff0040" },
                                        { label: "ASSOCIATION", value: user.relationScore, color: "#00ff88" },
                                        { label: "BEHAVIOR", value: user.otherScore, color: "#ff8800" },
                                        { label: "TOTAL", value: user.totalScore, color: "#00ffff" } // Chose a bright cyan for TOTAL
                                    ].map(({ label, value, color }) => (
                                        <div key={label} style={{ marginBottom: '10px' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '3px',
                                                fontSize: '10px',
                                                color: '#ccc'
                                            }}>
                                                <span>{label}</span>
                                                {label === "TOTAL" ? (
                                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{value}/1000</span>
                                                ) : (
                                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{value}/250</span>
                                                )}
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '6px',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '3px',
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    width: `${value}%`,
                                                    height: '100%',
                                                    background: color,
                                                    borderRadius: '3px',
                                                    transition: 'width 0.8s ease'
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    fontSize: '10px',
                                    color: '#888',
                                    borderTop: '1px solid #333',
                                    paddingTop: '8px'
                                }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        <strong style={{ color: '#ccc' }}>LAST SEEN:</strong> {user.lastSeen}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
        </div>
    );
};

export default DystopianFaceScanner;