export type WalletMode = 'live' | 'mock';

export interface ContractBasics {
  deliveryWindow: bigint;
  confirmWindow: bigint;
  nextItemId: bigint;
  activeArbiterCount: bigint;
}

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
