import type { DemoAccount } from '../types/roles';
import type { TradeRole } from '../types/roles';
import type { TradeState } from '../types/demo';
import { addressesEqual } from './walletMatch';

export interface DeriveTradeRoleParams {
  account: DemoAccount | null;
  connected: boolean;
  trade: { seller: string; buyer?: string; state: TradeState };
  arbiters?: { address: string }[];
}

export function deriveTradeRole({
  account,
  connected,
  trade,
  arbiters = [],
}: DeriveTradeRoleParams): TradeRole {
  if (!connected || !account) return 'guest';

  if (account.kind === 'viewer') return 'viewer';

  if (addressesEqual(account.address, trade.seller)) return 'seller';

  if (trade.buyer && addressesEqual(account.address, trade.buyer)) return 'buyer';

  if (
    trade.state === 'Created' &&
    !addressesEqual(account.address, trade.seller)
  ) {
    return 'buyer';
  }

  const isParty =
    addressesEqual(account.address, trade.seller) ||
    (trade.buyer ? addressesEqual(account.address, trade.buyer) : false);

  if (
    account.kind === 'arbiter' &&
    !isParty &&
    arbiters.some((a) => addressesEqual(a.address, account.address))
  ) {
    return 'arbitrator';
  }

  if (account.kind === 'arbiter') return 'arbitrator';

  return 'viewer';
}

export function tradeRoleLabel(role: TradeRole): string {
  const map: Record<TradeRole, string> = {
    guest: '未连接',
    seller: '卖家',
    buyer: '买家',
    arbitrator: '仲裁员',
    viewer: '访客（只读）',
  };
  return map[role];
}

export function tradeRoleTagClass(role: TradeRole): string {
  if (role === 'seller') return 'role-seller';
  if (role === 'buyer') return 'role-buyer';
  if (role === 'arbitrator') return 'role-arbiter';
  if (role === 'viewer') return 'role-viewer';
  return 'role-guest';
}
