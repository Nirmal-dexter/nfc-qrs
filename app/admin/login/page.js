'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('password'); // 'password' or 'magic_link'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Password Sign In (Bypasses email rate limit completely)
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      // Call our server endpoint to register/confirm the admin account with this password
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate.');
      }

      // Now sign in on the client to establish the session cookie
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Redirect directly to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Password sign in error:', err);
      setErrorMsg(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // 2. Magic Link OTP
  async function handleSendMagicLink(e) {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/api/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (err) {
      console.error('Magic link sign in error:', err);
      setErrorMsg(err.message || 'Failed to send login link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl mb-3 shadow-sm">
            QR
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Sign In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
            Sign in to access your QR card management portal.
          </p>
        </div>

        {/* Tab switch between Password & Magic Link */}
        <div className="flex bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'password'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Password (Instant)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('magic_link');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'magic_link'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Magic Link Email
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password-email-input"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Admin Email
              </label>
              <input
                id="password-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nirmalathityaaam@gmail.com"
                disabled={loading}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose or enter your password"
                disabled={loading}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter any password (min 6 characters). No email confirmation needed!
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full min-h-[48px] text-base font-semibold"
            >
              Sign In Instantly
            </Button>
          </form>
        ) : sent ? (
          <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-green-900 dark:text-green-100">
                Magic link sent!
              </h3>
              <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                We sent a login link to <span className="font-semibold">{email}</span>. Click the link in your email to sign in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-2 block mx-auto"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nirmalathityaaam@gmail.com"
                disabled={loading}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full min-h-[48px] text-base font-semibold"
            >
              Send Magic Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
