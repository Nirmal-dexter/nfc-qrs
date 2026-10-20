export const metadata = {
  title: 'Card Not Active Yet | NFC QRS',
};

export default function NotAssignedPage({ searchParams }) {
  const number = searchParams?.number || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center space-y-6">
        {/* Contactless / Card Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Card Not Active Yet
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            This card has not been linked to a shop or website yet.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>If you received this card, please contact the business or provider that issued it.</p>
          {number && (
            <p className="font-mono pt-1 text-gray-400 dark:text-gray-500">
              Card Ref: #{number}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
