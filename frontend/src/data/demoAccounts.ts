import type { DemoAccount, DemoAccountId } from '../types/roles';

/** Canonical mock public addresses — no private keys or secrets. */
export const DEMO_BUYER_FULL = '0x7a3F8b2C1d4E5f6A7B8C9D0e1F2a3B4C5D6E7F91f2';
export const DEMO_BUYER_SHORT = '0x7a3F...91f2';

export const DEMO_SELLER_FULL = '0xA12F3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F89FCa3';
export const DEMO_SELLER_SHORT = '0xA12F3...89FCa3';

export const DEMO_ARBITER1_FULL = '0xF11c3A4B5C6D7E8F9012345678901234567A92911';
export const DEMO_ARBITER1_SHORT = '0xF11c3...A92911';

export const DEMO_ARBITER2_FULL = '0xF22d9B8C7D6E5F4A3210987654321098765B7142A';
export const DEMO_ARBITER2_SHORT = '0xF22d9...B7142A';

export const DEMO_ARBITER3_FULL = '0xF33a1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6C1829b';
export const DEMO_ARBITER3_SHORT = '0xF33a1...C1829b';

export const DEMO_VIEWER_FULL = '0x9E88a1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8a9b0';
export const DEMO_VIEWER_SHORT = '0x9E88a...F8a9b0';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'seller',
    label: '卖家',
    roleLabel: 'Seller (卖家)',
    kind: 'seller',
    address: DEMO_SELLER_FULL,
    shortAddress: DEMO_SELLER_SHORT,
    description: '创建商品、标记交付、同意退款、超时放款',
  },
  {
    id: 'buyer',
    label: '买家',
    roleLabel: 'Buyer (买家)',
    kind: 'buyer',
    address: DEMO_BUYER_FULL,
    shortAddress: DEMO_BUYER_SHORT,
    description: '付款托管、确认收货、申请退款、发起纠纷',
  },
  {
    id: 'arbiter1',
    label: '仲裁员 A',
    roleLabel: 'Arbiter A (仲裁员)',
    kind: 'arbiter',
    address: DEMO_ARBITER1_FULL,
    shortAddress: DEMO_ARBITER1_SHORT,
    description: '质押后参与 2/3 多数裁决投票',
  },
  {
    id: 'arbiter2',
    label: '仲裁员 B',
    roleLabel: 'Arbiter B (仲裁员)',
    kind: 'arbiter',
    address: DEMO_ARBITER2_FULL,
    shortAddress: DEMO_ARBITER2_SHORT,
    description: '质押后参与 2/3 多数裁决投票',
  },
  {
    id: 'arbiter3',
    label: '仲裁员 C',
    roleLabel: 'Arbiter C (仲裁员)',
    kind: 'arbiter',
    address: DEMO_ARBITER3_FULL,
    shortAddress: DEMO_ARBITER3_SHORT,
    description: '默认未质押，演示质押门槛与第三名仲裁员',
  },
  {
    id: 'viewer',
    label: '访客',
    roleLabel: 'Viewer (访客)',
    kind: 'viewer',
    address: DEMO_VIEWER_FULL,
    shortAddress: DEMO_VIEWER_SHORT,
    description: '只读查看交易状态、资金流和事件日志',
  },
];

const accountById = new Map(DEMO_ACCOUNTS.map((a) => [a.id, a]));

export function getDemoAccount(id: DemoAccountId): DemoAccount {
  const account = accountById.get(id);
  if (!account) throw new Error(`Unknown demo account: ${id}`);
  return account;
}

export function getDemoAccountByAddress(address: string): DemoAccount | undefined {
  if (!address) return undefined;
  const normalized = address.toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.address.toLowerCase() === normalized);
}

export function getArbiterDemoAccounts(): DemoAccount[] {
  return DEMO_ACCOUNTS.filter((a) => a.kind === 'arbiter');
}

export const CLASSROOM_TRADE_ID = 4;
export const DISPUTE_TRADE_ID = 5;
