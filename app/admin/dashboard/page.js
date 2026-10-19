import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import StatsCard from '@/components/admin/StatsCard';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard | NFC QRS',
};

export default async function DashboardPage() {
  let totalCards = 0;
  let assignedCards = 0;
  let unassignedCards = 0;
  let disabledCards = 0;
  let neglectedCards = 0;
  let scansToday = 0;
  let scansTotal = 0;
  let recentScans = [];

  try {
    // Card counts - query cards
    let { data: cards, error: cardsErr } = await supabaseAdmin
      .from('cards')
      .select('status, is_neglected');

    // Fallback if is_neglected column doesn't exist yet
    if (cardsErr && cardsErr.message && cardsErr.message.includes('is_neglected')) {
      const res = await supabaseAdmin.from('cards').select('status');
      cards = res.data;
    }

    if (cards) {
      // Exclude neglected cards from main rankings & stats
      const activeCards = cards.filter((c) => !c.is_neglected);
      neglectedCards = cards.filter((c) => Boolean(c.is_neglected)).length;

      totalCards = activeCards.length;
      assignedCards = activeCards.filter((c) => c.status === 'assigned').length;
      unassignedCards = activeCards.filter((c) => c.status === 'unassigned').length;
      disabledCards = activeCards.filter((c) => c.status === 'disabled').length;
    }

    // Total scans count
    const { count: totalScansCount } = await supabaseAdmin
      .from('scans')
      .select('*', { count: 'exact', head: true });
    scansTotal = totalScansCount || 0;

    // Scans today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabaseAdmin
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .gte('scanned_at', startOfToday.toISOString());
    scansToday = todayCount || 0;

    // Recent scans (excluding neglected cards)
    let { data: scans } = await supabaseAdmin
      .from('scans')
      .select('id, scanned_at, country, user_agent, cards ( card_number, code, is_neglected, shops ( name ) )')
      .order('scanned_at', { ascending: false })
      .limit(20);

    if (scans) {
      recentScans = scans
        .filter((s) => !s.cards?.is_neglected)
        .slice(0, 10);
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of card inventory, assignment status, and QR scan activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/quick-assign"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Quick Assign
          </Link>
          <a
            href="/api/scans?format=csv"
            download
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
          >
            Export Scans CSV
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatsCard
          title="Active Cards"
          value={totalCards.toLocaleString()}
          subtitle={
            neglectedCards > 0
              ? `${neglectedCards} neglected card${neglectedCards > 1 ? 's' : ''} hidden`
              : 'All active generated cards'
          }
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatsCard
          title="Assigned Cards"
          value={assignedCards.toLocaleString()}
          badge={`${totalCards > 0 ? Math.round((assignedCards / totalCards) * 100) : 0}% Active`}
          subtitle="Actively redirecting to shops"
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatsCard
          title="Unassigned Cards"
          value={unassignedCards.toLocaleString()}
          subtitle="Ready for distribution/assignment"
          icon={
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Disabled Cards"
          value={disabledCards.toLocaleString()}
          subtitle="Blocked or inactive cards"
          icon={
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <StatsCard
          title="Scans Today"
          value={scansToday.toLocaleString()}
          subtitle="Since 12:00 AM local time"
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Scans"
          value={scansTotal.toLocaleString()}
          subtitle="All-time scans across active cards"
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Recent Scans
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Latest 10 scans (Active cards only)
          </span>
        </div>

        {recentScans.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No scans recorded yet. Once people scan active cards, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Card</th>
                  <th className="py-3 px-3">Destination Shop</th>
                  <th className="py-3 px-3">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                      {formatDate(scan.scanned_at)}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/admin/cards/${scan.cards?.id}`}
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        Card #{scan.cards?.card_number} ({scan.cards?.code})
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-200">
                      {scan.cards?.shops?.name || 'Custom URL'}
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                      {scan.country || 'Global / Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
