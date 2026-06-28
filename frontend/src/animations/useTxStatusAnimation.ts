import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { TxStatus } from '../types/demo';
import { DEMO_BUYER_SHORT } from '../utils/walletMatch';

interface TxFlowCallbacks {
  onPending: () => void;
  onSuccess: () => void;
  onIdle: () => void;
  onFailed?: () => void;
}

export function useTxStatusAnimation(
  dotRef: React.RefObject<HTMLElement | null>,
  textRef: React.RefObject<HTMLElement | null>,
  callbacks: TxFlowCallbacks,
) {
  const pulseTween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      return () => {
        pulseTween.current?.kill();
      };
    },
    { scope: dotRef },
  );

  const startPulse = useCallback(() => {
    if (!dotRef.current) return;
    pulseTween.current?.kill();
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      pulseTween.current = gsap.to(dotRef.current, {
        scale: 1.3,
        opacity: 0.7,
        duration: 0.75,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    });
  }, [dotRef]);

  const stopPulse = useCallback(() => {
    pulseTween.current?.kill();
    if (dotRef.current) {
      gsap.to(dotRef.current, { scale: 1, opacity: 1, duration: 0.2 });
    }
  }, [dotRef]);

  const playTxFlow = useCallback(
    (mode: 'connect' | 'demo' | 'failed' = 'connect') => {
      const tl = gsap.timeline();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        if (mode === 'failed') {
          callbacks.onPending();
          callbacks.onFailed?.();
          return DEMO_BUYER_SHORT;
        }
        callbacks.onPending();
        callbacks.onSuccess();
        setTimeout(() => callbacks.onIdle(), 100);
        return DEMO_BUYER_SHORT;
      }

      if (mode === 'failed') {
        tl.call(() => {
          callbacks.onPending();
          startPulse();
        })
          .to({}, { duration: 0.8 })
          .call(() => {
            stopPulse();
            callbacks.onFailed?.();
            if (dotRef.current) {
              gsap.fromTo(
                dotRef.current,
                { scale: 1 },
                { scale: 1.4, duration: 0.15, repeat: 3, yoyo: true },
              );
            }
          });
        return null;
      }

      tl.call(() => {
        callbacks.onPending();
        startPulse();
        if (textRef.current) {
          gsap.fromTo(textRef.current, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
        }
      })
        .to({}, { duration: 1.2 })
        .call(() => {
          stopPulse();
          callbacks.onSuccess();
        })
        .to({}, { duration: 1.8 })
        .call(() => {
          callbacks.onIdle();
        });

      return DEMO_BUYER_SHORT;
    },
    [callbacks, dotRef, textRef, startPulse, stopPulse],
  );

  return { playConnectFlow: () => playTxFlow('connect'), playDemoTxFlow: () => playTxFlow('demo'), playFailedFlow: () => playTxFlow('failed') };
}

export function txStatusLabel(status: TxStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'success':
      return 'Success';
    case 'failed':
      return 'Failed';
    default:
      return 'Idle';
  }
}
