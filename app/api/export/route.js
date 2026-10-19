import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const batch = searchParams.get('batch');

    let query = supabaseAdmin
      .from('cards')
      .select('id, card_number, code, batch_name')
      .order('card_number', { ascending: true })
      .limit(500);

    if (batch && batch !== 'all') {
      query = query.eq('batch_name', batch);
    }

    const { data: cards, error } = await query;

    if (error) {
      console.error('Failed to fetch cards for export:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'No cards found for this batch' },
        { status: 404 }
      );
    }

    // Determine base URL from query param, env var, or request headers
    const customDomain = searchParams.get('domain');
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const origin = customDomain
      ? customDomain.trim().replace(/\/$/, '')
      : (process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`);

    const zip = new JSZip();

    // Generate QR images in parallel or chunks
    for (const card of cards) {
      const cardUrl = `${origin}/c/${card.code}`;
      const qrBuffer = await QRCode.toBuffer(cardUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      const filename = `card-${card.card_number}_${card.code}.png`;
      zip.file(filename, qrBuffer);
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const safeBatchName = (batch || 'all').replace(/[^a-zA-Z0-9_-]/g, '_');

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="qr-batch-${safeBatchName}.zip"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Server error in GET /api/export:', err);
    return NextResponse.json({ error: 'Failed to generate ZIP' }, { status: 500 });
  }
}
