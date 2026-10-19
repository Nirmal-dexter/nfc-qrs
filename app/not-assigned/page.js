import Link from 'next/link';

export const metadata = {
  title: 'Card Not Assigned | NFC QRS',
};

export default function NotAssignedPage({ searchParams }) {
  const code = searchParams?.code || '';
  const number = searchParams?.number || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Card Not Assigned Yet
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This card is ready to be linked to a shop or website.
          </p>
        </div>

        {/* Card Details Card */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-1">
          {number ? (
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              Card #{number}
            </div>
          ) : (
            <div className="text-base font-bold text-gray-700 dark:text-gray-300">
              Card Detected
            </div>
          )}
          {code && (
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
              Unique Code: <span className="font-semibold text-gray-700 dark:text-gray-300">{code}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          <Link
            href={`/admin/quick-assign${number ? `?card=${encodeURIComponent(number)}` : code ? `?card=${encodeURIComponent(code)}` : ''}`}
            className="inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-all"
          >
            ⚡ {number ? `Assign Card #${number} Now` : 'Assign This Card Now'}
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center w-full min-h-[44px] px-4 py-2 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Go to Admin Home
          </Link>
        </div>
      </div>
    </div>
  );
}
