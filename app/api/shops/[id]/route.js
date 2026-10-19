import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ensureHttps } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const { data: shop, error } = await supabaseAdmin
      .from('shops')
      .select('*, cards (*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Get scans for all cards belonging to this shop
    const cardIds = (shop.cards || []).map((c) => c.id);
    let scans = [];
    if (cardIds.length > 0) {
      const { data: scanData } = await supabaseAdmin
        .from('scans')
        .select('*')
        .in('card_id', cardIds)
        .order('scanned_at', { ascending: false })
        .limit(100);
      scans = scanData || [];
    }

    return NextResponse.json({
      shop: {
        ...shop,
        scans,
        scans_count: scans.length,
      },
    });
  } catch (err) {
    console.error('Server error in GET /api/shops/[id]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const body = await request.json();
    const updateData = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: 'Shop name cannot be empty' }, { status: 400 });
      }
      updateData.name = name;
    }

    if (body.url !== undefined) {
      const url = body.url.trim();
      if (!url) {
        return NextResponse.json({ error: 'Shop URL cannot be empty' }, { status: 400 });
      }
      updateData.url = ensureHttps(url);
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes ? body.notes.trim() : null;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('shops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update shop:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, shop: updated });
  } catch (err) {
    console.error('Server error in PATCH /api/shops/[id]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    // Due to on delete set null, cards referencing this shop will have shop_id set to null
    // Let's also update their status to 'unassigned' if they don't have a custom_url
    await supabaseAdmin
      .from('cards')
      .update({ status: 'unassigned' })
      .eq('shop_id', id)
      .is('custom_url', null);

    const { error } = await supabaseAdmin
      .from('shops')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete shop:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Server error in DELETE /api/shops/[id]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
