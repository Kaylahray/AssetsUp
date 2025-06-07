'use client';

import { useRef, useEffect, useState } from 'react';
import { Camera, X, Flashlight, FlashlightOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Check if device has flash
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setHasFlash('torch' in capabilities);

      setScanning(true);
      startScanning();
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const toggleFlash = async () => {
    if (stream && hasFlash) {
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn }]
        });
        setFlashOn(!flashOn);
      } catch (err) {
        console.error('Flash toggle error:', err);
      }
    }
  };

  const startScanning = () => {
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && scanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            onScan(code.data);
            clearInterval(scanInterval);
            setScanning(false);
          }
        }
      }
    }, 100);

    return () => clearInterval(scanInterval);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold">Scan QR Code</h2>
          <div className="flex gap-2">
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
              >
                {flashOn ? <FlashlightOff size={20} /> : <Flashlight size={20} />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative w-full h-full flex items-center justify-center">
          {error ? (
            <div className="text-center text-white p-6">
              <Camera size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 border-2 border-white border-opacity-50 relative">
                    {/* Corner indicators */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="w-full h-0.5 bg-blue-400 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-white text-center mt-4 text-sm">
                    Position QR code within the frame
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

// Note: You'll need to install jsqr for QR code detection
// npm install jsqr @types/jsqr
declare function jsQR(data: Uint8ClampedArray, width: number, height: number): { data: string } | null;