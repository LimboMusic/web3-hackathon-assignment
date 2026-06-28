export type VoteSide = 'buyer' | 'seller' | null;

export type VerdictStatus = 'voting' | 'buyer_wins' | 'seller_wins';

export interface ArbiterSeat {
  id: string;
  name: string;
  address: string;
  addressShort: string;
  staked: boolean;
  locked: boolean;
  hasVoted: boolean;
  vote: VoteSide;
  rewardStatus: 'pending' | 'majority' | 'minority' | 'none';
}

export interface ArbitrationMock {
  disputeId: number;
  itemId: number;
  itemTitle: string;
  evidenceHash: string;
  buyerDepositPaid: boolean;
  sellerDepositPaid: boolean;
  buyerVotes: number;
  sellerVotes: number;
  threshold: number;
  totalArbiters: number;
  verdict: VerdictStatus;
  arbiters: ArbiterSeat[];
}

export interface ArbitrationLogEntry {
  id: string;
  time: string;
  event: string;
  description: string;
}
