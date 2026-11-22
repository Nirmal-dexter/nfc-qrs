import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import ImageViewer from '@/components/ImageViewer';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { code } = params;
  return {
    title: `View Card ${code} | NFC QRS`,
  };
}

export default async function ViewCardImagePage({ params }) {
  const { code } = params;

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
      redirect('/not-found');
    }

    if (card.status === 'disabled' || card.is_neglected) {
      redirect(`/disabled?code=${card.code}&number=${card.card_number}`);
    }

    const shopUrl = Array.isArray(card.shops) ? card.shops[0]?.url : card.shops?.url;
    const destination = card.custom_url || shopUrl;

    if (card.status === 'unassigned' || !destination) {
      redirect(`/not-assigned?code=${encodeURIComponent(card.code)}&number=${card.card_number}`);
    }

    // Parse layout and clean image URL
    let defaultLayout = 'vertical';
    if (destination.includes('layout=horizontal')) {
      defaultLayout = 'horizontal';
    }

    const cleanImageUrl = destination.split('#')[0];
    const shopName = Array.isArray(card.shops) ? card.shops[0]?.name : card.shops?.name;
    const title = shopName || `Card #${card.card_number}`;

    return (
      <ImageViewer
        imageUrl={cleanImageUrl}
        defaultLayout={defaultLayout}
        title={title}
        cardCode={card.code}
        cardNumber={card.card_number}
      />
    );
  } catch (err) {
    console.error('Error rendering image viewer page:', err);
    redirect('/not-found');
  }
}
