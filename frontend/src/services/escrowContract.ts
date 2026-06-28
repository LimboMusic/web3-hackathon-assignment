import { Contract, type Provider } from 'ethers';
import { ESCROW_DEPLOYMENT } from '../contracts/escrowDeployment';
import type { ContractBasics } from '../types/wallet';

export function getReadContract(provider: Provider) {
  return new Contract(ESCROW_DEPLOYMENT.address, ESCROW_DEPLOYMENT.abi, provider);
}

export async function fetchContractBasics(provider: Provider): Promise<ContractBasics> {
  const contract = getReadContract(provider);
  const [deliveryWindow, confirmWindow, nextItemId, activeArbiterCount] = await Promise.all([
    contract.deliveryWindow() as Promise<bigint>,
    contract.confirmWindow() as Promise<bigint>,
    contract.nextItemId() as Promise<bigint>,
    contract.activeArbiterCount() as Promise<bigint>,
  ]);

  return {
    deliveryWindow,
    confirmWindow,
    nextItemId,
    activeArbiterCount,
  };
}
