import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function useArbitrationEntrance(scopeRef: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.arb-animate', {
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

export function animateVoteProgress(barEl: HTMLElement | null, widthPercent: number) {
  if (!barEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    gsap.set(barEl, { width: `${widthPercent}%` });
    return;
  }
  gsap.to(barEl, { width: `${widthPercent}%`, duration: 0.45, ease: 'power2.out' });
}

export function highlightArbiterRow(rowEl: HTMLElement | null) {
  if (!rowEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(
    rowEl,
    { backgroundColor: 'rgba(37, 99, 235, 0.14)' },
    { backgroundColor: 'transparent', duration: 0.55, ease: 'power2.out' },
  );
}

export function pulseVerdictCard(cardEl: HTMLElement | null) {
  if (!cardEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(
    cardEl,
    { scale: 1.03, boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)' },
    { scale: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', duration: 0.5, ease: 'power2.out' },
  );
}
