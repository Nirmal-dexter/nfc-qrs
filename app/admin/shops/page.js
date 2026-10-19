'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirm Dialog state
  const [deleteShopTarget, setDeleteShopTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/shops');
      if (!res.ok) throw new Error('Failed to load shops');
      const data = await res.json();
      setShops(data.shops || []);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setErrorMsg('Could not load shops. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  function handleOpenCreate() {
    setEditingShop(null);
    setFormData({ name: '', url: '', notes: '' });
    setFormError('');
    setModalOpen(true);
  }

  function handleOpenEdit(shop) {
    setEditingShop(shop);
    setFormData({
      name: shop.name || '',
      url: shop.url || '',
      notes: shop.notes || '',
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      setFormError('Name and URL are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      const url = editingShop
        ? `/api/shops/${editingShop.id}`
        : '/api/shops';
      const method = editingShop ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save shop');
      }

      setModalOpen(false);
      fetchShops();
    } catch (err) {
      setFormError(err.message || 'Error saving shop');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteShopTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/shops/${deleteShopTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete shop');
      }

      setDeleteShopTarget(null);
      fetchShops();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredShops = shops.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.url || '').toLowerCase().includes(q) ||
      (s.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Shops
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage business partner destinations and assigned cards.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          + Add New Shop
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shops by name, URL, or notes..."
          className="w-full h-11 px-3.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading shops..." />
      ) : filteredShops.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            No shops found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {search ? 'Try clearing your search query.' : 'Add your first shop to start assigning cards.'}
          </p>
          {!search && (
            <Button variant="primary" onClick={handleOpenCreate}>
              + Add Shop
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/shops/${shop.id}`}
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                  >
                    {shop.name}
                  </Link>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex-shrink-0">
                    {shop.cards_count || 0} cards
                  </span>
                </div>

                <a
                  href={shop.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {shop.url} ↗
                </a>

                {shop.notes && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {shop.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
                <Link
                  href={`/admin/shops/${shop.id}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Details & Scans →
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shop)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Edit shop"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteShopTarget(shop)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete shop"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Shop Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingShop ? 'Edit Shop' : 'Add New Shop'}
        description={
          editingShop
            ? 'Update the shop website or notes.'
            : 'Add a new shop destination for card assignments.'
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Shop Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Green Bakery"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Target Website URL *
            </label>
            <input
              type="text"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://greenbakery.com"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Operational Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contact person, batch notes, or location..."
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              {editingShop ? 'Save Changes' : 'Create Shop'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteShopTarget)}
        onClose={() => setDeleteShopTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete Shop?"
        message={`Are you sure you want to delete "${deleteShopTarget?.name}"? Cards assigned to this shop will become unassigned.`}
        confirmText="Delete Shop"
        confirmVariant="danger"
      />
    </div>
  );
}
