"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models'; // Place models in public/models

const FaceIDRegister: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [descriptor, setDescriptor] = useState<Float32Array | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
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
      });
    }
  }, [loading]);

  const sendDescriptorToServer = async (descriptor: Float32Array) => {
    try {
      await fetch('/api/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: Array.from(descriptor) }),
      });
      console.log('Descriptor sent to server');
    } catch (err) {
      console.error('Failed to send descriptor:', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanning && !descriptor) {
      interval = setInterval(async () => {
        if (videoRef.current) {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detection && detection.descriptor) {
            setDescriptor(detection.descriptor);
            setScanning(false);
            // Save descriptor to backend or localStorage as needed
            console.log('Face descriptor:', detection.descriptor);
            await sendDescriptorToServer(detection.descriptor);
            alert('Face registered!');
          }
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanning, descriptor]);

  return (
    <div>
      <h2>Register Face ID</h2>
      {loading ? (
        <p>Loading models...</p>
      ) : (
        <>
          <video ref={videoRef} autoPlay width={320} height={240} />
          <br />
          {!descriptor && <p>Scanning for face...</p>}
          {descriptor && <p>Face registered!</p>}
        </>
      )}
    </div>
  );
};

export default FaceIDRegister;
