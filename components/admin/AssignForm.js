'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import ShopSelector from './ShopSelector';
import ImageUploadPicker from './ImageUploadPicker';

export default function AssignForm({
  card,
  shops = [],
  onSave,
  onCancel,
  loading = false,
}) {
  const isExistingImage =
    Boolean(card?.custom_url) &&
    (card.custom_url.includes('/card-images/') || card.custom_url.includes('layout='));

  const [destinationMode, setDestinationMode] = useState(
    isExistingImage ? 'image' : 'shop'
  );
  const [selectedShopId, setSelectedShopId] = useState(card?.shop_id || null);
  const [customUrl, setCustomUrl] = useState(card?.custom_url || '');
  const [status, setStatus] = useState(card?.status || 'unassigned');

  // Image Upload state
  const [imageState, setImageState] = useState({
    file: null,
    orientation: card?.custom_url?.includes('layout=horizontal') ? 'horizontal' : 'vertical',
    existingUrl: isExistingImage ? card.custom_url : '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setUploadError('');

    let finalCustomUrl = customUrl.trim() || null;
    let finalShopId = selectedShopId;
    let newStatus = status;

    if (destinationMode === 'image') {
      try {
        setIsUploading(true);

        if (imageState.file) {
          // Upload file to /api/upload
          const formData = new FormData();
          formData.append('file', imageState.file);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to upload image');
          }

          finalCustomUrl = `${data.url}#layout=${imageState.orientation}`;
        } else if (imageState.existingUrl) {
          const clean = imageState.existingUrl.split('#')[0];
          finalCustomUrl = `${clean}#layout=${imageState.orientation}`;
        } else {
          throw new Error('Please select an image file to upload.');
        }

        finalShopId = null;
        if (newStatus === 'unassigned') {
          newStatus = 'assigned';
        }
      } catch (err) {
        setUploadError(err.message || 'Image upload failed');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    } else {
      // Shop Mode
      if (finalShopId || finalCustomUrl) {
        if (newStatus === 'unassigned') {
          newStatus = 'assigned';
        }
      } else if (!finalShopId && !finalCustomUrl) {
        newStatus = 'unassigned';
      }
    }

    onSave({
      shop_id: finalShopId,
      custom_url: finalCustomUrl,
      status: newStatus,
    });
  }

  const isBusy = loading || isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Destination Mode Selector Tabs */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
          Choose What This QR Opens:
        </label>
        <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDestinationMode('shop')}
            disabled={isBusy}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              destinationMode === 'shop'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span>🌐</span> Website Link
          </button>
          <button
            type="button"
            onClick={() => setDestinationMode('image')}
            disabled={isBusy}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              destinationMode === 'image'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span>🖼️</span> Upload Image / Menu
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
          {uploadError}
        </div>
      )}

      {/* Mode 1: Shop Website */}
      {destinationMode === 'shop' ? (
        <div className="space-y-4">
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
              disabled={isBusy}
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
              disabled={isBusy}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Overrides the shop URL if specified.
            </p>
          </div>
        </div>
      ) : (
        /* Mode 2: Upload Image / Menu */
        <div>
          <ImageUploadPicker
            initialUrl={imageState.existingUrl}
            initialOrientation={imageState.orientation}
            onChange={(val) => setImageState(val)}
            disabled={isBusy}
          />
        </div>
      )}

      {/* Card Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Card Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={isBusy}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="unassigned">Unassigned (Inactive)</option>
          <option value="assigned">Assigned (Active Redirect / Image)</option>
          <option value="disabled">Disabled (Blocked)</option>
        </select>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isBusy}
        >
          {isUploading ? 'Uploading Image...' : 'Save Assignment ✓'}
        </Button>
      </div>
    </form>
  );
}
