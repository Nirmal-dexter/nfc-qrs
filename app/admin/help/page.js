import Link from 'next/link';

export const metadata = {
  title: 'How It Works | NFC QRS',
};

export default function HelpPage() {
  const steps = [
    {
      step: '1',
      emoji: '🖨️',
      title: 'Print cards',
      description:
        'Generate a batch of cards with unique 6-character codes. Download the ZIP file with 300px QR images or open the printable grid to print labels or physical cards.',
      actionLabel: 'Generate Batch →',
      actionHref: '/admin/generate',
      color: 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      step: '2',
      emoji: '📦',
      title: 'Set up your shops',
      description:
        'Create a shop entry for each partner or business. Add their official website URL and any internal contact notes.',
      actionLabel: 'Manage Shops →',
      actionHref: '/admin/shops',
      color: 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      step: '3',
      emoji: '📱',
      title: 'Assign cards',
      description:
        'Use Quick Assign on your phone or desktop. Scan the card’s QR code with your camera or type its number, choose the shop, and tap Save.',
      actionLabel: 'Open Quick Assign →',
      actionHref: '/admin/quick-assign',
      color: 'border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20',
    },
    {
      step: '4',
      emoji: '✅',
      title: 'Done!',
      description:
        'When customers or clients scan the QR code or tap the NFC tag, they instantly redirect to the assigned shop link. You can change destination links anytime without reprinting cards!',
      actionLabel: 'View Dashboard Stats →',
      actionHref: '/admin/dashboard',
      color: 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          How to Use NFC QRS
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A quick guide to deploying dynamic QR cards in 4 simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s) => (
          <div
            key={s.step}
            className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm space-y-4 ${s.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                  {s.emoji}
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Step {s.step}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {s.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {s.description}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href={s.actionHref}
                className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {s.actionLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Helpful tip box */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          💡 Pro Tip: Re-assign Anytime
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Physical cards never expire! If a shop updates its URL or a client changes hands, simply navigate to{' '}
          <Link href="/admin/cards" className="text-blue-600 underline">
            Cards
          </Link>{' '}
          or{' '}
          <Link href="/admin/quick-assign" className="text-blue-600 underline">
            Quick Assign
          </Link>
          , update the assignment, and the redirect updates immediately for all future scans.
        </p>
      </div>
    </div>
  );
}
