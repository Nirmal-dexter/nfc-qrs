import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('card_id');
    const format = searchParams.get('format');
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    let query = supabaseAdmin
      .from('scans')
      .select('id, card_id, scanned_at, user_agent, country, cards ( card_number, code, batch_name, shops ( name ) )')
      .order('scanned_at', { ascending: false })
      .limit(limit);

    if (cardId) {
      query = query.eq('card_id', cardId);
    }

    const { data: scans, error } = await query;

    if (error) {
      console.error('Failed to fetch scans:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Handle CSV export
    if (format === 'csv') {
      const headers = ['Scan ID', 'Date & Time', 'Card Number', 'Code', 'Batch', 'Shop Name', 'Country', 'User Agent'];
      const rows = (scans || []).map((scan) => {
        const card = scan.cards || {};
        const shop = card.shops || {};
        return [
          `"${scan.id}"`,
          `"${scan.scanned_at || ''}"`,
          `"${card.card_number || ''}"`,
          `"${card.code || ''}"`,
          `"${card.batch_name || ''}"`,
          `"${(shop.name || 'Unassigned').replace(/"/g, '""')}"`,
          `"${scan.country || 'Unknown'}"`,
          `"${(scan.user_agent || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="scans-export-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ scans: scans || [] });
  } catch (err) {
    console.error('Server error in GET /api/scans:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
