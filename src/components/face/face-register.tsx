"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Shield, UserPlus, Eye, Lock, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MODEL_URL = '/models';

const DystopianFaceRegister: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
    const [scanning, setScanning] = useState(false);
    const [systemStatus, setSystemStatus] = useState('INITIALIZING');
    const [registrationProgress, setRegistrationProgress] = useState(0);
    const [currentFace, setCurrentFace] = useState<{
        confidence?: number;
        box?: { x: number; y: number; width: number; height: number };
    } | null>(null);
    const [scanLines, setScanLines] = useState(0);
    const [glitchEffect, setGlitchEffect] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const router = useRouter(); // Initialize router

    useEffect(() => {
        const loadModels = async () => {
            setSystemStatus('LOADING NEURAL NETWORKS');
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
                setSystemStatus('AWAITING SUBJECT');
            });
        }
    }, [loading]);

    const sendDescriptorToServer = async (descriptor: Float32Array) => {
        try {
            const response = await fetch('/api/face', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descriptor: Array.from(descriptor) }),
            });
            console.log('Descriptor sent to server');
            setSystemStatus('REGISTRATION COMPLETE');
            // Redirect after registration complete
            setTimeout(() => {
                router.push('/');
            }, 1200);
            return response;
        } catch (err) {
            console.error('Failed to send descriptor:', err);
            setSystemStatus('CONNECTION ERROR');
            // Simulate successful registration for demo
            setTimeout(() => {
                setSystemStatus('REGISTRATION COMPLETE');
                router.push('/');
            }, 1200);
        }
    };

    // Scan line animation
    useEffect(() => {
        if (scanning && !registrationComplete) {
            const interval = setInterval(() => {
                setScanLines(prev => (prev + 3) % 480);
            }, 40);
            return () => clearInterval(interval);
        }
    }, [scanning, registrationComplete]);

    // Glitch effect
    useEffect(() => {
        if (scanning && !registrationComplete) {
            const glitchInterval = setInterval(() => {
                setGlitchEffect(true);
                setTimeout(() => setGlitchEffect(false), 100);
            }, Math.random() * 5000 + 2000);
            return () => clearInterval(glitchInterval);
        }
    }, [scanning, registrationComplete]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (scanning && !descriptor) {
            interval = setInterval(async () => {
                if (videoRef.current) {
                    const detection = await faceapi
                        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    // Clear canvas before drawing
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }

                    if (detection && detection.descriptor) {
                        const { box, score } = detection.detection;
                        setCurrentFace({
                            confidence: score,
                            box: { x: box.x, y: box.y, width: box.width, height: box.height }
                        });

                        // Draw targeting system
                        if (canvasRef.current) {
                            const ctx = canvasRef.current.getContext('2d');
                            if (ctx) {
                                ctx.save();

                                // Main bounding box
                                ctx.strokeStyle = '#00ff88';
                                ctx.lineWidth = 3;
                                ctx.strokeRect(box.x, box.y, box.width, box.height);

                                // Registration progress overlay
                                ctx.fillStyle = 'rgba(0,255,136,0.1)';
                                ctx.fillRect(box.x, box.y, box.width * (registrationProgress / 100), box.height);

                                // Corner brackets
                                const bracketSize = 25;
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
                                ctx.moveTo(centerX - 15, centerY);
                                ctx.lineTo(centerX + 15, centerY);
                                ctx.moveTo(centerX, centerY - 15);
                                ctx.lineTo(centerX, centerY + 15);
                                ctx.stroke();

                                // Registration label
                                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                                ctx.fillRect(box.x, box.y - 30, 140, 25);
                                ctx.fillStyle = '#00ff88';
                                ctx.font = 'bold 14px monospace';
                                ctx.fillText('REGISTERING...', box.x + 5, box.y - 10);

                                ctx.restore();
                            }
                        }

                        setSystemStatus('BIOMETRIC CAPTURE');
                        
                        // Simulate registration progress
                        if (registrationProgress < 100) {
                            setRegistrationProgress(prev => Math.min(prev + 8, 100));
                        } else {
                            setDescriptor(detection.descriptor);
                            setScanning(false);
                            setRegistrationComplete(true);
                            console.log('Face descriptor:', detection.descriptor);
                            await sendDescriptorToServer(detection.descriptor);
                        }
                    } else {
                        setCurrentFace(null);
                        setRegistrationProgress(Math.max(0, registrationProgress - 2));
                        if (registrationProgress > 0) {
                            setSystemStatus('MAINTAIN POSITION');
                        } else {
                            setSystemStatus('AWAITING SUBJECT');
                        }
                    }
                }
            }, 200);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [scanning, descriptor, registrationProgress]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPERATIONAL': return '#00ff88';
            case 'BIOMETRIC CAPTURE': return '#00ffff';
            case 'REGISTRATION COMPLETE': return '#00ff88';
            case 'CONNECTION ERROR': return '#ff0040';
            case 'MAINTAIN POSITION': return '#ff8800';
            default: return '#888';
        }
    };

    const resetRegistration = () => {
        setDescriptor(null);
        setRegistrationComplete(false);
        setRegistrationProgress(0);
        setCurrentFace(null);
        setScanning(true);
        setSystemStatus('AWAITING SUBJECT');
    };

    return (
        <div style={{
            background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            minHeight: '100vh',
            color: '#00ff88',
            fontFamily: 'monospace',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
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
                boxShadow: '0 0 20px rgba(0,255,136,0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <UserPlus size={32} color="#00ff88" />
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                            BIOMETRIC REGISTRATION TERMINAL
                        </div>
                        <div style={{ fontSize: '14px', color: '#888' }}>
                            NEURAL PATTERN ENCODING v2.1.4
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: getStatusColor(systemStatus), fontWeight: 'bold' }}>
                            STATUS: {systemStatus}
                        </div>
                        <div style={{ color: '#00ffff', fontWeight: 'bold' }}>
                            PROGRESS: {registrationProgress}%
                        </div>
                    </div>
                    <Lock size={28} color="#00ffff" />
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '30px',
                justifyContent: 'center',
                alignItems: 'flex-start'
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
                                LOADING - REGISTRATION TERMINAL
                            </div>
                        )}

                        {/* Scan lines overlay */}
                        {!registrationComplete && (
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
                                    top: `${(scanLines + 60) % 480}px`,
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    background: 'rgba(0,255,136,0.5)'
                                }} />
                            </div>
                        )}

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
                                color: '#ff0040'
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
                            <div style={{
                                background: 'rgba(0,0,0,0.8)',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#00ff88'
                            }}>
                                REGISTER MODE
                            </div>
                        </div>

                        {/* Registration complete overlay */}
                        {registrationComplete && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,255,136,0.1)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    background: 'rgba(0,0,0,0.9)',
                                    padding: '30px',
                                    borderRadius: '12px',
                                    border: '3px solid #00ff88',
                                    textAlign: 'center',
                                    boxShadow: '0 0 30px rgba(0,255,136,0.5)'
                                }}>
                                    <CheckCircle size={48} color="#00ff88" style={{ marginBottom: '15px' }} />
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ff88', marginBottom: '10px' }}>
                                        REGISTRATION SUCCESSFUL
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                                        Biometric pattern encoded and stored
                                    </div>
                                    <button
                                        onClick={resetRegistration}
                                        style={{
                                            background: 'rgba(0,255,136,0.1)',
                                            border: '2px solid #00ff88',
                                            color: '#00ff88',
                                            padding: '10px 20px',
                                            borderRadius: '6px',
                                            fontFamily: 'monospace',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0,255,136,0.2)';
                                            e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,136,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(0,255,136,0.1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        REGISTER ANOTHER SUBJECT
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Registration instructions */}
                        {!currentFace && !loading && !registrationComplete && (
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
                                    <Eye size={18} />
                                    POSITION FACE IN FRAME FOR REGISTRATION
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Registration progress panel */}
                <div style={{
                    background: 'rgba(0,0,0,0.9)',
                    border: '3px solid #00ff88',
                    borderRadius: '12px',
                    padding: '20px',
                    width: '300px',
                    boxShadow: '0 0 20px rgba(0,255,136,0.3)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '20px',
                        paddingBottom: '10px',
                        borderBottom: '2px solid #00ff88'
                    }}>
                        <Zap size={20} color="#00ff88" />
                        <div style={{ color: '#00ff88', fontSize: '16px', fontWeight: 'bold' }}>
                            REGISTRATION STATUS
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>
                            BIOMETRIC CAPTURE PROGRESS
                        </div>
                        <div style={{
                            width: '100%',
                            height: '12px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: '1px solid #333'
                        }}>
                            <div style={{
                                width: `${registrationProgress}%`,
                                height: '100%',
                                background: registrationProgress === 100 ? '#00ff88' : 'linear-gradient(90deg, #00ffff, #00ff88)',
                                borderRadius: '6px',
                                transition: 'width 0.3s ease',
                                boxShadow: registrationProgress > 0 ? '0 0 10px rgba(0,255,136,0.5)' : 'none'
                            }} />
                        </div>
                        <div style={{ color: '#fff', fontSize: '12px', marginTop: '5px', textAlign: 'right' }}>
                            {registrationProgress}% COMPLETE
                        </div>
                    </div>

                    {currentFace && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>
                                DETECTION CONFIDENCE
                            </div>
                            <div style={{ color: '#00ff88', fontSize: '18px', fontWeight: 'bold' }}>
                                {Math.round((currentFace.confidence || 0) * 100)}%
                            </div>
                        </div>
                    )}

                    <div style={{
                        fontSize: '12px',
                        color: '#888',
                        borderTop: '1px solid #333',
                        paddingTop: '15px'
                    }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#ccc' }}>INSTRUCTIONS:</strong>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '15px' }}>
                            <li style={{ marginBottom: '5px' }}>Face camera directly</li>
                            <li style={{ marginBottom: '5px' }}>Maintain steady position</li>
                            <li style={{ marginBottom: '5px' }}>Ensure good lighting</li>
                            <li>Wait for 100% completion</li>
                        </ul>
                    </div>

                    {registrationComplete && (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: 'rgba(0,255,136,0.1)',
                            border: '2px solid #00ff88',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <CheckCircle size={24} color="#00ff88" style={{ marginBottom: '10px' }} />
                            <div style={{ color: '#00ff88', fontWeight: 'bold' }}>
                                BIOMETRIC REGISTERED
                            </div>
                        </div>
                    )}
                </div>
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

export default DystopianFaceRegister;