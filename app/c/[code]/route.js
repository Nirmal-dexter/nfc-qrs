import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ensureHttps } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(request, { params }) {
  const code = params?.code ? params.code.trim().toLowerCase() : '';
  const url = new URL(request.url);
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/not-found`, {
      status: 307,
      headers: NO_CACHE_HEADERS,
    });
  }

  try {
    let { data: card, error } = await supabaseAdmin
      .from('cards')
      .select('id, code, card_number, status, is_neglected, custom_url, shop_id, shops ( id, name, url )')
      .eq('code', code)
      .maybeSingle();

    if (error && error.message && error.message.includes('is_neglected')) {
      const fallback = await supabaseAdmin
        .from('cards')
        .select('id, code, card_number, status, custom_url, shop_id, shops ( id, name, url )')
        .eq('code', code)
        .maybeSingle();
      card = fallback.data;
      error = fallback.error;
    }

    if (error || !card) {
      return NextResponse.redirect(`${origin}/not-found`, {
        status: 307,
        headers: NO_CACHE_HEADERS,
      });
    }

    if (card.status === 'disabled' || card.is_neglected) {
      return NextResponse.redirect(
        `${origin}/disabled?code=${card.code}&number=${card.card_number}`,
        {
          status: 307,
          headers: NO_CACHE_HEADERS,
        }
      );
    }

    const shopUrl = Array.isArray(card.shops) ? card.shops[0]?.url : card.shops?.url;
    const destination = card.custom_url || shopUrl;

    if (card.status === 'unassigned' || !destination) {
      return NextResponse.redirect(
        `${origin}/not-assigned?code=${encodeURIComponent(card.code)}&number=${card.card_number}`,
        {
          status: 307,
          headers: NO_CACHE_HEADERS,
        }
      );
    }

    // Fire and forget scan log
    const userAgent = request.headers.get('user-agent') || null;
    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country') ||
      null;

    supabaseAdmin
      .from('scans')
      .insert({
        card_id: card.id,
        user_agent: userAgent,
        country: country,
      })
      .then(() => {})
      .catch((err) => {
        console.error('Scan logging failed:', err);
      });

    return NextResponse.redirect(ensureHttps(destination), {
      status: 307,
      headers: NO_CACHE_HEADERS,
    });
  } catch (err) {
    console.error('Route error in /c/[code]:', err);
    return NextResponse.redirect(`${origin}/not-found`, {
      status: 307,
      headers: NO_CACHE_HEADERS,
    });
  }
}
