import { useCallback } from 'react';
import gsap from 'gsap';

export function animateToastIn(element: HTMLElement | null) {
  if (!element) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    gsap.set(element, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(element, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
}

export function useToastAnimation() {
  const animateOut = useCallback((element: HTMLElement | null, onComplete: () => void) => {
    if (!element) {
      onComplete();
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      onComplete();
      return;
    }
    gsap.to(element, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in',
      onComplete,
    });
  }, []);

  return { animateToastIn, animateOut };
}

export function animateEventItemIn(element: HTMLElement | null) {
  if (!element) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    gsap.set(element, { opacity: 1, x: 0 });
    return;
  }
  gsap.fromTo(
    element,
    { opacity: 0, x: -12, height: 0 },
    { opacity: 1, x: 0, height: 'auto', duration: 0.35, ease: 'power2.out' },
  );
}
