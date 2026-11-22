'use client';

import { useState, useRef } from 'react';

export default function ImageViewer({
  imageUrl,
  defaultLayout = 'vertical',
  title = '',
}) {
  const [layout, setLayout] = useState(defaultLayout); // 'vertical' or 'horizontal'
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const imgRef = useRef(null);

  // Clean title: NEVER show internal card identifiers like "Card #112" to customers
  const displayTitle =
    title && !title.toLowerCase().startsWith('card #') ? title.trim() : '';

  function handleZoomIn() {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }

  function handleReset() {
    setZoom(1);
    setRotation(0);
  }

  function handleRotate() {
    setRotation((prev) => (prev + 90) % 360);
  }

  async function handleShare() {
    const shareTitle = displayTitle || 'Image';
    const shareData = {
      title: shareTitle,
      text: displayTitle ? `Check out ${displayTitle}` : 'View image',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: Copy Link
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Copy link failed:', err);
      }
    }
  }

  async function handleDownload() {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${displayTitle || 'menu-image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Direct blob download failed, opening in new tab:', err);
      window.open(imageUrl, '_blank');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0 flex-1">
          {displayTitle ? (
            <h1 className="text-base sm:text-lg font-bold text-white truncate">
              {displayTitle}
            </h1>
          ) : null}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Orientation Toggle */}
          <div className="bg-neutral-800 p-0.5 rounded-xl border border-neutral-700 flex items-center">
            <button
              type="button"
              onClick={() => {
                setLayout('vertical');
                handleReset();
              }}
              title="Vertical (Scroll / Menu)"
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                layout === 'vertical'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>📱</span>
              <span className="hidden sm:inline">Vertical</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLayout('horizontal');
                handleReset();
              }}
              title="Horizontal (Fit / Landscape)"
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                layout === 'horizontal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>💻</span>
              <span className="hidden sm:inline">Horizontal</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white transition-all flex items-center gap-1.5"
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">
              {copySuccess ? 'Copied!' : 'Share'}
            </span>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow"
            title="Download Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </header>

      {/* Floating Zoom / Rotate Controls Bar */}
      <div className="fixed bottom-6 right-6 z-40 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl disabled:opacity-30 transition-colors"
          title="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span className="text-xs font-mono font-bold text-neutral-400 w-12 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl disabled:opacity-30 transition-colors"
          title="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <div className="w-px h-5 bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={handleRotate}
          className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          title="Rotate 90°"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {(zoom !== 1 || rotation !== 0) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
            title="Reset"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main Image Display Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto">
        {layout === 'vertical' ? (
          /* Vertical Layout: Full Width, naturally scrollable, great for menus & price lists */
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            <div
              className="w-full flex justify-center transition-transform duration-200 origin-top"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt={displayTitle || 'Image'}
                className="w-full h-auto rounded-2xl shadow-2xl object-contain border border-neutral-800"
                loading="eager"
              />
            </div>
          </div>
        ) : (
          /* Horizontal Layout: Screen-fitted, centered, landscape presentation */
          <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
            <div
              className="max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt={displayTitle || 'Image'}
                className="max-w-full max-h-[85vh] w-auto h-auto rounded-2xl shadow-2xl object-contain border border-neutral-800"
                loading="eager"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="py-3 text-center text-xs text-neutral-500 border-t border-neutral-900">
        Pinch or use buttons to zoom
      </footer>
    </div>
  );
}
