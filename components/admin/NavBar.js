'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import { createClient } from '@/lib/supabase/client';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navLinks = [
    { href: '/admin', label: 'Home' },
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/cards', label: 'Cards' },
    { href: '/admin/quick-assign', label: 'Quick Assign' },
    { href: '/admin/shops', label: 'Shops' },
    { href: '/admin/generate', label: 'Generate' },
    { href: '/admin/export', label: 'Export' },
    { href: '/admin/help', label: 'Help' },
  ];

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setIsSigningOut(false);
    }
  }

  function isActive(href) {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                QR
              </span>
              <span>NFC QRS</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="hidden lg:flex items-center gap-3">
            <DarkModeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>

          {/* Mobile menu button & dark mode */}
          <div className="flex items-center gap-2 lg:hidden">
            <DarkModeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                  active
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
