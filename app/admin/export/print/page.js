'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import QRCode from 'qrcode';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PrintableGridPage() {
  const searchParams = useSearchParams();
  const batch = searchParams.get('batch') || 'all';
  const customDomain = searchParams.get('domain') || '';

  const [cards, setCards] = useState([]);
  const [qrMap, setQrMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAndGenerate() {
      try {
        setLoading(true);
        const url = `/api/cards?limit=500${batch !== 'all' ? `&batch=${encodeURIComponent(batch)}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load cards');

        const data = await res.json();
        const loadedCards = data.cards || [];
        setCards(loadedCards);

        // Generate QR data URLs
        const origin = customDomain
          ? customDomain.trim().replace(/\/$/, '')
          : window.location.origin;
        const map = {};
        for (const card of loadedCards) {
          const cardUrl = `${origin}/c/${card.code}`;
          map[card.id] = await QRCode.toDataURL(cardUrl, {
            width: 200,
            margin: 1,
            errorCorrectionLevel: 'M',
          });
        }
        setQrMap(map);
      } catch (err) {
        console.error('Error generating print grid:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAndGenerate();
  }, [batch, customDomain]);

  if (loading) {
    return <LoadingSpinner message="Rendering printable QR codes..." />;
  }

  return (
    <div className="bg-white min-h-screen text-black p-6">
      {/* Non-printed header & controls */}
      <div className="print:hidden max-w-5xl mx-auto mb-8 p-4 rounded-xl bg-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Printable QR Grid</h1>
          <p className="text-xs text-gray-600">
            Batch: {batch} · {cards.length} cards · Ready for standard card stock printing
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow"
        >
          🖨️ Print Sheet (Ctrl + P)
        </button>
      </div>

      {/* Grid of Cards for Printing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-4 print:gap-3 max-w-6xl mx-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            className="border-2 border-dashed border-gray-300 rounded-xl p-3 flex flex-col items-center justify-center text-center break-inside-avoid bg-white"
          >
            {qrMap[card.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrMap[card.id]}
                alt={`QR for #${card.card_number}`}
                className="w-36 h-36 object-contain"
              />
            ) : (
              <div className="w-36 h-36 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Generating...
              </div>
            )}
            <div className="mt-2">
              <span className="text-sm font-extrabold text-black block">
                Card #{card.card_number}
              </span>
              <span className="text-xs font-mono text-gray-600 block">
                {card.code}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
