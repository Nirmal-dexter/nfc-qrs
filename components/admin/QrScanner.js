'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';

export default function QrScanner({ onResult, onClose }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef(null);
  const readerElementId = 'qr-reader-container';

  function extractCode(text) {
    if (!text) return '';
    const trimmed = text.trim();
    // Match URL like /c/CODE
    const match = trimmed.match(/\/c\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  }

  useEffect(() => {
    let html5QrCode = null;
    let isCancelled = false;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (isCancelled) return;

        html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            const code = extractCode(decodedText);
            if (code) {
              if (html5QrCode.isScanning) {
                html5QrCode
                  .stop()
                  .then(() => {
                    onResult(code);
                  })
                  .catch(() => {
                    onResult(code);
                  });
              } else {
                onResult(code);
              }
            }
          },
          (errorMessage) => {
            // Ignore ongoing frame decode failures
          }
        );

        if (!isCancelled) {
          setIsStarting(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to start camera:', err);
          setErrorMsg(
            'Unable to access camera. Please allow camera permissions or enter the code manually.'
          );
          setIsStarting(false);
        }
      }
    }

    startScanner();

    return () => {
      isCancelled = true;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear().catch(() => {});
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Scan Card QR
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
            aria-label="Close scanner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm mb-4">
            {errorMsg}
          </div>
        ) : (
          <div className="relative mb-4">
            <div
              id={readerElementId}
              className="w-full h-72 rounded-xl overflow-hidden bg-black"
            />
            {isStarting && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl text-white text-sm">
                Starting camera...
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6">
          Align the card&apos;s QR code inside the box to scan automatically.
        </p>

        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
