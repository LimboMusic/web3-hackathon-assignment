import { getSepoliaDeployment } from './deployment';
import { DEMO_ACCOUNTS } from './demoAccounts';
import type { ClassroomGuideStep, DemoAccount, DemoSequenceStep } from '../types/deployment';

const deployer = getSepoliaDeployment().deployer;

const STATUS_BY_KIND: Record<string, { status: string; statusVariant: DemoAccount['statusVariant'] }> = {
  seller: { status: '节点就绪', statusVariant: 'success' },
  buyer: { status: '节点就绪', statusVariant: 'success' },
  arbiter: { status: '已质押保证金', statusVariant: 'primary' },
  viewer: { status: '只读访问', statusVariant: 'warning' },
};

export function getDemoAccounts(): DemoAccount[] {
  const classroomAccounts: DemoAccount[] = DEMO_ACCOUNTS.map((account) => {
    const meta = STATUS_BY_KIND[account.kind] ?? { status: '节点就绪', statusVariant: 'success' as const };
    return {
      role: account.kind === 'viewer' ? 'buyer' : account.kind,
      roleLabel: account.roleLabel,
      address: account.address,
      addressShort: account.shortAddress,
      responsibility: account.description,
      status: account.id === 'arbiter3' ? '未质押（演示门槛）' : meta.status,
      statusVariant: account.id === 'arbiter3' ? 'warning' : meta.statusVariant,
    };
  });

  classroomAccounts.push({
    role: 'owner',
    roleLabel: 'Owner (合约所有者)',
    address: deployer,
    addressShort: `${deployer.slice(0, 6)}...${deployer.slice(-6)}`,
    responsibility: '部署账户，拥有 Ownable 权限；课堂演示中用于 resolveReport 等管理操作',
    status: '部署账户',
    statusVariant: 'warning',
  });

  return classroomAccounts;
}

export function getDemoSequenceSteps(): DemoSequenceStep[] {
  return [
    {
      order: 1,
      title: '连接钱包',
      description: '载入买卖双边及仲裁员演示账户，确认网络为 Sepolia',
      timeLabel: '准备阶段',
    },
    {
      order: 2,
      title: '创建商品',
      description: '卖家调用 createItem() 挂牌商品，状态进入 Created',
      txHash: '0x8831a4b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6fa4b',
      txHashShort: '0x8831...fa4b',
      timeLabel: '2天前',
    },
    {
      order: 3,
      title: '购买托管',
      description: '买家调用 purchaseItem()，资金锁入合约，状态变为 Locked',
      txHash: '0xbc32c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d900fa',
      txHashShort: '0xbc32...00fa',
      timeLabel: '1天前',
    },
    {
      order: 4,
      title: '交付确认',
      description: '卖家 markDelivered()，买家 confirmReceived() 或进入退款/纠纷分支',
      txHash: '0x5f81a2b3c4d5e6f7a8b9c0d1e2f3a3b4c5d6e7f8a9b0c1d2e3f4a5b6781a',
      txHashShort: '0x5f81...781a',
      timeLabel: '5小时前',
    },
    {
      order: 5,
      title: '退款/纠纷',
      description: '买家 requestRefund() 或 openDispute()，资金进入纠纷流程',
      txHash: '0x4a92b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c89bf2',
      txHashShort: '0x4a92...9bf2',
      timeLabel: '3分钟前',
    },
    {
      order: 6,
      title: '仲裁裁决',
      description: '仲裁员 voteDispute() 投票，达到 2/3 多数后自动执行裁决',
      txHash: '0x7d21c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e31b',
      txHashShort: '0x7d21...e31b',
      timeLabel: '10秒前',
    },
    {
      order: 7,
      title: '提款',
      description: '买卖双方及仲裁员调用 withdrawProceeds() / withdrawArbiterStake() 提取余额',
      txHash: '0xe34a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c91fa',
      txHashShort: '0xe34a...91fa',
      timeLabel: '刚刚',
    },
  ];
}

export function getClassroomGuideSteps(): ClassroomGuideStep[] {
  return [
    { order: 1, text: '点击右上方【连接钱包】，载入买卖双边及仲裁员的演示账户集群。' },
    { order: 2, text: '使用课堂演示控制台切换卖家账号，在 Marketplace 调用 createItem() 模拟上链挂牌。' },
    { order: 3, text: '切换至买家，付款触发 purchaseItem()，向托管合约足额锁仓。' },
    { order: 4, text: '演练正常流（confirmReceived 结算放款）或分歧流（进入 Arbitration 面板多签计票）。' },
  ];
}
