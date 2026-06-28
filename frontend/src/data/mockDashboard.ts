import type { DashboardMock } from '../types/demo';

const CONTRACT_ADDRESS = '0xB27396a998cB63c93E432C5106bc027409d962b2';

export function getDashboardMock(): DashboardMock {
  return {
    contractAddress: CONTRACT_ADDRESS,
    contractAddressShort: '0xB273...62b2',
    stats: [
      {
        variant: 'primary',
        title: '合约部署地址',
        value: '0xB273...62b2',
        description: 'Sepolia EscrowMarketplace 合约',
      },
      {
        variant: 'secondary',
        title: '当前演示订单数',
        value: '1',
        unit: '笔',
        description: '课堂演示用活跃托管订单',
      },
      {
        variant: 'warning',
        title: '待处理纠纷数',
        value: '0',
        unit: '起',
        description: '进入 Disputed 状态的交易',
      },
      {
        variant: 'success',
        title: '活跃仲裁员数',
        value: '3',
        unit: '名',
        description: '已质押保证金并具备投票权',
      },
    ],
    demoTrade: {
      itemId: 1,
      itemName: '客制化二手机械键盘 (99新)',
      priceEth: '0.50',
      escrowNote: '✓ 0.5 ETH locked in contract safely',
      seller: '0xA12F3...89FCa3',
      buyer: '0x7a3F...91f2',
      state: 'Delivered',
      stateLabel: '已交付 Delivered',
    },
    events: [
      {
        id: 'evt-6',
        time: '10秒前',
        type: 'ItemDelivered',
        description: '物流已签收，等待买家确认收货',
        txHash: '0x4a92...9bf2',
      },
      {
        id: 'evt-5',
        time: '2小时前',
        type: 'ItemDelivered',
        description: '卖家顺丰发货，标记状态为已交付',
        txHash: '0x5f81...781a',
      },
      {
        id: 'evt-4',
        time: '5小时前',
        type: 'TradeFinalized',
        description: '演示订单进入放款准备阶段',
        txHash: '0x9e12...44ab',
      },
      {
        id: 'evt-3',
        time: '1天前',
        type: 'ItemPurchased',
        description: '买家足额支付，0.5 ETH 锁入合约',
        txHash: '0xbc32...00fa',
      },
      {
        id: 'evt-2',
        time: '2天前',
        type: 'ItemCreated',
        description: '卖家发布商品「二手机械键盘」',
        txHash: '0x8831...fa4b',
      },
    ],
    timeline: [
      { state: 'Created', label: 'Created', description: '商品发布', status: 'completed' },
      { state: 'Locked', label: 'Locked', description: '买家向合约质押款', status: 'completed' },
      { state: 'Delivered', label: 'Delivered', description: '卖家交付/已发货', status: 'active' },
      {
        state: 'DisputeDepositPending',
        label: 'DisputeDepositPending',
        description: '纠纷押金待补齐',
        status: 'upcoming',
      },
      { state: 'Disputed', label: 'Disputed', description: '申请仲裁纠纷', status: 'upcoming' },
      { state: 'Inactive', label: 'Inactive', description: '放款/退款结束', status: 'upcoming' },
    ],
    activeStepIndex: 2,
  };
}
