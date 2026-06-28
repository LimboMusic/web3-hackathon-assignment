import { createContext, useContext, type RefObject } from 'react';
import type { ChainEvent, ToastMessage, TradeState, TxStatus } from '../types/demo';
import type { MarketplaceItem } from '../types/marketplace';
import type { DemoAccount, DemoAccountId } from '../types/roles';
import type { ContractBasics, WalletMode } from '../types/wallet';

export interface DemoUIContextValue {
  walletConnected: boolean;
  walletMode: WalletMode;
  walletAddress: string;
  walletAddressFull: string;
  chainId: bigint | null;
  networkLabel: string;
  contractBasics: ContractBasics | null;
  contractReadError: string | null;
  currentAccount: DemoAccount | null;
  setDemoAccount: (id: DemoAccountId) => void;
  disconnectDemo: () => void;
  resetMarketplace: () => void;
  txStatus: TxStatus;
  connecting: boolean;
  toasts: ToastMessage[];
  events: ChainEvent[];
  marketplaceItems: MarketplaceItem[];
  dotRef: RefObject<HTMLSpanElement | null>;
  textRef: RefObject<HTMLSpanElement | null>;
  connectWallet: () => void;
  simulateDemoTx: () => void;
  simulateFailedTx: () => void;
  pushToast: (message: string, type?: ToastMessage['type']) => string;
  dismissToast: (id: string) => void;
  getMarketplaceItem: (itemId: number) => MarketplaceItem | undefined;
  addMarketplaceItem: (item: MarketplaceItem) => void;
  purchaseMarketplaceItem: (
    itemId: number,
    buyer: { address: string; shortAddress: string },
  ) => void;
  syncMarketplaceItemState: (itemId: number, state: TradeState) => void;
  updateMarketplaceItem: (itemId: number, patch: Partial<MarketplaceItem>) => void;
}

export const DemoUIContext = createContext<DemoUIContextValue | null>(null);

export function useDemoUI() {
  const ctx = useContext(DemoUIContext);
  if (!ctx) throw new Error('useDemoUI must be used within DemoUIProvider');
  return ctx;
}
