export type TxStatus = 'idle' | 'pending' | 'success' | 'failed';

export type TradeState =
  | 'Created'
  | 'Locked'
  | 'Delivered'
  | 'DisputeDepositPending'
  | 'Disputed'
  | 'Inactive';

export type ChainEventType =
  | 'ItemCreated'
  | 'ItemPurchased'
  | 'ItemDelivered'
  | 'TradeFinalized'
  | 'DisputeOpened'
  | 'DisputeResolved'
  | 'RefundRequested'
  | 'VoteSubmitted';

export interface ChainEvent {
  id: string;
  time: string;
  type: ChainEventType;
  description: string;
  txHash: string;
}

export interface StatCardData {
  variant: 'primary' | 'secondary' | 'warning' | 'success';
  title: string;
  value: string;
  unit?: string;
  unitClass?: string;
  description: string;
}

export interface DemoTrade {
  itemId: number;
  itemName: string;
  priceEth: string;
  escrowNote: string;
  seller: string;
  buyer: string;
  state: TradeState;
  stateLabel: string;
}

export interface TimelineStepData {
  state: TradeState;
  label: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface DashboardMock {
  contractAddress: string;
  contractAddressShort: string;
  stats: StatCardData[];
  demoTrade: DemoTrade;
  events: ChainEvent[];
  timeline: TimelineStepData[];
  activeStepIndex: number;
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
