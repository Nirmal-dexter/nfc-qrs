'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import CardTable from '@/components/admin/CardTable';
import Modal from '@/components/ui/Modal';
import AssignForm from '@/components/admin/AssignForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Tab: 'active' or 'neglected'
  const [viewTab, setViewTab] = useState('active');

  // Selected card for Change Shop Modal
  const [activeCardForShop, setActiveCardForShop] = useState(null);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // Undo Toast state
  const [toastInfo, setToastInfo] = useState({
    isOpen: false,
    message: '',
    cardId: null,
    previousState: null,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [cardsRes, shopsRes] = await Promise.all([
        fetch('/api/cards?limit=1000&neglected=all'),
        fetch('/api/shops'),
      ]);

      if (!cardsRes.ok || !shopsRes.ok) {
        throw new Error('Failed to load cards or shops');
      }

      const cardsData = await cardsRes.json();
      const shopsData = await shopsRes.json();

      setCards(cardsData.cards || []);
      setShops(shopsData.shops || []);
    } catch (err) {
      console.error('Error fetching cards data:', err);
      setErrorMsg('Failed to load card records. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Separate active vs neglected cards
  const activeCards = useMemo(() => cards.filter((c) => !c.is_neglected), [cards]);
  const neglectedCards = useMemo(() => cards.filter((c) => Boolean(c.is_neglected)), [cards]);
  const displayedCards = viewTab === 'active' ? activeCards : neglectedCards;

  // Extract distinct batches
  const batches = Array.from(new Set(cards.map((c) => c.batch_name).filter(Boolean)));

  // Update card helper
  async function handleUpdateCard(cardId, updatePayload) {
    const prevCard = cards.find((c) => c.id === cardId);

    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update card');
      }

      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, ...data.card } : c))
      );

      // Trigger undo toast
      let actionLabel = 'updated';
      if (updatePayload.is_neglected === true) actionLabel = 'moved to Neglected List';
      else if (updatePayload.is_neglected === false) actionLabel = 'restored to Active Cards';

      setToastInfo({
        isOpen: true,
        message: `Card #${prevCard?.card_number || ''} ${actionLabel}`,
        cardId,
        previousState: {
          shop_id: prevCard?.shop_id,
          custom_url: prevCard?.custom_url,
          status: prevCard?.status,
          is_neglected: prevCard?.is_neglected,
        },
      });
    } catch (err) {
      alert(`Error updating card: ${err.message}`);
    }
  }

  // Single card delete (Only used in Neglected view)
  async function handleDeleteCard(cardId) {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete card');
      }

      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err) {
      alert(`Error deleting card: ${err.message}`);
    }
  }

  // Bulk delete cards (Only used in Neglected view)
  async function handleBulkDeleteCards(cardIds) {
    try {
      const res = await fetch('/api/cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_ids: cardIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete cards');
      }

      const idSet = new Set(cardIds);
      setCards((prev) => prev.filter((c) => !idSet.has(c.id)));
    } catch (err) {
      alert(`Error deleting cards: ${err.message}`);
    }
  }

  // Bulk restore cards (Only used in Neglected view)
  async function handleBulkRestoreCards(cardIds) {
    try {
      const idSet = new Set(cardIds);
      await Promise.all(
        cardIds.map((id) =>
          fetch(`/api/cards/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_neglected: false }),
          })
        )
      );

      setCards((prev) =>
        prev.map((c) => (idSet.has(c.id) ? { ...c, is_neglected: false } : c))
      );
    } catch (err) {
      alert(`Error restoring cards: ${err.message}`);
    }
  }

  // Handle saving from the modal
  async function handleSaveShopAssignment(payload) {
    if (!activeCardForShop) return;

    try {
      setIsSavingAssignment(true);
      await handleUpdateCard(activeCardForShop.id, payload);
      setActiveCardForShop(null);
    } finally {
      setIsSavingAssignment(false);
    }
  }

  // Handle undo action
  async function handleUndo() {
    if (!toastInfo.cardId || !toastInfo.previousState) return;

    const { cardId, previousState } = toastInfo;
    setToastInfo({ isOpen: false, message: '', cardId: null, previousState: null });

    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previousState),
      });
      const data = await res.json();
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, ...data.card } : c))
        );
      }
    } catch (err) {
      console.error('Failed to undo update:', err);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Cards Inventory
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View, filter, test, manage, and neglect cards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/generate"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            + Generate Cards
          </Link>
        </div>
      </div>

      {/* Tabs: Active Cards vs Neglected List */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-6">
        <button
          type="button"
          onClick={() => setViewTab('active')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            viewTab === 'active'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Active Cards
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            {activeCards.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setViewTab('neglected')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            viewTab === 'neglected'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Neglected List
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            neglectedCards.length > 0
              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}>
            {neglectedCards.length}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading cards inventory..." />
      ) : (
        <CardTable
          cards={displayedCards}
          shops={shops}
          batches={batches}
          isNeglectedView={viewTab === 'neglected'}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onBulkDeleteCards={handleBulkDeleteCards}
          onBulkRestoreCards={handleBulkRestoreCards}
          onChangeShopClick={(card) => setActiveCardForShop(card)}
        />
      )}

      {/* Change Shop Modal */}
      <Modal
        isOpen={Boolean(activeCardForShop)}
        onClose={() => setActiveCardForShop(null)}
        title={`Assign Card #${activeCardForShop?.card_number} (${activeCardForShop?.code})`}
        description="Select which shop website or custom URL this card should redirect to."
      >
        {activeCardForShop && (
          <AssignForm
            card={activeCardForShop}
            shops={shops}
            loading={isSavingAssignment}
            onCancel={() => setActiveCardForShop(null)}
            onSave={handleSaveShopAssignment}
          />
        )}
      </Modal>

      {/* Undo Toast with 5s countdown */}
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
