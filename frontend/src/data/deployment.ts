// Source: deployments/sepolia/EscrowMarketplace.json
// Public deployment metadata only — full ABI is not bundled.

import type { ConstructorParamDisplay, SepoliaDeployment } from '../types/deployment';

const SEPOLIA_DEPLOYMENT: SepoliaDeployment = {
  network: 'sepolia',
  chainId: 11155111,
  contractName: 'EscrowMarketplace',
  address: '0xB27396a998cB63c93E432C5106bc027409d962b2',
  transactionHash: '0x5051c249492ea53d91b70a0f94c35a86efe698a5066cef53a0f44c602913512b',
  blockNumber: 11158813,
  deployer: '0xdf300A9a444138a8f503C801d48B7490cD894416',
  deployedAt: '2026-06-28T14:14:23.784Z',
  constructorArgs: {
    deliveryWindow: '3600',
    confirmWindow: '3600',
    arbiterStakeAmount: '100000000000000000',
    minActiveArbiters: '3',
    disputeDeposit: '1000000000000000',
    disputeDepositWindow: '3600',
    disputeWindow: '3600',
    sellerStakeAmount: '1000000000000000',
    reportDeposit: '500000000000000',
  },
  abiFunctionCount: 54,
  abiSource: 'deployments/sepolia/EscrowMarketplace.json',
};

export function getSepoliaDeployment(): SepoliaDeployment {
  return SEPOLIA_DEPLOYMENT;
}

export function shortAddress(address: string): string {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function sepoliaAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function sepoliaTxUrl(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}

export function formatDeployedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatWeiEth(wei: string): string {
  const value = BigInt(wei);
  const whole = value / 10n ** 18n;
  const fraction = value % 10n ** 18n;
  if (fraction === 0n) return `${whole} ETH`;
  const decimals = fraction.toString().padStart(18, '0').replace(/0+$/, '');
  return `${whole}.${decimals} ETH`;
}

export function formatSeconds(seconds: string): string {
  const total = Number(seconds);
  if (total >= 3600 && total % 3600 === 0) {
    return `${total / 3600} 小时`;
  }
  if (total >= 60 && total % 60 === 0) {
    return `${total / 60} 分钟`;
  }
  return `${total} 秒`;
}

export function getConstructorParamDisplays(
  args: SepoliaDeployment['constructorArgs'],
): ConstructorParamDisplay[] {
  return [
    { key: 'arbiterStakeAmount', label: '仲裁员保证金', value: formatWeiEth(args.arbiterStakeAmount) },
    { key: 'sellerStakeAmount', label: '卖家保证金', value: formatWeiEth(args.sellerStakeAmount) },
    { key: 'reportDeposit', label: '举报押金', value: formatWeiEth(args.reportDeposit) },
    { key: 'deliveryWindow', label: '交付窗口', value: formatSeconds(args.deliveryWindow) },
    { key: 'confirmWindow', label: '确认窗口', value: formatSeconds(args.confirmWindow) },
    { key: 'disputeDepositWindow', label: '纠纷响应窗口', value: formatSeconds(args.disputeDepositWindow) },
    { key: 'disputeWindow', label: '仲裁投票窗口', value: formatSeconds(args.disputeWindow) },
    { key: 'minActiveArbiters', label: '最少活跃仲裁员', value: `${args.minActiveArbiters} 名` },
    { key: 'disputeDeposit', label: '纠纷押金', value: formatWeiEth(args.disputeDeposit) },
  ];
}
