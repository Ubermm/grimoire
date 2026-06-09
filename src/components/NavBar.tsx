//@ts-nocheck
'use client';
// Global chrome, set in the scholarly-press language: serif wordmark, mono
// small-caps nav, hairline rules, rectangular auth pair. Ink over the dark
// marketing surface; paper over the light product modules.
import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut } from "lucide-react";
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const useLight = () => {
  const pathname = usePathname();
  return pathname?.startsWith('/ai-act') || pathname?.startsWith('/audit') || pathname?.startsWith('/analytics') || pathname?.startsWith('/docs');
};

const NavLink = ({ href, label }) => {
  const pathname = usePathname();
  const light = useLight();
  const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={`
        font-plex relative px-3 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors
        ${isActive
          ? (light ? 'text-neutral-900' : 'text-white')
          : (light ? 'text-neutral-500 hover:text-neutral-900' : 'text-white/50 hover:text-white')}
      `}
    >
      {isActive && <span className="absolute left-3 right-3 -bottom-px h-px bg-current" aria-hidden />}
      {label}
    </Link>
  );
};

const DocsDropdown = () => {
  const light = useLight();
  const docPages = [
    { href: '/docs/overview', label: 'Overview', description: 'System architecture overview' },
    { href: '/docs/quickstart', label: 'Quickstart', description: 'Get started quickly' },
    { href: '/docs/eu-ai-act', label: 'EU AI Act', description: 'Classify, screen & audit AI systems' },
    { href: '/docs/prolog-validation', label: 'Prolog Validation', description: 'Logic validation tools' },
    { href: '/docs/letter-comparison', label: 'Letter Comparison', description: 'Compare document similarities' },
    { href: '/docs/similar-violations', label: 'Letter Similarity Search', description: 'Find Similar Warning Letters for Cross-reference' },
    { href: '/docs/ai-best-practices', label: 'AI Best Practices', description: 'Guidelines for AI implementation' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`font-plex flex items-center gap-1.5 px-3 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors ${light ? 'text-neutral-500 hover:text-neutral-900' : 'text-white/50 hover:text-white'}`}>
          Docs
          <span className="text-[0.6rem]" aria-hidden>▾</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 w-72 rounded-none border border-white/[0.14] bg-[#0b0a09] p-0">
        {docPages.map((page, i) => (
          <DropdownMenuItem key={page.href} className="rounded-none p-0 focus:bg-white/[0.06]">
            <Link href={page.href} className="flex w-full items-baseline gap-3 border-b border-white/[0.07] px-4 py-3 last:border-b-0">
              <span className="font-plex shrink-0 text-[0.65rem] text-white/30">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-white/90">{page.label}</span>
                <span className="mt-0.5 text-xs text-white/45">{page.description}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AuthButton = () => {
  const router = useRouter();
  const light = useLight();
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // Handle unauthenticated state
    },
  });

  const handleLogin = () => router.push('/login');
  const handleRegister = () => router.push('/register');
  const STORAGE_KEY = 'app_auth_state';
  const handleSignOut = async () => {
    localStorage.setItem(STORAGE_KEY, 'false');
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (status === 'loading') {
    return <span className={`font-plex px-3 text-[0.72rem] uppercase tracking-[0.14em] ${light ? 'text-neutral-400' : 'text-white/40'}`}>…</span>;
  }

  if (status === 'unauthenticated') {
    // Rectangular editorial pair — hairline Log in, filled Sign up.
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleLogin}
          className={`font-plex border px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] transition-colors ${light ? 'border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900' : 'border-white/25 text-white/75 hover:border-white/60 hover:text-white'}`}
        >
          Log in
        </button>
        <button
          onClick={handleRegister}
          className={`font-plex group inline-flex items-center gap-1.5 border px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] transition-colors ${light ? 'border-[#141310] bg-[#141310] text-[#fbfaf7] hover:bg-transparent hover:text-[#141310]' : 'border-[#e8e6e1] bg-[#e8e6e1] text-[#0b0a09] hover:bg-transparent hover:text-[#e8e6e1]'}`}
        >
          Sign up
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
        </button>
      </div>
    );
  }

  // Prefer a display name; fall back to the email's local part (domain hidden)
  // so we never surface the full email address in the chrome.
  const displayName =
    session?.user?.name?.trim() ||
    (session?.user?.email
      ? session.user.email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Account');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center gap-2.5 border border-transparent px-2 py-1.5 transition-colors ${light ? 'hover:border-neutral-300' : 'hover:border-white/20'}`}>
          <Image
            src={`/logoo.png`}
            alt={displayName}
            width={30}
            height={30}
            className="rounded-full"
          />
          <span className={`font-plex hidden text-[0.72rem] uppercase tracking-[0.12em] md:inline ${light ? 'text-neutral-700' : 'text-white/80'}`}>{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none border border-white/[0.14] bg-[#0b0a09] p-0">
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer rounded-none px-4 py-2.5 focus:bg-white/[0.06]"
        >
          <LogOut className="mr-2 h-3.5 w-3.5 text-white/60" />
          <span className="font-plex text-[0.72rem] uppercase tracking-[0.12em] text-white/85">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const NavBar = () => {
  const pathname = usePathname();
  const light = useLight();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/audit', label: 'Audits' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/ai-act', label: 'EU AI Act' },
  ];

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300
        ${light
          ? 'border-black/[0.08] bg-[#faf9f6]/90 backdrop-blur-xl'
          : `border-white/[0.14] ${scrolled ? 'bg-[#0b0a09]/85 backdrop-blur-md' : 'bg-[#0b0a09]'}`}
      `}>
        <div className="mx-auto max-w-6xl px-6 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className={`font-serif-display text-[1.45rem] font-medium tracking-tight transition-colors ${light ? 'text-neutral-900 hover:text-black' : 'text-white hover:text-white/80'}`}
            >
              Grimoire One
            </Link>

            <div className="hidden items-center gap-5 md:flex">
              <div className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
                <DocsDropdown />
              </div>
              <span className={`h-5 w-px ${light ? 'bg-black/10' : 'bg-white/[0.14]'}`} aria-hidden />
              <AuthButton />
            </div>

            <button
              className={`p-2 transition-colors md:hidden ${light ? 'text-neutral-700 hover:text-neutral-900' : 'text-white/80 hover:text-white'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer — an ink index. */}
        <div
          className={`
            fixed top-0 right-0 h-screen w-[290px]
            border-l border-white/[0.14] bg-[#0b0a09]
            transform transition-transform duration-500 ease-in-out
            pt-16
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            md:hidden
          `}
        >
          <button
            className="absolute right-4 top-4 p-2 text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>

          <div className="flex h-full flex-col overflow-y-auto p-6">
            <div className="border-b border-white/[0.14] pb-5">
              <AuthButton />
            </div>

            <div className="mt-4 divide-y divide-white/[0.07]">
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    font-plex flex items-baseline gap-3 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-colors
                    ${pathname === link.href ? 'text-white' : 'text-white/55 hover:text-white'}
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-[0.65rem] text-white/30">{String(i + 1).padStart(2, '0')}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Docs index */}
            <div className="mt-6 border-t border-white/[0.14] pt-5">
              <span className="font-plex text-[0.65rem] uppercase tracking-[0.22em] text-white/35">
                Documentation
              </span>
              <div className="mt-2 divide-y divide-white/[0.07]">
                {[
                  'Overview',
                  'Quickstart',
                  'EU AI Act',
                  'Prolog Validation',
                  'Letter Comparison',
                  'AI Best Practices',
                ].map((item) => (
                  <Link
                    key={item}
                    href={`/docs/${item.toLowerCase().replaceAll(' ', '-')}`}
                    className="block py-2.5 text-sm text-white/60 transition-colors hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className="h-[60px]" />
    </>
  );
};
