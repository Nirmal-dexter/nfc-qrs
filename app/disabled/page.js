import Link from 'next/link';

export const metadata = {
  title: 'Card Inactive | NFC QRS',
};

export default function DisabledCardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Card Inactive</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This card is currently disabled and no longer active. Please contact the card issuer or administrator for help.
        </p>
        <div className="pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 text-base font-medium rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
          >
            Admin Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
