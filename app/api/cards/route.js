import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateCode } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const batch = searchParams.get('batch');
    const shopId = searchParams.get('shop_id');
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    let query = supabaseAdmin
      .from('cards')
      .select('*, shops ( id, name, url )')
      .order('card_number', { ascending: true })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (batch && batch !== 'all') {
      query = query.eq('batch_name', batch);
    }
    if (shopId && shopId !== 'all') {
      if (shopId === 'none') {
        query = query.is('shop_id', null);
      } else {
        query = query.eq('shop_id', shopId);
      }
    }
    if (search) {
      const raw = search.trim();
      const match = raw.match(/\/c\/([a-zA-Z0-9_-]+)/i);
      const cleanQ = match && match[1] ? match[1] : raw.replace(/^#/, '').trim();

      if (!isNaN(cleanQ) && cleanQ !== '' && Number.isInteger(Number(cleanQ))) {
        query = query.or(`card_number.eq.${cleanQ},code.ilike.%${cleanQ}%`);
      } else {
        query = query.ilike('code', `%${cleanQ}%`);
      }
    }

    const neglected = searchParams.get('neglected');
    if (neglected === 'true') {
      query = query.eq('is_neglected', true);
    } else if (neglected !== 'all') {
      // By default return only non-neglected cards
      query = query.or('is_neglected.eq.false,is_neglected.is.null');
    }

    let { data: cards, error } = await query;

    // Fallback if is_neglected column does not exist yet in Supabase
    if (error && error.message && error.message.includes('is_neglected')) {
      let fallbackQuery = supabaseAdmin
        .from('cards')
        .select('*, shops ( id, name, url )')
        .order('card_number', { ascending: true })
        .limit(limit);

      if (status && status !== 'all') fallbackQuery = fallbackQuery.eq('status', status);
      if (batch && batch !== 'all') fallbackQuery = fallbackQuery.eq('batch_name', batch);
      if (shopId && shopId !== 'all') {
        if (shopId === 'none') fallbackQuery = fallbackQuery.is('shop_id', null);
        else fallbackQuery = fallbackQuery.eq('shop_id', shopId);
      }
      if (search) {
        const raw = search.trim();
        const match = raw.match(/\/c\/([a-zA-Z0-9_-]+)/i);
        const cleanQ = match && match[1] ? match[1] : raw.replace(/^#/, '').trim();
        if (!isNaN(cleanQ) && cleanQ !== '' && Number.isInteger(Number(cleanQ))) {
          fallbackQuery = fallbackQuery.or(`card_number.eq.${cleanQ},code.ilike.%${cleanQ}%`);
        } else {
          fallbackQuery = fallbackQuery.ilike('code', `%${cleanQ}%`);
        }
      }
      const res = await fallbackQuery;
      cards = res.data;
      error = res.error;
    }

    if (error) {
      console.error('Failed to fetch cards:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cards: cards || [] });
  } catch (err) {
    console.error('Server error in GET /api/cards:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const quantity = Math.min(Math.max(parseInt(body.quantity, 10) || 1, 1), 500);
    const batchName = (body.batch_name || 'Default').trim();

    // Fetch existing codes to avoid collision
    const { data: existingData } = await supabaseAdmin
      .from('cards')
      .select('code');
    const existingCodes = new Set((existingData || []).map((c) => c.code));

    const newCards = [];
    const generatedInBatch = new Set();

    while (newCards.length < quantity) {
      const code = generateCode();
      if (!existingCodes.has(code) && !generatedInBatch.has(code)) {
        generatedInBatch.add(code);
        newCards.push({
          code,
          batch_name: batchName,
          status: 'unassigned',
        });
      }
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('cards')
      .insert(newCards)
      .select();

    if (error) {
      console.error('Failed to create batch cards:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: inserted ? inserted.length : newCards.length,
      cards: inserted,
    });
  } catch (err) {
    console.error('Server error in POST /api/cards:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { card_ids } = body;

    if (!Array.isArray(card_ids) || card_ids.length === 0) {
      return NextResponse.json(
        { error: 'No card IDs provided for deletion.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('cards')
      .delete()
      .in('id', card_ids);

    if (error) {
      console.error('Failed to bulk delete cards:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: card_ids.length });
  } catch (err) {
    console.error('Server error in bulk DELETE /api/cards:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
