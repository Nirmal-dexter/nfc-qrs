'use client';

import { useEffect, useState } from 'react';

export default function Toast({
  message,
  isOpen,
  onUndo,
  onClose,
  duration = 5000,
}) {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration / 1000);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-400" />
            <p className="text-sm font-medium truncate text-white">
              {message}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
              >
                Undo ({timeLeft}s)
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-md"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 5-second animated progress bar */}
        <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / (duration / 1000)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
