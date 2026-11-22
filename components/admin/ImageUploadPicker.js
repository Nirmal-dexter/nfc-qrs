'use client';

import { useState, useRef } from 'react';

export default function ImageUploadPicker({
  initialUrl = '',
  initialOrientation = 'vertical',
  onChange,
  disabled = false,
}) {
  const [orientation, setOrientation] = useState(initialOrientation);
  const [previewUrl, setPreviewUrl] = useState(initialUrl ? initialUrl.split('#')[0] : '');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    if (onChange) {
      onChange({
        file,
        orientation,
        existingUrl: null,
      });
    }
  }

  function handleOrientationChange(newOrientation) {
    setOrientation(newOrientation);
    if (onChange) {
      onChange({
        file: selectedFile,
        orientation: newOrientation,
        existingUrl: selectedFile ? null : previewUrl,
      });
    }
  }

  function handleRemove() {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange({
        file: null,
        orientation,
        existingUrl: '',
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!previewUrl ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            Tap to upload image or take a photo
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            PNG, JPG, WebP up to 10MB (Menus, price lists, flyers, photos)
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/90 p-2 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className={`rounded-xl object-contain ${
              orientation === 'vertical' ? 'max-h-72 w-auto' : 'max-h-48 w-full'
            }`}
          />
          <div className="flex items-center justify-between w-full pt-2 px-1 text-xs">
            <span className="text-gray-300 font-medium">
              {selectedFile ? selectedFile.name : 'Current Image'}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="text-red-400 hover:text-red-300 font-semibold"
            >
              Replace / Remove
            </button>
          </div>
        </div>
      )}

      {/* Orientation Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Select View Orientation for Customer Phones:
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleOrientationChange('vertical')}
            disabled={disabled}
            className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
              orientation === 'vertical'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span className="text-xl">📱</span>
            <div>
              <div className="text-xs font-bold">Vertical (Portrait)</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                Scrollable. Best for tall menus, price cards, flyers.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOrientationChange('horizontal')}
            disabled={disabled}
            className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
              orientation === 'horizontal'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
          >
            <span className="text-xl">💻</span>
            <div>
              <div className="text-xs font-bold">Horizontal (Landscape)</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                Screen-fit. Best for wide banners, business cards.
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
