export type DemoAccountId =
  | 'seller'
  | 'buyer'
  | 'arbiter1'
  | 'arbiter2'
  | 'arbiter3'
  | 'viewer';

export type DemoAccountKind = 'seller' | 'buyer' | 'arbiter' | 'viewer';

export interface DemoAccount {
  id: DemoAccountId;
  label: string;
  roleLabel: string;
  kind: DemoAccountKind;
  address: string;
  shortAddress: string;
  description: string;
}

export type TradeRole = 'guest' | 'seller' | 'buyer' | 'arbitrator' | 'viewer';

export interface RoleAvailability {
  role: TradeRole;
  label: string;
  canAct: boolean;
  reason?: string;
}

export type DemoSceneId =
  | 'reset'
  | 'itemCreated'
  | 'buyerPaid'
  | 'sellerDelivered'
  | 'refundRequested'
  | 'disputeDepositPending'
  | 'arbitrationVoting';

export const DEMO_SCENE_LABELS: Record<DemoSceneId, string> = {
  reset: '重置 Demo',
  itemCreated: '商品已创建',
  buyerPaid: '买家已付款',
  sellerDelivered: '卖家已交付',
  refundRequested: '买家申请退款',
  disputeDepositPending: '纠纷待押金',
  arbitrationVoting: '仲裁投票中',
};
