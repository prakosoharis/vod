/**
 * QR Code Display Component
 * Generates QR code from a string using canvas
 * Used in Subscription Gate to let user scan & pay on mobile/web
 */
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { COLORS } from '@/constants';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({
  value,
  size = 360,
  label,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: COLORS.warmCharcoal[100],
          light: '#FFFFFF',
        },
      },
      (err) => {
        if (err) {
          setError('Failed to generate QR');
          console.error('QR generation error:', err);
        } else {
          setError(null);
        }
      }
    );
  }, [value, size]);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          padding: 20,
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {error ? (
          <div
            style={{
              width: size,
              height: size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.error,
              fontWeight: 'bold',
              textAlign: 'center',
              padding: 20,
            }}
          >
            {error}
          </div>
        ) : (
          <canvas ref={canvasRef} width={size} height={size} />
        )}
      </div>
      {label && (
        <div
          style={{
            color: COLORS.cream[100],
            fontSize: 18,
            textAlign: 'center',
            maxWidth: size + 40,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export default QRCodeDisplay;
