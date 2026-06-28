import type { ArbitrationLogEntry, ArbitrationMock } from '../types/arbitration';
import {
  DEMO_ARBITER1_FULL,
  DEMO_ARBITER1_SHORT,
  DEMO_ARBITER2_FULL,
  DEMO_ARBITER2_SHORT,
  DEMO_ARBITER3_FULL,
  DEMO_ARBITER3_SHORT,
} from './demoAccounts';

/** 默认未质押席位，便于演示「需先质押才可投票」 */
export const DEFAULT_ARBITER_ID = 'arb-3';

export function getArbitrationMock(): ArbitrationMock {
  return {
    disputeId: 1,
    itemId: 5,
    itemTitle: '二手平板（纠纷中）',
    evidenceHash: '0x4e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
    buyerDepositPaid: true,
    sellerDepositPaid: true,
    buyerVotes: 0,
    sellerVotes: 0,
    threshold: 2,
    totalArbiters: 3,
    verdict: 'voting',
    arbiters: [
      {
        id: 'arb-1',
        name: 'Arbiter 1',
        address: DEMO_ARBITER1_FULL,
        addressShort: DEMO_ARBITER1_SHORT,
        staked: true,
        locked: false,
        hasVoted: false,
        vote: null,
        rewardStatus: 'pending',
      },
      {
        id: 'arb-2',
        name: 'Arbiter 2',
        address: DEMO_ARBITER2_FULL,
        addressShort: DEMO_ARBITER2_SHORT,
        staked: true,
        locked: false,
        hasVoted: false,
        vote: null,
        rewardStatus: 'pending',
      },
      {
        id: 'arb-3',
        name: 'Arbiter 3',
        address: DEMO_ARBITER3_FULL,
        addressShort: DEMO_ARBITER3_SHORT,
        staked: false,
        locked: false,
        hasVoted: false,
        vote: null,
        rewardStatus: 'pending',
      },
    ],
  };
}

export function resetArbitrationVoting(): ArbitrationMock {
  return getArbitrationMock();
}

export function getInitialArbitrationLogs(): ArbitrationLogEntry[] {
  return [
    {
      id: 'alog-1',
      time: '5分钟前',
      event: 'DisputeOpened',
      description: '买卖双方纠纷押金已补齐，案件进入 Disputed 投票阶段',
    },
    {
      id: 'alog-2',
      time: '12分钟前',
      event: 'DepositPaid',
      description: '卖家补交纠纷押金 0.02 ETH',
    },
    {
      id: 'alog-3',
      time: '18分钟前',
      event: 'DepositPaid',
      description: '买家补交纠纷押金 0.02 ETH',
    },
  ];
}
