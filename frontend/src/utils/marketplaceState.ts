import type { MarketplaceItem } from '../types/marketplace';

export function stateBadgeClass(state: MarketplaceItem['state']): string {
  if (state === 'Created') return 'status-created';
  if (state === 'Locked') return 'status-locked';
  if (state === 'Delivered') return 'status-delivered';
  if (state === 'Disputed') return 'status-disputed';
  return 'status-inactive';
}

export function stateBadgeLabel(state: MarketplaceItem['state']): string {
  if (state === 'Created') return 'Created (可买)';
  if (state === 'Locked') return 'Locked (托管)';
  if (state === 'Delivered') return 'Delivered (已交付)';
  if (state === 'Disputed') return 'Disputed (纠纷)';
  return 'Inactive (已结束)';
}
