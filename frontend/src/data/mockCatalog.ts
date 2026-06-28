import type { MarketplaceItem } from '../types/marketplace';
import type { ClosureReason, TradeDetailMock, TradePageEvent } from '../types/trade';
import {
  DEMO_BUYER_FULL,
  DEMO_BUYER_SHORT,
  DEMO_SELLER_FULL,
  DEMO_SELLER_SHORT,
} from './demoAccounts';

interface CatalogTradeExtras {
  buyer?: string;
  buyerShort?: string;
  evidenceHash?: string;
  refundRequested?: boolean;
  deliveredAt?: string | null;
  confirmDeadlinePassed?: boolean;
  closureReason?: ClosureReason;
  /** Inactive 订单经仲裁结案时，初始事件可含 DisputeResolved */
  arbitrationResolved?: boolean;
}

export interface CatalogSeedEntry extends MarketplaceItem {
  trade: CatalogTradeExtras;
}

const CATALOG_SEED_ITEMS: CatalogSeedEntry[] = [
  {
    id: 6,
    title: '自发布演示商品',
    description: '连接钱包后演示「卖家不能购买自己商品」拦截',
    priceEth: '0.12',
    seller: DEMO_BUYER_FULL,
    sellerShort: DEMO_BUYER_SHORT,
    state: 'Created',
    metadataHash: '0x9c01...aa11',
    createdAt: '1天前',
    deliveryWindowHours: 24,
    confirmWindowHours: 48,
    trade: {},
  },
  {
    id: 5,
    title: '二手平板（纠纷中）',
    description: '买卖双方申请仲裁，案件投票进行中',
    priceEth: '0.35',
    seller: '0xF22A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
    sellerShort: '0xF22A1...F8A9B0',
    state: 'Disputed',
    metadataHash: '0x4d88...19ac',
    createdAt: '4天前',
    deliveryWindowHours: 24,
    confirmWindowHours: 48,
    trade: {
      buyer: DEMO_BUYER_FULL,
      buyerShort: DEMO_BUYER_SHORT,
      evidenceHash: '0x4e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
      deliveredAt: '1 天前',
    },
  },
  {
    id: 4,
    title: '二手机械键盘',
    description: '红轴，99新，带原包装',
    priceEth: '0.50',
    seller: DEMO_SELLER_FULL,
    sellerShort: DEMO_SELLER_SHORT,
    state: 'Created',
    metadataHash: '0x8f3a...b21c',
    createdAt: '2天前',
    deliveryWindowHours: 24,
    confirmWindowHours: 48,
    trade: {},
  },
  {
    id: 3,
    title: '显示器支架',
    description: '铝合金气动支架，承重 9kg',
    priceEth: '0.20',
    seller: '0xC31E8A9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6a',
    sellerShort: '0xC31E8...4E5F6a',
    state: 'Locked',
    metadataHash: '0x2c91...77de',
    createdAt: '3天前',
    deliveryWindowHours: 24,
    confirmWindowHours: 48,
    trade: {
      buyer: DEMO_BUYER_FULL,
      buyerShort: DEMO_BUYER_SHORT,
    },
  },
  {
    id: 2,
    title: '蓝牙耳机',
    description: '降噪耳机，电池健康度 90%',
    priceEth: '0.15',
    seller: '0xE19A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F942B',
    sellerShort: '0xE19A2...8F942B',
    state: 'Delivered',
    metadataHash: '0x5a10...33ff',
    createdAt: '5天前',
    deliveryWindowHours: 24,
    confirmWindowHours: 48,
    trade: {
      buyer: DEMO_BUYER_FULL,
      buyerShort: DEMO_BUYER_SHORT,
      deliveredAt: '2 小时前',
    },
  },
  {
    id: 1,
    title: '课程教材套装',
    description: '计算机科学专业核心教材合集',
    priceEth: '0.08',
    seller: '0xD88B7C6A5E4F3D2C1B0A9F8E7D6C5B4A3F2E1D21F',
    sellerShort: '0xD88B7...E1D21F',
    state: 'Inactive',
    metadataHash: '0x1b44...aa90',
    createdAt: '1周前',
    deliveryWindowHours: 72,
    confirmWindowHours: 72,
    trade: {
      buyer: DEMO_BUYER_FULL,
      buyerShort: DEMO_BUYER_SHORT,
      deliveredAt: '3 天前',
      closureReason: 'confirm',
    },
  },
];

const seedById = new Map(CATALOG_SEED_ITEMS.map((entry) => [entry.id, entry]));

function getSeedExtras(itemId: number): CatalogTradeExtras | undefined {
  return seedById.get(itemId)?.trade;
}

export function getInitialCatalogItems(): MarketplaceItem[] {
  return CATALOG_SEED_ITEMS.map(({ trade: _trade, ...item }) => item);
}

export function getNextCatalogItemId(items: MarketplaceItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function findCatalogSeed(itemId: number): CatalogSeedEntry | undefined {
  return seedById.get(itemId);
}

export function marketplaceItemToTradeDetail(item: MarketplaceItem): TradeDetailMock {
  const extras = getSeedExtras(item.id);
  const hasBuyer = item.state !== 'Created';

  return {
    itemId: item.id,
    title: item.title,
    description: item.description,
    priceEth: item.priceEth,
    seller: item.seller,
    sellerShort: item.sellerShort,
    metadataHash: item.metadataHash,
    state: item.state,
    buyer: item.buyer ?? extras?.buyer ?? (hasBuyer ? DEMO_BUYER_FULL : ''),
    buyerShort: item.buyerShort ?? extras?.buyerShort ?? (hasBuyer ? DEMO_BUYER_SHORT : '—'),
    evidenceHash: extras?.evidenceHash ?? '',
    refundRequested: extras?.refundRequested ?? false,
    deliveredAt: extras?.deliveredAt ?? null,
    confirmDeadlinePassed: extras?.confirmDeadlinePassed ?? false,
    closureReason: extras?.closureReason ?? null,
  };
}

function seedEvent(
  id: string,
  time: string,
  type: TradePageEvent['type'],
  description: string,
  txHash: string,
): TradePageEvent {
  return { id, time, type, description, txHash };
}

export function getInitialTradeEventsFromTrade(trade: TradeDetailMock): TradePageEvent[] {
  if (trade.state === 'Created') return [];

  const extras = getSeedExtras(trade.itemId);
  const purchased = seedEvent(
    `trade-seed-purchased-${trade.itemId}`,
    '6 小时前',
    'ItemPurchased',
    `${trade.priceEth} ETH 锁入托管合约`,
    '0x1234...5678',
  );

  if (trade.state === 'Locked' && !trade.refundRequested) {
    return [seedEvent('trade-seed-purchased', '刚刚', 'ItemPurchased', '买家足额支付，资金锁入托管合约', '0x1234...5678')];
  }

  if (trade.state === 'Locked' && trade.refundRequested) {
    return [
      seedEvent('trade-seed-refund', '30 分钟前', 'RefundRequested', '买家发起退款申请，等待卖家同意', '0xab12...cd34'),
      seedEvent('trade-seed-purchased', '2 小时前', 'ItemPurchased', '买家足额支付，资金锁入托管合约', '0x1234...5678'),
    ];
  }

  const delivered = seedEvent(
    'trade-seed-delivered',
    trade.deliveredAt === '刚刚' ? '刚刚' : '5 小时前',
    'ItemDelivered',
    '卖家已发货，状态变为 Delivered',
    '0x5678...9abc',
  );

  if (trade.state === 'Delivered') {
    const events = [delivered, purchased];
    if (trade.refundRequested) {
      events.unshift(
        seedEvent('trade-seed-refund', '1 小时前', 'RefundRequested', '买家发起退款申请，等待卖家同意', '0xab12...cd34'),
      );
    }
    return events;
  }

  if (trade.state === 'DisputeDepositPending') {
    return [
      seedEvent('trade-seed-dispute-open', '2 小时前', 'DisputeOpened', '纠纷已开启，需双方补齐纠纷押金', '0xab12...cd34'),
      delivered,
      purchased,
    ];
  }

  if (trade.state === 'Disputed') {
    return [
      seedEvent(
        'trade-seed-dispute-opened',
        '3 小时前',
        'DisputeOpened',
        '纠纷押金已补齐，进入 Disputed 等待仲裁投票',
        '0xab12...cd34',
      ),
      delivered,
      purchased,
    ];
  }

  if (trade.state === 'Inactive') {
    const events: TradePageEvent[] = [];

    if (extras?.arbitrationResolved) {
      events.push(
        seedEvent(
          'trade-seed-dispute-resolved',
          '1 小时前',
          'DisputeResolved',
          '仲裁中心 2/3 投票完成，裁决已执行',
          '0xdead...beef',
        ),
      );
    }

    if (trade.closureReason === 'confirm') {
      events.push(
        seedEvent('trade-seed-finalized', '1 天前', 'TradeFinalized', '买家确认收货，主交易金额记入卖家可提现余额', '0x9e12...44ab'),
      );
    } else if (trade.closureReason === 'refund') {
      events.push(
        seedEvent('trade-seed-finalized', '1 天前', 'TradeFinalized', '协商退款完成，主交易金额记入买家可提现余额', '0x9e12...44ab'),
      );
    } else if (trade.closureReason === 'timeout') {
      events.push(
        seedEvent('trade-seed-finalized', '1 天前', 'TradeFinalized', '确认窗口超时，主交易金额记入卖家可提现余额', '0x9e12...44ab'),
      );
    } else {
      events.push(
        seedEvent('trade-seed-finalized', '1 天前', 'TradeFinalized', '交易已结束，资金记入胜方可提现余额', '0x9e12...44ab'),
      );
    }

    events.push(delivered, purchased);
    return events;
  }

  return [purchased];
}

export function createPlaceholderTradeDetail(itemId: number): TradeDetailMock {
  return {
    itemId: itemId || 1,
    title: `未知商品 #${itemId}`,
    description: '该商品 id 不在演示目录中',
    priceEth: '0.00',
    seller: '',
    sellerShort: '—',
    buyer: '',
    buyerShort: '—',
    metadataHash: '—',
    evidenceHash: '',
    state: 'Created',
    refundRequested: false,
    deliveredAt: null,
    confirmDeadlinePassed: false,
    closureReason: null,
  };
}
