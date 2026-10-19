'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function GeneratePage() {
  const [quantity, setQuantity] = useState(25);
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState(null);

  async function handleGenerate(e) {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 500) {
      setErrorMsg('Please specify a card quantity between 1 and 500.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: qty,
          batch_name: batchName.trim() || 'Default',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate cards');
      }

      setResult(data);
    } catch (err) {
      console.error('Generation error:', err);
      setErrorMsg(err.message || 'An error occurred while generating cards.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Generate Cards
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a batch of new physical QR cards with random 6-character codes.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {result ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-300 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generated {result.count} Cards Successfully!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Batch: <span className="font-semibold text-gray-800 dark:text-gray-200">{batchName || 'Default'}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={`/admin/export?batch=${encodeURIComponent(batchName || 'Default')}`}
              className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Export QR Codes & Print →
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                setResult(null);
                setQuantity(25);
              }}
            >
              Generate More
            </Button>
          </div>

          {/* Quick preview of first few generated cards */}
          {result.cards && result.cards.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 text-left">
              <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">
                Sample Cards Created
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {result.cards.slice(0, 8).map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center"
                  >
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      #{c.card_number}
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {c.code}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleGenerate}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Batch Name
            </label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Summer 2026 Batch"
              disabled={loading}
              className="w-full min-h-[48px] px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Helps group cards when exporting and printing.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quantity of Cards (Max 500)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              className="w-full min-h-[48px] px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 mt-2">
              {[10, 25, 50, 100, 250].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
            >
              Generate {quantity} Cards Now
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
