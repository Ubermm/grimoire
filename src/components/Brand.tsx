// Grimoire One brand mark + wordmark. The glyph is drawn in currentColor so it
// inverts cleanly inside the badge; the `light` prop flips the badge/text for
// dark vs light chrome (NavBar/Footer compute it from the route).
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Geometric "G" monogram — a near-full ring with an inward bar.
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M16.8 7.4A6.6 6.6 0 1 0 18.6 13H12.7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Brand({
  light,
  href = '/',
  iconOnly = false,
  className,
}: {
  light?: boolean;
  href?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const badge = light ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900';
  const text = light ? 'text-neutral-900' : 'text-white';
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="Grimoire One home">
      <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:scale-105', badge)}>
        <BrandGlyph className="h-4 w-4" />
      </span>
      {!iconOnly && <span className={cn('font-plex text-[0.95rem] font-semibold tracking-tight', text)}>Grimoire One</span>}
    </Link>
  );
}
