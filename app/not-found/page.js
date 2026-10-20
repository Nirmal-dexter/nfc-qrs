export const metadata = {
  title: 'Card Not Found | NFC QRS',
};

export default function CardNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Card Not Found</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          We could not find an active card associated with this QR code or link.
        </p>
      </div>
    </div>
  );
}
