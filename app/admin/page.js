import Link from 'next/link';

export const metadata = {
  title: 'Admin Home | NFC QRS',
};

export default function AdminHomePage() {
  const actions = [
    {
      title: 'Quick Assign',
      description: 'Scan a card with your camera or enter its number to instantly assign it to a shop.',
      href: '/admin/quick-assign',
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      badge: 'Fastest',
    },
    {
      title: 'Manage Cards',
      description: 'Search, filter, edit destination URLs, test redirects, or disable inactive cards.',
      href: '/admin/cards',
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      badge: 'All Cards',
    },
    {
      title: 'Generate Batch',
      description: 'Create a new batch of unique QR cards and export printable codes or ZIP files.',
      href: '/admin/generate',
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      badge: 'Production',
    },
  ];

  const secondaryLinks = [
    { label: 'View Dashboard Stats', href: '/admin/dashboard', desc: 'Scan analytics and card counts' },
    { label: 'Manage Shops', href: '/admin/shops', desc: 'Add or update shop websites' },
    { label: 'Export & Print QRs', href: '/admin/export', desc: 'Download QR code images' },
    { label: 'How-to Guide', href: '/admin/help', desc: '4 simple steps to get started' },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          QR Card Management
        </h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
          What would you like to do today?
        </p>
      </div>

      {/* 3 Big Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {actions.map((act) => (
          <Link
            key={act.title}
            href={act.href}
            className={`group relative flex flex-col justify-between p-6 rounded-2xl shadow-md transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl ${act.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {act.icon}
                </div>
                {act.badge && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/25 px-2.5 py-1 rounded-full text-white">
                    {act.badge}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mb-2">{act.title}</h2>
              <p className="text-sm text-white/90 leading-relaxed">
                {act.description}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold">
              <span>Open</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick shortcuts panel */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
          Quick Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {secondaryLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all flex flex-col justify-center"
            >
              <span className="font-semibold text-gray-900 dark:text-white text-base">
                {item.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.desc}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
