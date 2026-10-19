'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from './ConfirmDialog';

export default function CardTable({
  cards = [],
  shops = [],
  batches = [],
  isNeglectedView = false,
  onUpdateCard,
  onDeleteCard,
  onBulkDeleteCards,
  onBulkRestoreCards,
  onChangeShopClick,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [shopFilter, setShopFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Selected card IDs for bulk actions in Neglected view
  const [selectedIds, setSelectedIds] = useState(new Set());

  // State for disable confirmation modal
  const [confirmCard, setConfirmCard] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // State for neglect confirmation modal
  const [neglectCard, setNeglectCard] = useState(null);
  const [isNeglecting, setIsNeglecting] = useState(false);

  // State for permanent delete confirmation modal (single)
  const [deleteCard, setDeleteCard] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for bulk delete confirmation modal
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Search
      const q = search.trim().toLowerCase();
      if (q) {
        const numMatch = String(card.card_number || '').includes(q);
        const codeMatch = (card.code || '').toLowerCase().includes(q);
        const shopNameMatch = (card.shops?.name || '').toLowerCase().includes(q);
        if (!numMatch && !codeMatch && !shopNameMatch) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && card.status !== statusFilter) {
        return false;
      }

      // Batch
      if (batchFilter !== 'all' && card.batch_name !== batchFilter) {
        return false;
      }

      // Shop
      if (shopFilter !== 'all') {
        if (shopFilter === 'none') {
          if (card.shop_id) return false;
        } else if (card.shop_id !== shopFilter) {
          return false;
        }
      }

      return true;
    });
  }, [cards, search, statusFilter, batchFilter, shopFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCards.length / pageSize) || 1;
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCards.slice(start, start + pageSize);
  }, [filteredCards, currentPage, pageSize]);

  // Select / Deselect All
  function handleSelectAll(e) {
    if (e.target.checked) {
      const allIds = new Set(filteredCards.map((c) => c.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  }

  function handleToggleSelect(cardId) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }

  async function handleToggleStatus(card) {
    if (card.status === 'disabled') {
      const newStatus = card.shop_id ? 'assigned' : 'unassigned';
      if (onUpdateCard) {
        await onUpdateCard(card.id, { status: newStatus });
      }
    } else {
      setConfirmCard(card);
    }
  }

  async function handleConfirmDisable() {
    if (!confirmCard) return;
    try {
      setIsUpdatingStatus(true);
      if (onUpdateCard) {
        await onUpdateCard(confirmCard.id, { status: 'disabled' });
      }
      setConfirmCard(null);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleConfirmNeglect() {
    if (!neglectCard) return;
    try {
      setIsNeglecting(true);
      if (onUpdateCard) {
        await onUpdateCard(neglectCard.id, { is_neglected: true });
      }
      setNeglectCard(null);
    } finally {
      setIsNeglecting(false);
    }
  }

  async function handleRestoreCard(card) {
    if (onUpdateCard) {
      await onUpdateCard(card.id, { is_neglected: false });
    }
  }

  async function handleConfirmSingleDelete() {
    if (!deleteCard) return;
    try {
      setIsDeleting(true);
      if (onDeleteCard) {
        await onDeleteCard(deleteCard.id);
      }
      setDeleteCard(null);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleConfirmBulkDelete() {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkDeleting(true);
      if (onBulkDeleteCards) {
        await onBulkDeleteCards(Array.from(selectedIds));
      }
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
    } finally {
      setIsBulkDeleting(false);
    }
  }

  async function handleBulkRestore() {
    if (selectedIds.size === 0) return;
    if (onBulkRestoreCards) {
      await onBulkRestoreCards(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }

  const allSelected =
    filteredCards.length > 0 && selectedIds.size === filteredCards.length;

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search code, #, or shop..."
              className="w-full h-11 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Batch
            </label>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Shop Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Shop
            </label>
            <select
              value={shopFilter}
              onChange={(e) => {
                setShopFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 px-3 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shops</option>
              <option value="none">Unassigned (No Shop)</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
          <span>
            Showing {filteredCards.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredCards.length)} of {filteredCards.length} cards
          </span>
          {(search || statusFilter !== 'all' || batchFilter !== 'all' || shopFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setBatchFilter('all');
                setShopFilter('all');
                setCurrentPage(1);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Neglected View: Bulk Select & Delete Bar */}
      {isNeglectedView && filteredCards.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Select All ({filteredCards.length})
              </span>
            </label>
            {selectedIds.size > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {selectedIds.size} Selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handleBulkRestore}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
                >
                  Restore Selected ({selectedIds.size}) ↺
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedIds.size})
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedIds(new Set(filteredCards.map((c) => c.id)));
                  setShowBulkDeleteConfirm(true);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
              >
                Select All & Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cards List / Table */}
      {paginatedCards.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {isNeglectedView ? 'No neglected cards' : 'No cards found'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isNeglectedView
              ? 'Cards you neglect will appear here. You can permanently delete them or restore them anytime.'
              : 'Try adjusting your search or filters, or generate new cards.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {isNeglectedView && (
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-3.5 px-4">Card #</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Shop</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                {paginatedCards.map((card) => {
                  const isChecked = selectedIds.has(card.id);
                  return (
                    <tr
                      key={card.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                        isChecked ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {isNeglectedView && (
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(card.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        <Link
                          href={`/admin/cards/${card.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 underline-offset-2 hover:underline"
                        >
                          #{card.card_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                        {card.code}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        {card.batch_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge status={card.status} />
                          {card.is_neglected && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                              Neglected
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {card.shops ? (
                          <div className="max-w-xs truncate">
                            <Link
                              href={`/admin/shops/${card.shops.id}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                            >
                              {card.shops.name}
                            </Link>
                            {card.custom_url && (
                              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                (custom URL)
                              </span>
                            )}
                          </div>
                        ) : card.custom_url ? (
                          <span className="text-xs text-gray-500 truncate max-w-xs block">
                            {card.custom_url}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isNeglectedView ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestoreCard(card)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 transition-colors"
                              >
                                Restore ↺
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteCard(card)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onChangeShopClick && onChangeShopClick(card)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 transition-colors"
                              >
                                Change Shop
                              </button>
                              <a
                                href={`/c/${card.code}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                Test ↗
                              </a>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(card)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                  card.status === 'disabled'
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300'
                                }`}
                              >
                                {card.status === 'disabled' ? 'Enable' : 'Disable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setNeglectCard(card)}
                                title="Move to Neglected List"
                                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-800 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-amber-900/50 dark:hover:text-amber-200 transition-colors"
                              >
                                Neglect
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {paginatedCards.map((card) => {
              const isChecked = selectedIds.has(card.id);
              return (
                <div
                  key={card.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3 ${
                    isChecked ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {isNeglectedView && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(card.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      )}
                      <div>
                        <Link
                          href={`/admin/cards/${card.id}`}
                          className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600"
                        >
                          Card #{card.card_number}
                        </Link>
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          Code: {card.code} · Batch: {card.batch_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge status={card.status} />
                      {card.is_neglected && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                          Neglected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">
                      Assigned Shop:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {card.shops?.name || (card.custom_url ? 'Custom URL' : 'None (Unassigned)')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                    {isNeglectedView ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestoreCard(card)}
                          className="flex-1 py-2 text-xs font-bold text-center rounded-xl bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300"
                        >
                          Restore ↺
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCard(card)}
                          className="px-4 py-2 text-xs font-bold text-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300"
                        >
                          Delete 🗑
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onChangeShopClick && onChangeShopClick(card)}
                          className="flex-1 py-2 text-xs font-semibold text-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                        >
                          Change Shop
                        </button>
                        <a
                          href={`/c/${card.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          Test ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(card)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl ${
                            card.status === 'disabled'
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                          }`}
                        >
                          {card.status === 'disabled' ? 'Enable' : 'Disable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNeglectCard(card)}
                          className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          Neglect
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="!min-h-[40px] !px-4 !py-2 text-sm"
              >
                ← Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="!min-h-[40px] !px-4 !py-2 text-sm"
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Confirm Disable Modal */}
      <ConfirmDialog
        isOpen={Boolean(confirmCard)}
        onClose={() => setConfirmCard(null)}
        onConfirm={handleConfirmDisable}
        loading={isUpdatingStatus}
        title="Disable Card?"
        message={`Are you sure you want to disable Card #${confirmCard?.card_number} (${confirmCard?.code})? Scans on this card will be blocked until re-enabled.`}
        confirmText="Disable Card"
        confirmVariant="danger"
      />

      {/* Confirm Neglect Modal */}
      <ConfirmDialog
        isOpen={Boolean(neglectCard)}
        onClose={() => setNeglectCard(null)}
        onConfirm={handleConfirmNeglect}
        loading={isNeglecting}
        title={`Neglect Card #${neglectCard?.card_number}?`}
        message={`Card #${neglectCard?.card_number} (${neglectCard?.code}) will NOT be deleted. It will be moved to the Neglected List, hidden from active cards, and excluded from statistics.`}
        confirmText="Neglect Card"
        confirmVariant="danger"
      />

      {/* Confirm Single Delete Modal (Only in Neglected List) */}
      <ConfirmDialog
        isOpen={Boolean(deleteCard)}
        onClose={() => setDeleteCard(null)}
        onConfirm={handleConfirmSingleDelete}
        loading={isDeleting}
        title={`Permanently Delete Card #${deleteCard?.card_number}?`}
        message={`Are you sure you want to PERMANENTLY delete Card #${deleteCard?.card_number} (${deleteCard?.code})? This will delete it completely from the database. This action CANNOT be undone.`}
        confirmText="Delete Permanently"
        confirmVariant="danger"
      />

      {/* Confirm Bulk Delete Modal */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        loading={isBulkDeleting}
        title={`Permanently Delete ${selectedIds.size} Cards?`}
        message={`Are you sure you want to PERMANENTLY delete these ${selectedIds.size} neglected cards? They will be permanently removed from your database. This action CANNOT be undone.`}
        confirmText={`Delete ${selectedIds.size} Cards`}
        confirmVariant="danger"
      />
    </div>
  );
}
