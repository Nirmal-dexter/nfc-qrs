'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AssignForm from '@/components/admin/AssignForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.id;

  const [card, setCard] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [previousState, setPreviousState] = useState(null);

  const fetchCardData = useCallback(async () => {
    if (!cardId) return;
    try {
      setLoading(true);
      setErrorMsg('');

      const [cardRes, shopsRes] = await Promise.all([
        fetch(`/api/cards/${cardId}`),
        fetch('/api/shops'),
      ]);

      if (!cardRes.ok) {
        throw new Error('Card not found');
      }

      const cardData = await cardRes.json();
      const shopsData = await shopsRes.json();

      setCard(cardData.card);
      setShops(shopsData.shops || []);
    } catch (err) {
      console.error('Failed to load card detail:', err);
      setErrorMsg(err.message || 'Error loading card details');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  async function handleSaveAssignment(payload) {
    if (!card) return;
    try {
      setSaving(true);
      const prev = {
        shop_id: card.shop_id,
        custom_url: card.custom_url,
        status: card.status,
      };

      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update card');
      }

      setPreviousState(prev);
      setCard((prevCard) => ({ ...prevCard, ...data.card }));
      setToastMessage('Card updated successfully!');
      setIsToastOpen(true);
    } catch (err) {
      alert(`Error updating card: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUndo() {
    if (!previousState || !card) return;
    setIsToastOpen(false);

    try {
      setSaving(true);
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previousState),
      });
      const data = await res.json();
      if (res.ok) {
        setCard((prev) => ({ ...prev, ...data.card }));
      }
    } catch (err) {
      console.error('Failed to undo update:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading card details..." />;
  }

  if (errorMsg || !card) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {errorMsg || 'Card not found'}
        </h2>
        <Button variant="secondary" onClick={() => router.push('/admin/cards')}>
          Back to Cards
        </Button>
      </div>
    );
  }

  const destinationUrl = card.custom_url || card.shops?.url || null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/cards"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Cards
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-500">#{card.card_number}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Card #{card.card_number}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/c/${card.code}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            Test Redirect ↗
          </a>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Current Status
            </span>
            <Badge status={card.status} />
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Code
            </span>
            <span className="font-mono font-bold text-gray-900 dark:text-white text-base">
              {card.code}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Batch
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {card.batch_name}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Destination URL
            </span>
            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
              {destinationUrl || 'None (Unassigned)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
            <span>Created: {formatDate(card.created_at)}</span>
            <span>Assigned: {formatDate(card.assigned_at)}</span>
          </div>
        </div>

        {/* Assignment Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Edit Assignment
          </h2>
          <AssignForm
            card={card}
            shops={shops}
            loading={saving}
            onSave={handleSaveAssignment}
          />
        </div>
      </div>

      {/* Scan History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Scan History ({card.scans ? card.scans.length : 0})
          </h2>
        </div>

        {!card.scans || card.scans.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No scans recorded yet for this card.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">Device / User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {card.scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">
                      {formatDate(scan.scanned_at)}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                      {scan.country || 'Global'}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {scan.user_agent || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      <Toast
        isOpen={isToastOpen}
        message={toastMessage}
        onUndo={handleUndo}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
}
