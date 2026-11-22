import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files (JPG, PNG, WebP, GIF, SVG) are allowed.' },
        { status: 400 }
      );
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe unique filename
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) ? ext : 'jpg';
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    const { error } = await supabaseAdmin.storage
      .from('card-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage
      .from('card-images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
      fileName,
    });
  } catch (err) {
    console.error('Server error in /api/upload:', err);
    return NextResponse.json({ error: 'Failed to process image upload.' }, { status: 500 });
  }
}
