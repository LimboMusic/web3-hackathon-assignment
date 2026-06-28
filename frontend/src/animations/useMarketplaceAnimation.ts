import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function useMarketplaceEntrance(scopeRef: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.mkt-animate', {
          opacity: 0,
          y: 14,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
        });
      });
      return () => mm.revert();
    },
    { scope: scopeRef },
  );
}

export function animateMarketplaceCards(scopeEl: HTMLElement | null) {
  if (!scopeEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  const cards = scopeEl.querySelectorAll('.item-card');
  gsap.from(cards, {
    opacity: 0,
    y: 10,
    duration: 0.35,
    stagger: 0.05,
    ease: 'power2.out',
  });
}

export function flashMarketplaceCard(cardEl: HTMLElement | null) {
  if (!cardEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(
    cardEl,
    { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.35)' },
    { boxShadow: '0 0 0 8px rgba(37, 99, 235, 0)', duration: 0.5, ease: 'power2.out' },
  );
}

export function flashStatusBadge(badgeEl: HTMLElement | null) {
  if (!badgeEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(badgeEl, { scale: 1.15 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
}
