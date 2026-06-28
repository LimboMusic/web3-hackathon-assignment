import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function useTradeDetailEntrance(scopeRef: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.trade-animate', {
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

export function highlightTimelineStep(stepEl: HTMLElement | null) {
  if (!stepEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(
    stepEl.querySelector('.trade-tl-dot'),
    { scale: 1.2, boxShadow: '0 0 0 6px rgba(37, 99, 235, 0.25)' },
    { scale: 1, boxShadow: '0 0 0 0 rgba(37, 99, 235, 0)', duration: 0.5, ease: 'power2.out' },
  );
}

export function highlightFundsBox(boxEl: HTMLElement | null) {
  if (!boxEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(
    boxEl,
    { backgroundColor: 'rgba(37, 99, 235, 0.12)' },
    { backgroundColor: 'transparent', duration: 0.6, ease: 'power2.out' },
  );
}

export function animateTradeLogEntry(entryEl: HTMLElement | null) {
  if (!entryEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    gsap.set(entryEl, { opacity: 1, x: 0 });
    return;
  }
  gsap.fromTo(entryEl, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
}
