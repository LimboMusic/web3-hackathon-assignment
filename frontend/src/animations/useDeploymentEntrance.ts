import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function useDeploymentEntrance(scopeRef: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.dep-animate', {
          opacity: 0,
          y: 16,
          duration: 0.45,
          stagger: 0.07,
          ease: 'power2.out',
        });
      });
      return () => mm.revert();
    },
    { scope: scopeRef },
  );
}

export function flashButtonFeedback(element: HTMLElement | null) {
  if (!element) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(
    element,
    { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.4)' },
    {
      boxShadow: '0 0 0 6px rgba(37, 99, 235, 0)',
      duration: 0.45,
      ease: 'power2.out',
    },
  );
}

export function flashCopyRow(element: HTMLElement | null) {
  if (!element) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  gsap.fromTo(
    element,
    { backgroundColor: 'rgba(37, 99, 235, 0.12)' },
    { backgroundColor: 'transparent', duration: 0.5, ease: 'power2.out' },
  );
}
