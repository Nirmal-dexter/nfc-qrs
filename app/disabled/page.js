export const metadata = {
  title: 'Card Inactive | NFC QRS',
};

export default function DisabledCardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Card Inactive</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          This card is currently disabled or no longer active. Please contact the card issuer or store for assistance.
        </p>
      </div>
    </div>
  );
}
