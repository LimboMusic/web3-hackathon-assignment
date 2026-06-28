import type { ChainEventType, TradeState } from './demo';

export type ClosureReason = 'confirm' | 'refund' | 'timeout' | null;

export interface TradeFunds {
  escrowAmount: string;
  sellerDeposit: string;
  buyerDisputeDeposit: string;
  sellerDisputeDeposit: string;
  pendingWithdrawals: string;
  fundsNote: string;
}

export interface TradeDetailMock {
  itemId: number;
  title: string;
  description: string;
  priceEth: string;
  seller: string;
  sellerShort: string;
  buyer: string;
  buyerShort: string;
  metadataHash: string;
  evidenceHash: string;
  state: TradeState;
  refundRequested: boolean;
  deliveredAt: string | null;
  confirmDeadlinePassed: boolean;
  closureReason: ClosureReason;
}

export interface TradePageEvent {
  id: string;
  time: string;
  type: ChainEventType;
  description: string;
  txHash: string;
}

export interface ActionAvailability {
  enabled: boolean;
  reason: string;
}
