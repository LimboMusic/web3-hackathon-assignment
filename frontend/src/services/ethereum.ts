import { BrowserProvider } from 'ethers';
import type { EthereumProvider } from '../types/wallet';

export const SEPOLIA_CHAIN_ID = 11155111n;

export function getInjectedProvider(): EthereumProvider | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.ethereum;
}

export function chainIdToLabel(chainId: bigint): string {
  if (chainId === SEPOLIA_CHAIN_ID) return 'Sepolia 测试网';
  return `Chain ${chainId}`;
}

export async function connectMetaMask() {
  const injected = getInjectedProvider();
  if (!injected) {
    throw new Error('NO_INJECTED_PROVIDER');
  }

  const provider = new BrowserProvider(injected);
  await provider.send('eth_requestAccounts', []);
  const network = await provider.getNetwork();
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return {
    provider,
    chainId: network.chainId,
    address,
  };
}
