import { useEffect, useRef } from 'react';
import type { ToastMessage } from '../types/demo';
import { animateToastIn, useToastAnimation } from '../animations/useToastAnimation';

function ToastIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { animateOut } = useToastAnimation();

  useEffect(() => {
    animateToastIn(ref.current);
    const timer = setTimeout(() => {
      animateOut(ref.current, () => onDismiss(toast.id));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss, animateOut]);

  return (
    <div ref={ref} className={`toast ${toast.type === 'info' ? '' : toast.type}`}>
      <ToastIcon />
      <span>{toast.message}</span>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
