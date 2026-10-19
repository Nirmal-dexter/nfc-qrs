import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const { data: card, error } = await supabaseAdmin
      .from('cards')
      .select('*, shops ( id, name, url, notes ), scans ( id, scanned_at, user_agent, country )')
      .eq('id', id)
      .maybeSingle();

    if (error || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (err) {
    console.error('Server error in GET /api/cards/[id]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const body = await request.json();
    const updateData = {};

    if (body.shop_id !== undefined) {
      updateData.shop_id = body.shop_id;
    }
    if (body.custom_url !== undefined) {
      updateData.custom_url = body.custom_url ? body.custom_url.trim() : null;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.is_neglected !== undefined) {
      updateData.is_neglected = Boolean(body.is_neglected);
    }

    // Manage assigned_at timestamp
    if (updateData.status === 'assigned' || updateData.shop_id) {
      updateData.assigned_at = new Date().toISOString();
    } else if (updateData.status === 'unassigned' && updateData.shop_id === null) {
      updateData.assigned_at = null;
    }

    const { data: updated, error } = await supabaseAdmin
      .from('cards')
      .update(updateData)
      .eq('id', id)
      .select('*, shops ( id, name, url )')
      .single();

    if (error) {
      console.error('Failed to update card:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, card: updated });
  } catch (err) {
    console.error('Server error in PATCH /api/cards/[id]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const { error } = await supabaseAdmin
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete card:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Server error in DELETE /api/cards/[id]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
