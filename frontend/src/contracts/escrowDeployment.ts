import deployment from '@deployments/sepolia/EscrowMarketplace.json' with { type: 'json' };

export const ESCROW_DEPLOYMENT = {
  address: deployment.address as `0x${string}`,
  abi: deployment.abi,
  chainId: BigInt(deployment.chainId),
  network: deployment.network,
  contractName: deployment.contractName,
} as const;
