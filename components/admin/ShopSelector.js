'use client';

import { useState, useRef, useEffect } from 'react';

export default function ShopSelector({
  shops = [],
  selectedShopId = null,
  onSelect,
  disabled = false,
  placeholder = 'Select a shop...',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedShop = shops.find((s) => s.id === selectedShopId);

  const filteredShops = shops.filter((s) => {
    const q = search.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(q);
    const urlMatch = s.url?.toLowerCase().includes(q);
    return nameMatch || urlMatch;
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left flex items-center justify-between text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <div className="truncate pr-2">
          {selectedShop ? (
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {selectedShop.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {selectedShop.url}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {placeholder}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search box inside dropdown */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops by name or URL..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
            {/* Option to clear/unassign */}
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
                setSearch('');
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 transition-colors"
            >
              <span>None (Leave Unassigned)</span>
              {!selectedShopId && (
                <span className="text-blue-600 font-bold">✓</span>
              )}
            </button>

            {filteredShops.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No shops found
              </div>
            ) : (
              filteredShops.map((shop) => {
                const isSelected = shop.id === selectedShopId;
                return (
                  <button
                    key={shop.id}
                    type="button"
                    onClick={() => {
                      onSelect(shop.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {shop.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {shop.url}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold ml-2">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
