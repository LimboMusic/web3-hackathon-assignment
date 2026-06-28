import {
  createPlaceholderTradeDetail,
  findCatalogSeed,
  getInitialTradeEventsFromTrade,
  marketplaceItemToTradeDetail,
} from './mockCatalog';
import type { MarketplaceItem } from '../types/marketplace';
import type { ClosureReason, TradeDetailMock, TradeFunds, TradePageEvent } from '../types/trade';
import type { TradeState } from '../types/demo';

export function getTradeDetailMock(itemId: number, item?: MarketplaceItem): TradeDetailMock {
  if (item) {
    return marketplaceItemToTradeDetail(item);
  }
  const seed = findCatalogSeed(itemId);
  if (seed) {
    const { trade: _trade, ...marketplaceItem } = seed;
    return marketplaceItemToTradeDetail(marketplaceItem);
  }
  return createPlaceholderTradeDetail(itemId);
}

export function getInitialTradeEvents(itemId: number, trade?: TradeDetailMock): TradePageEvent[] {
  const detail = trade ?? getTradeDetailMock(itemId);
  return getInitialTradeEventsFromTrade(detail);
}

export function getFundsForState(
  state: TradeState,
  priceEth: string,
  refundRequested: boolean,
  closureReason: ClosureReason = null,
): TradeFunds {
  const base = {
    escrowAmount: priceEth,
    sellerDeposit: '0.05',
    buyerDisputeDeposit: '0.00',
    sellerDisputeDeposit: '0.00',
    pendingWithdrawals: '0.00',
    fundsNote: '主交易金额锁定在托管合约中，等待下一步操作。',
  };

  if (state === 'Created') {
    return { ...base, escrowAmount: '0.00', fundsNote: '尚未付款，托管合约中无资金。' };
  }
  if (state === 'Locked' && !refundRequested) {
    return { ...base, fundsNote: `${priceEth} ETH 已锁入托管合约，等待卖家交付。` };
  }
  if (state === 'Locked' && refundRequested) {
    return { ...base, fundsNote: '买家已申请退款，等待卖家同意；确认收货已禁用。' };
  }
  if (state === 'Delivered') {
    return {
      ...base,
      fundsNote: refundRequested
        ? '商品已交付，退款协商进行中。'
        : '商品已交付，买家可在确认窗口内确认收货或申请退款。',
    };
  }
  if (state === 'DisputeDepositPending') {
    return {
      ...base,
      buyerDisputeDeposit: '0.00',
      sellerDisputeDeposit: '0.00',
      fundsNote: '纠纷已开启，买卖双方需补齐纠纷押金后方可进入仲裁投票。',
    };
  }
  if (state === 'Disputed') {
    return {
      ...base,
      buyerDisputeDeposit: '0.02',
      sellerDisputeDeposit: '0.02',
      fundsNote:
        '纠纷押金已补齐。裁决结果由仲裁中心页面投票产生，本页不模拟 2/3 投票；请前往仲裁中心查看进度。',
    };
  }
  if (state === 'Inactive') {
    if (closureReason === 'confirm') {
      return {
        ...base,
        escrowAmount: '0.00',
        pendingWithdrawals: priceEth,
        fundsNote: '主交易金额记入卖家可提现余额。',
      };
    }
    if (closureReason === 'refund') {
      return {
        ...base,
        escrowAmount: '0.00',
        sellerDeposit: '0.00',
        pendingWithdrawals: priceEth,
        fundsNote: '主交易金额记入买家可提现余额，卖家保证金退还卖家。',
      };
    }
    if (closureReason === 'timeout') {
      return {
        ...base,
        escrowAmount: '0.00',
        pendingWithdrawals: priceEth,
        fundsNote: '确认窗口超时，主交易金额记入卖家可提现余额。',
      };
    }
    return {
      ...base,
      escrowAmount: '0.00',
      pendingWithdrawals: priceEth,
      fundsNote: '交易已结束，资金记入胜方可提现余额（课堂演示）。',
    };
  }
  return base;
}

export const TRADE_TIMELINE_STATES: TradeState[] = [
  'Created',
  'Locked',
  'Delivered',
  'DisputeDepositPending',
  'Disputed',
  'Inactive',
];

// Re-export for consumers that import from mockTrade
export { getInitialTradeEventsFromTrade, marketplaceItemToTradeDetail } from './mockCatalog';
