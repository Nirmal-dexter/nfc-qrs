import Link from 'next/link';

export const metadata = {
  title: 'Card Not Found | NFC QRS',
};

export default function CardNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Card Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We could not find an active card associated with this QR code or URL.
        </p>
        <div className="pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 text-base font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
