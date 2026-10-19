'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ExportPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [domain, setDomain] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.origin);
    }
  }, []);

  useEffect(() => {
    async function loadCards() {
      try {
        setLoading(true);
        const res = await fetch('/api/cards?limit=1000');
        if (res.ok) {
          const data = await res.json();
          setCards(data.cards || []);
        }
      } catch (err) {
        console.error('Failed to load cards for export:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  // Compute batches with counts
  const batchCounts = cards.reduce((acc, card) => {
    const b = card.batch_name || 'Default';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  const batches = Object.keys(batchCounts);

  const currentCount =
    selectedBatch === 'all'
      ? cards.length
      : batchCounts[selectedBatch] || 0;

  async function handleDownloadZip() {
    try {
      setIsDownloading(true);
      const url = `/api/export?batch=${encodeURIComponent(selectedBatch)}${domain ? `&domain=${encodeURIComponent(domain)}` : ''}`;
      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate QR ZIP');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-batch-${selectedBatch}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Export & Print QR Codes
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Download high-resolution 300px QR PNGs or open a print-ready grid sheet.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Scanning batch inventory..." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
          {/* Select Batch */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Batch to Export
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Batches ({cards.length} cards total)</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  Batch: {b} ({batchCounts[b]} cards)
                </option>
              ))}
            </select>
          </div>

          {/* QR Code Target Domain */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                QR Code Base Domain
              </label>
              <button
                type="button"
                onClick={() => setDomain('http://10.181.73.119:3000')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Use Wi-Fi IP (for phone testing)
              </button>
            </div>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://yourdomain.com"
              className="w-full min-h-[48px] px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Each printed QR will point to <code className="font-mono text-blue-600 dark:text-blue-400">{domain || 'https://domain.com'}/c/CODE</code>. When deployed to Vercel, change this to your production URL.
            </p>
          </div>

          {/* Batch Summary card */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cards Selected
              </span>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {currentCount} Cards
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Each QR PNG is 300x300 px
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              type="button"
              variant="primary"
              disabled={currentCount === 0 || isDownloading}
              loading={isDownloading}
              onClick={handleDownloadZip}
              className="flex-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR ZIP
            </Button>

            <Link
              href={`/admin/export/print?batch=${encodeURIComponent(selectedBatch)}${domain ? `&domain=${encodeURIComponent(domain)}` : ''}`}
              target="_blank"
              className={`inline-flex items-center justify-center min-h-[48px] px-6 py-3 text-base font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors flex-1 ${
                currentCount === 0 ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Open Printable Grid ↗
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
