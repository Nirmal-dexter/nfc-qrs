'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import ShopSelector from './ShopSelector';

export default function AssignForm({
  card,
  shops = [],
  onSave,
  onCancel,
  loading = false,
}) {
  const [selectedShopId, setSelectedShopId] = useState(card?.shop_id || null);
  const [customUrl, setCustomUrl] = useState(card?.custom_url || '');
  const [status, setStatus] = useState(card?.status || 'unassigned');

  function handleSubmit(e) {
    e.preventDefault();

    // Auto update status if assigning a shop and it was unassigned
    let newStatus = status;
    if (selectedShopId || customUrl.trim()) {
      if (newStatus === 'unassigned') {
        newStatus = 'assigned';
      }
    } else if (!selectedShopId && !customUrl.trim()) {
      newStatus = 'unassigned';
    }

    onSave({
      shop_id: selectedShopId,
      custom_url: customUrl.trim() || null,
      status: newStatus,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Assign Shop
        </label>
        <ShopSelector
          shops={shops}
          selectedShopId={selectedShopId}
          onSelect={(shopId) => {
            setSelectedShopId(shopId);
            if (shopId && status === 'unassigned') {
              setStatus('assigned');
            }
          }}
          disabled={loading}
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Scans will redirect directly to this shop&apos;s website.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Custom URL Override (Optional)
        </label>
        <input
          type="text"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="https://example.com/custom-promo"
          disabled={loading}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Overrides the shop URL if specified.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Card Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="unassigned">Unassigned (Inactive)</option>
          <option value="assigned">Assigned (Active Redirect)</option>
          <option value="disabled">Disabled (Blocked)</option>
        </select>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          Save Assignment
        </Button>
      </div>
    </form>
  );
}
