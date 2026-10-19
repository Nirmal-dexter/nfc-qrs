import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';
import NavBar from '@/components/admin/NavBar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || headersList.get('next-url') || '';
  const isLoginPage = pathname.includes('/admin/login');

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context
          }
        },
      },
    }
  );

  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data?.session;
  } catch (err) {
    console.warn('Error reading session in admin layout:', err);
  }

  // If on login page, let it render without layout nav shell
  if (isLoginPage) {
    if (session) {
      // If already logged in, redirect to /admin
      redirect('/admin');
    }
    return <>{children}</>;
  }

  // If unauthenticated and not on login page, redirect to /admin/login
  if (!session) {
    redirect('/admin/login');
  }

  // Check if admin email is allowed in admins table
  const userEmail = session.user?.email;
  let isAuthorized = false;

  try {
    const { data: adminRecord } = await supabaseAdmin
      .from('admins')
      .select('email')
      .eq('email', userEmail)
      .maybeSingle();

    if (adminRecord) {
      isAuthorized = true;
    }
  } catch (err) {
    console.error('Error verifying admin authorization:', err);
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            The email <span className="font-semibold text-gray-900 dark:text-white">{userEmail}</span> is not listed as an administrator in the database.
          </p>
          <a
            href="/admin/login"
            className="inline-flex items-center justify-center w-full min-h-[48px] px-6 py-3 text-base font-medium rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
          >
            Sign In with Different Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
