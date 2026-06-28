import type { TradeState } from './demo';

export interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  priceEth: string;
  seller: string;
  sellerShort: string;
  state: TradeState;
  metadataHash: string;
  createdAt: string;
  deliveryWindowHours: number;
  confirmWindowHours: number;
  /** Set when a buyer completes purchaseItem() in the demo. */
  buyer?: string;
  buyerShort?: string;
}

export type MarketplaceFilter = 'all' | 'Created' | 'Locked' | 'Delivered' | 'Disputed' | 'Inactive';

export interface PageFeedbackEvent {
  id: string;
  time: string;
  type: 'ItemCreated' | 'ItemPurchased';
  description: string;
  txHash: string;
}
