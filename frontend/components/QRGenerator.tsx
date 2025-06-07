'use client';

import { useEffect, useRef } from 'react';
import { Download, Share } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  category: string;
}

interface QRGeneratorProps {
  asset: Asset;
  size?: number;
  showDownload?: boolean;
  showShare?: boolean;
  className?: string;
}

export default function QRGenerator({ 
  asset, 
  size = 200, 
  showDownload = true, 
  showShare = true,
  className = ''
}: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [asset, size]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    // Create QR data with asset information
    const qrData = JSON.stringify({
      id: asset.id,
      name: asset.name,
      serialNumber: asset.serialNumber,
      category: asset.category,
      type: 'asset',
      timestamp: Date.now()
    });

    try {
      // You'll need to install qrcode library: npm install qrcode @types/qrcode
      const QRCode = (await import('qrcode')).default;
      
      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `qr-${asset.name.replace(/\s+/g, '-').toLowerCase()}-${asset.id}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const shareQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (blob && navigator.share) {
          const file = new File([blob], `qr-${asset.name}.png`, { type: 'image/png' });
          await navigator.share({
            title: `QR Code for ${asset.name}`,
            text: `QR Code for asset: ${asset.name}`,
            files: [file]
          });
        } else {
          // Fallback: copy to clipboard
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              alert('QR code copied to clipboard!');
            }
          });
        }
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <canvas 
          ref={canvasRef}
          className="block"
        />
      </div>
      
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 mb-1">{asset.name}</h3>
        <p className="text-sm text-gray-600">
          {asset.category} • ID: {asset.id}
        </p>
        {asset.serialNumber && (
          <p className="text-sm text-gray-500">
            S/N: {asset.serialNumber}
          </p>
        )}
      </div>

      {(showDownload || showShare) && (
        <div className="flex gap-2">
          {showDownload && (
            <button
              onClick={downloadQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          )}
          
          {showShare && (
            <button
              onClick={shareQRCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Share size={16} />
              Share
            </button>
          )}
        </div>
      )}
    </div>
  );
}