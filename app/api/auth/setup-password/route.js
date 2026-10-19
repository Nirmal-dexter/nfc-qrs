import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Please provide a valid email and a password of at least 6 characters.' },
        { status: 400 }
      );
    }

    // 1. Check if email is in admins table (or check if any admins exist)
    const { data: adminRecord, error: adminErr } = await supabaseAdmin
      .from('admins')
      .select('email')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (adminErr) {
      console.error('Error querying admins table:', adminErr);
      return NextResponse.json(
        { error: `Database error: ${adminErr.message}. Make sure schema.sql has been run in Supabase.` },
        { status: 500 }
      );
    }

    // If email is not in admins table, let's inform the user clearly
    if (!adminRecord) {
      // Fetch current admin emails to give a helpful tip
      const { data: allAdmins } = await supabaseAdmin.from('admins').select('email');
      const adminList = (allAdmins || []).map((a) => a.email).join(', ');

      return NextResponse.json(
        {
          error: `The email "${cleanEmail}" is not listed in the admins table. Authorized emails: [${adminList || 'None yet'}].`,
        },
        { status: 403 }
      );
    }

    // 2. Check if user already exists in auth.users
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error('Error listing auth users:', listErr);
    }

    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      // Update password and confirm email so they can log in immediately
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          email_confirm: true,
        }
      );
      if (updateErr) {
        throw updateErr;
      }
    } else {
      // Create user directly with confirmed email and password
      const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
      });
      if (createErr) {
        throw createErr;
      }
    }

    return NextResponse.json({ success: true, email: cleanEmail });
  } catch (err) {
    console.error('Error in setup-password API route:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to configure login. Please check server logs.' },
      { status: 500 }
    );
  }
}
