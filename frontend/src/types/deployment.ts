export interface ConstructorArgs {
  deliveryWindow: string;
  confirmWindow: string;
  arbiterStakeAmount: string;
  minActiveArbiters: string;
  disputeDeposit: string;
  disputeDepositWindow: string;
  disputeWindow: string;
  sellerStakeAmount: string;
  reportDeposit: string;
}

export interface SepoliaDeployment {
  network: string;
  chainId: number;
  contractName: string;
  address: string;
  transactionHash: string;
  blockNumber: number;
  deployer: string;
  deployedAt: string;
  constructorArgs: ConstructorArgs;
  abiFunctionCount: number;
  abiSource: string;
}

export interface ConstructorParamDisplay {
  key: keyof ConstructorArgs;
  label: string;
  value: string;
}

export type DemoAccountRole =
  | 'seller'
  | 'buyer'
  | 'arbiter'
  | 'owner';

export interface DemoAccount {
  role: DemoAccountRole;
  roleLabel: string;
  address: string;
  addressShort: string;
  responsibility: string;
  status: string;
  statusVariant: 'success' | 'primary' | 'warning';
}

export interface DemoSequenceStep {
  order: number;
  title: string;
  description: string;
  txHash?: string;
  txHashShort?: string;
  timeLabel?: string;
}

export interface ClassroomGuideStep {
  order: number;
  text: string;
}
