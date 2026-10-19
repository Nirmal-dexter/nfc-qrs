import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ensureHttps } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: shops, error } = await supabaseAdmin
      .from('shops')
      .select('*, cards ( id )')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch shops:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach card count
    const formattedShops = (shops || []).map((shop) => ({
      ...shop,
      cards_count: shop.cards ? shop.cards.length : 0,
      cards: undefined,
    }));

    return NextResponse.json({ shops: formattedShops });
  } catch (err) {
    console.error('Server error in GET /api/shops:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    const rawUrl = (body.url || '').trim();
    const notes = (body.notes || '').trim() || null;

    if (!name) {
      return NextResponse.json({ error: 'Shop name is required' }, { status: 400 });
    }
    if (!rawUrl) {
      return NextResponse.json({ error: 'Shop URL is required' }, { status: 400 });
    }

    const url = ensureHttps(rawUrl);

    const { data: created, error } = await supabaseAdmin
      .from('shops')
      .insert({
        name,
        url,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create shop:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, shop: created });
  } catch (err) {
    console.error('Server error in POST /api/shops:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
