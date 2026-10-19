'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShopSelector from '@/components/admin/ShopSelector';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

// Dynamically import QrScanner with ssr: false
const QrScanner = dynamic(() => import('@/components/admin/QrScanner'), {
  ssr: false,
});

export default function QuickAssignPage() {
  const searchParams = useSearchParams();
  const cardParam = searchParams.get('card') || '';

  // Step state: 1 (input/scan), 2 (pick shop), 3 (success)
  const [step, setStep] = useState(1);

  // Card search & selection
  const [inputVal, setInputVal] = useState(cardParam);
  const [isSearchingCard, setIsSearchingCard] = useState(false);
  const [foundCard, setFoundCard] = useState(null);
  const [cardError, setCardError] = useState('');

  // Scanner modal
  const [showScanner, setShowScanner] = useState(false);

  // Shops
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Quick "+ New Shop" modal
  const [showNewShopModal, setShowNewShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopUrl, setNewShopUrl] = useState('');
  const [isCreatingShop, setIsCreatingShop] = useState(false);
  const [newShopError, setNewShopError] = useState('');

  // Step 3 Success details & undo
  const [assignedResult, setAssignedResult] = useState(null);
  const [toastInfo, setToastInfo] = useState({
    isOpen: false,
    message: '',
    cardId: null,
    previousState: null,
  });

  // Load shops list
  async function loadShops() {
    try {
      const res = await fetch('/api/shops');
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops || []);
      }
    } catch (err) {
      console.error('Failed to load shops:', err);
    }
  }

  useEffect(() => {
    loadShops();
    if (cardParam) {
      searchCard(cardParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardParam]);

  // Clean raw input (handles URLs like http://.../c/CODE or #123)
  function cleanQuery(raw) {
    if (!raw) return '';
    const trimmed = raw.trim();
    const match = trimmed.match(/\/c\/([a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed.replace(/^#/, '');
  }

  // Search card by card_number or code
  async function searchCard(query) {
    const rawQ = query !== undefined ? query : inputVal;
    const q = cleanQuery(rawQ);
    if (!q) {
      setCardError('Please enter a card number or scan a code.');
      return;
    }

    try {
      setIsSearchingCard(true);
      setCardError('');
      setFoundCard(null);

      const res = await fetch(`/api/cards?search=${encodeURIComponent(q)}&limit=1`);
      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();
      const list = data.cards || [];

      if (list.length === 0) {
        setCardError(`No card found matching "${q}".`);
        return;
      }

      const card = list[0];
      setFoundCard(card);
      setSelectedShopId(card.shop_id || null);
      setStep(2);
    } catch (err) {
      console.error('Error finding card:', err);
      setCardError('Error finding card. Please check your connection.');
    } finally {
      setIsSearchingCard(false);
    }
  }

  // Handle QR scan decoded result
  function handleScanResult(code) {
    setShowScanner(false);
    setInputVal(code);
    searchCard(code);
  }

  // Create new shop inline
  async function handleCreateNewShop(e) {
    e.preventDefault();
    if (!newShopName.trim() || !newShopUrl.trim()) {
      setNewShopError('Shop name and URL are both required.');
      return;
    }

    try {
      setIsCreatingShop(true);
      setNewShopError('');
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newShopName.trim(),
          url: newShopUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create shop');
      }

      const created = data.shop;
      setShops((prev) => [created, ...prev]);
      setSelectedShopId(created.id);
      setShowNewShopModal(false);
      setNewShopName('');
      setNewShopUrl('');
    } catch (err) {
      setNewShopError(err.message || 'Error creating shop');
    } finally {
      setIsCreatingShop(false);
    }
  }

  // Step 2 -> Step 3: Save assignment
  async function handleSaveAssignment() {
    if (!foundCard) return;

    try {
      setIsSaving(true);
      const prev = {
        shop_id: foundCard.shop_id,
        custom_url: foundCard.custom_url,
        status: foundCard.status,
      };

      const res = await fetch(`/api/cards/${foundCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: selectedShopId,
          status: selectedShopId ? 'assigned' : 'unassigned',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save card assignment');
      }

      const shopName =
        shops.find((s) => s.id === selectedShopId)?.name || 'Unassigned';

      const result = {
        cardNumber: foundCard.card_number,
        shopName,
        cardId: foundCard.id,
        previousState: prev,
      };

      setAssignedResult(result);
      setStep(3);

      // Trigger 5-second undo toast
      setToastInfo({
        isOpen: true,
        message: `Card #${result.cardNumber} assigned to ${result.shopName}`,
        cardId: foundCard.id,
        previousState: prev,
      });
    } catch (err) {
      alert(`Error saving card: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  // Handle undo
  async function handleUndo() {
    if (!toastInfo.cardId || !toastInfo.previousState) return;

    const { cardId, previousState } = toastInfo;
    setToastInfo({ isOpen: false, message: '', cardId: null, previousState: null });

    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previousState),
      });
      // Reset view to step 1
      handleReset();
    } catch (err) {
      console.error('Failed to undo assignment:', err);
    }
  }

  function handleReset() {
    setStep(1);
    setInputVal('');
    setFoundCard(null);
    setSelectedShopId(null);
    setCardError('');
    setAssignedResult(null);
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Quick Card Assign
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Fast 3-step setup to connect a physical card to a shop.
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            1
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 hidden sm:inline">
            Find Card
          </span>
        </div>
        <div className={`h-1 flex-1 mx-3 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            2
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 hidden sm:inline">
            Pick Shop
          </span>
        </div>
        <div className={`h-1 flex-1 mx-3 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step === 3
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
          >
            3
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 hidden sm:inline">
            Done
          </span>
        </div>
      </div>

      {/* STEP 1: Enter Card or Scan */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-5">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Step 1: Identify Card
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Type the card number or tap the camera icon to scan the physical QR code.
            </p>
          </div>

          {cardError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {cardError}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCard()}
                placeholder="Card # (e.g. 1) or Code (e.g. a1b2c3)"
                disabled={isSearchingCard}
                className="flex-1 min-h-[48px] px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                title="Scan QR with camera"
                className="min-h-[48px] px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={() => searchCard()}
              loading={isSearchingCard}
              className="w-full"
            >
              Continue to Step 2 →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Pick Shop */}
      {step === 2 && foundCard && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Card Found
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                Card #{foundCard.card_number}
              </h2>
              <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                Code: {foundCard.code} · Batch: {foundCard.batch_name}
              </div>
            </div>
            <Badge status={foundCard.status} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Destination Shop
              </label>
              <button
                type="button"
                onClick={() => setShowNewShopModal(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + New shop
              </button>
            </div>

            <ShopSelector
              shops={shops}
              selectedShopId={selectedShopId}
              onSelect={(shopId) => setSelectedShopId(shopId)}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              ← Back
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAssignment}
              loading={isSaving}
              className="flex-1"
            >
              Save Assignment ✓
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Big Green Success */}
      {step === 3 && assignedResult && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/60 text-green-600 dark:text-green-300 flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-black text-green-700 dark:text-green-300">
              Saved ✓
            </h2>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              Card #{assignedResult.cardNumber} assigned to {assignedResult.shopName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              QR scans will now immediately redirect to this shop.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              type="button"
              variant="primary"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              Assign Another Card
            </Button>
            <a
              href={`/c/${foundCard?.code}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 text-base font-medium rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
            >
              Test Card ↗
            </a>
          </div>
        </div>
      )}

      {/* Camera QR Scanner Popup */}
      {showScanner && (
        <QrScanner
          onResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* + New Shop Quick Modal */}
      <Modal
        isOpen={showNewShopModal}
        onClose={() => setShowNewShopModal(false)}
        title="Add New Shop"
        description="Quickly create a new shop without leaving quick assign."
      >
        <form onSubmit={handleCreateNewShop} className="space-y-4">
          {newShopError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
              {newShopError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              required
              value={newShopName}
              onChange={(e) => setNewShopName(e.target.value)}
              placeholder="e.g. Downtown Coffee"
              className="w-full min-h-[44px] px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Website URL
            </label>
            <input
              type="text"
              required
              value={newShopUrl}
              onChange={(e) => setNewShopUrl(e.target.value)}
              placeholder="https://downtowncoffee.com"
              className="w-full min-h-[44px] px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowNewShopModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isCreatingShop}
            >
              Create Shop
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5-second Undo Toast */}
      <Toast
        isOpen={toastInfo.isOpen}
        message={toastInfo.message}
        onUndo={handleUndo}
        onClose={() =>
          setToastInfo({ isOpen: false, message: '', cardId: null, previousState: null })
        }
      />
    </div>
  );
}
