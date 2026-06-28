import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function useDashboardEntrance(scopeRef: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.dash-animate', {
          opacity: 0,
          y: 16,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power2.out',
        });
      });
      return () => mm.revert();
    },
    { scope: scopeRef },
  );
}

export function calcTimelineProgress(activeIndex: number, totalSteps: number): string {
  if (totalSteps <= 1) return '0%';
  const ratio = activeIndex / (totalSteps - 1);
  const width = 5 + ratio * 90;
  return `${width}%`;
}

export function useTimelineProgress(
  progressRef: React.RefObject<HTMLElement | null>,
  activeIndex: number,
  totalSteps: number,
) {
  useGSAP(
    () => {
      if (!progressRef.current) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(progressRef.current, {
          width: calcTimelineProgress(activeIndex, totalSteps),
          duration: 0.6,
          ease: 'power2.out',
        });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(progressRef.current, {
          width: calcTimelineProgress(activeIndex, totalSteps),
        });
      });
      return () => mm.revert();
    },
    { dependencies: [activeIndex, totalSteps], scope: progressRef, revertOnUpdate: true },
  );
}
