'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params?.id;

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', url: '', notes: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchShopDetail = useCallback(async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch(`/api/shops/${shopId}`);
      if (!res.ok) {
        throw new Error('Shop not found');
      }

      const data = await res.json();
      setShop(data.shop);
      setEditFormData({
        name: data.shop.name || '',
        url: data.shop.url || '',
        notes: data.shop.notes || '',
      });
    } catch (err) {
      console.error('Error loading shop detail:', err);
      setErrorMsg(err.message || 'Error loading shop detail');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShopDetail();
  }, [fetchShopDetail]);

  async function handleUpdateShop(e) {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setEditError('');

      const res = await fetch(`/api/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update shop');
      }

      setShop((prev) => ({ ...prev, ...data.shop }));
      setIsEditModalOpen(false);
    } catch (err) {
      setEditError(err.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading shop information..." />;
  }

  if (errorMsg || !shop) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {errorMsg || 'Shop not found'}
        </h2>
        <Button variant="secondary" onClick={() => router.push('/admin/shops')}>
          Back to Shops
        </Button>
      </div>
    );
  }

  const assignedCards = shop.cards || [];
  const scans = shop.scans || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/shops"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Shops
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-500">{shop.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {shop.name}
          </h1>
          <a
            href={shop.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block mt-0.5"
          >
            {shop.url} ↗
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
            Edit Shop
          </Button>
        </div>
      </div>

      {/* Meta details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-gray-400">
            Assigned Cards
          </span>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            {assignedCards.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-gray-400">
            Total Scans Logged
          </span>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {scans.length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase text-gray-400">
            Date Created
          </span>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
            {formatDate(shop.created_at)}
          </div>
        </div>
      </div>

      {shop.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-1">
            Notes
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {shop.notes}
          </p>
        </div>
      )}

      {/* Assigned Cards List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Assigned Cards ({assignedCards.length})
        </h2>

        {assignedCards.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No cards assigned to this shop yet. Use{' '}
            <Link href="/admin/quick-assign" className="text-blue-600 underline">
              Quick Assign
            </Link>{' '}
            or the Cards page.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3 px-3">Card #</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Batch</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {assignedCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                      #{card.card_number}
                    </td>
                    <td className="py-3 px-3 font-mono">{card.code}</td>
                    <td className="py-3 px-3 text-gray-500">{card.batch_name}</td>
                    <td className="py-3 px-3">
                      <Badge status={card.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/cards/${card.id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        View Card →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scans Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Recent Scans ({scans.length})
        </h2>

        {scans.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No scans recorded yet for cards assigned to this shop.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Country</th>
                  <th className="py-3 px-3">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3 px-3 text-gray-900 dark:text-white">
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

      {/* Edit Shop Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Shop Details"
      >
        <form onSubmit={handleUpdateShop} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs">
              {editError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Shop URL
            </label>
            <input
              type="text"
              required
              value={editFormData.url}
              onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={editFormData.notes}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
