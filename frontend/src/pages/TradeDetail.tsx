import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  highlightFundsBox,
  highlightTimelineStep,
  animateTradeLogEntry,
  useTradeDetailEntrance,
} from '../animations/useTradeDetailAnimation';
import { useDemoTrade } from '../context/useDemoTrade';
import { useDemoUI } from '../context/useDemoUI';
import { getArbiterDemoAccounts } from '../data/demoAccounts';
import { getFundsForState, getInitialTradeEvents, getTradeDetailMock, TRADE_TIMELINE_STATES } from '../data/mockTrade';
import type { TradeState } from '../types/demo';
import type { TradeRole } from '../types/roles';
import type { ActionAvailability, ClosureReason, TradeDetailMock, TradePageEvent } from '../types/trade';
import { deriveTradeRole, tradeRoleLabel, tradeRoleTagClass } from '../utils/deriveTradeRole';

function stateCapsuleClass(state: TradeState): string {
  if (state === 'Created') return 'st-created';
  if (state === 'Locked') return 'st-locked';
  if (state === 'Delivered') return 'st-delivered';
  if (state === 'DisputeDepositPending') return 'st-pending-dep';
  if (state === 'Disputed') return 'st-disputed';
  return 'st-inactive';
}

function stateLabel(state: TradeState): string {
  const map: Record<TradeState, string> = {
    Created: 'Created (待购买)',
    Locked: 'Locked (托管中)',
    Delivered: 'Delivered (已交付)',
    DisputeDepositPending: 'DisputeDepositPending (押金待补)',
    Disputed: 'Disputed (仲裁中)',
    Inactive: 'Inactive (已结束)',
  };
  return map[state];
}

function timelineStatus(state: TradeState, current: TradeState, index: number, currentIndex: number) {
  if (index < currentIndex) return 'done';
  if (state === current) return 'active';
  return '';
}

function makeEvent(type: TradePageEvent['type'], description: string): TradePageEvent {
  return {
    id: `trade-evt-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    time: '刚刚',
    type,
    description,
    txHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
  };
}

interface RoleAction {
  id: string;
  label: string;
  role: TradeRole;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  availability: ActionAvailability;
  onClick: () => void;
}

function gateByRole(
  availability: ActionAvailability,
  currentRole: TradeRole,
  requiredRole: TradeRole,
): ActionAvailability {
  if (currentRole !== requiredRole) {
    return {
      enabled: false,
      reason: `仅${tradeRoleLabel(requiredRole)}地址可调用`,
    };
  }
  return availability;
}

export function TradeDetail() {
  const pageRef = useRef<HTMLElement>(null);
  const fundsRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const location = useLocation();
  const itemId = Number(id) || 1;
  const {
    walletConnected,
    currentAccount,
    walletAddress,
    walletAddressFull,
    getMarketplaceItem,
    syncMarketplaceItemState,
    updateMarketplaceItem,
  } = useDemoUI();
  const {
    isClassroomTrade,
    classroomTrade,
    classroomEvents,
    updateClassroomTrade,
    appendClassroomEvent,
  } = useDemoTrade();

  const useSharedState = isClassroomTrade(itemId);
  const marketplaceItem = getMarketplaceItem(itemId);

  const [localTrade, setLocalTrade] = useState<TradeDetailMock>(() =>
    getTradeDetailMock(itemId, marketplaceItem),
  );
  const [localEvents, setLocalEvents] = useState<TradePageEvent[]>(() =>
    getInitialTradeEvents(itemId, getTradeDetailMock(itemId, marketplaceItem)),
  );
  const [actionHint, setActionHint] = useState('');
  const [pending, setPending] = useState(false);
  const [evidenceInput, setEvidenceInput] = useState(() =>
    getTradeDetailMock(itemId, marketplaceItem).evidenceHash,
  );
  const loadedRouteKeyRef = useRef<string | null>(null);

  const trade = useSharedState ? classroomTrade : localTrade;
  const events = useSharedState ? classroomEvents : localEvents;

  useEffect(() => {
    if (useSharedState) {
      setEvidenceInput(classroomTrade.evidenceHash);
      return;
    }
    const routeKey = `${itemId}:${location.key}`;
    if (loadedRouteKeyRef.current === routeKey) return;
    loadedRouteKeyRef.current = routeKey;
    const item = getMarketplaceItem(itemId);
    const detail = getTradeDetailMock(itemId, item);
    setLocalTrade(detail);
    setLocalEvents(getInitialTradeEvents(itemId, detail));
    setEvidenceInput(detail.evidenceHash);
    setActionHint('');
  }, [itemId, location.key, getMarketplaceItem, useSharedState, classroomTrade.evidenceHash]);

  useTradeDetailEntrance(pageRef);

  const arbiters = useMemo(() => getArbiterDemoAccounts().map((a) => ({ address: a.address })), []);

  const currentRole = useMemo(
    () =>
      deriveTradeRole({
        account: currentAccount,
        connected: walletConnected,
        trade: { seller: trade.seller, buyer: trade.buyer, state: trade.state },
        arbiters,
      }),
    [currentAccount, walletConnected, trade.seller, trade.buyer, trade.state, arbiters],
  );

  const funds = useMemo(
    () => getFundsForState(trade.state, trade.priceEth, trade.refundRequested, trade.closureReason),
    [trade.state, trade.priceEth, trade.refundRequested, trade.closureReason],
  );

  const currentIndex = TRADE_TIMELINE_STATES.indexOf(trade.state);

  const applyTradeUpdate = useCallback(
    (mutate: (prev: TradeDetailMock) => TradeDetailMock) => {
      if (useSharedState) {
        updateClassroomTrade(mutate(classroomTrade));
      } else {
        setLocalTrade((prev) => {
          const next = mutate(prev);
          syncMarketplaceItemState(itemId, next.state);
          updateMarketplaceItem(itemId, {
            state: next.state,
            buyer: next.buyer || undefined,
            buyerShort: next.buyerShort !== '—' ? next.buyerShort : undefined,
          });
          return next;
        });
      }
    },
    [
      useSharedState,
      updateClassroomTrade,
      classroomTrade,
      itemId,
      syncMarketplaceItemState,
      updateMarketplaceItem,
    ],
  );

  const appendEvent = useCallback(
    (evt: TradePageEvent) => {
      if (useSharedState) {
        appendClassroomEvent(evt);
      } else {
        setLocalEvents((prev) => [evt, ...prev]);
      }
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-trade-event="${evt.id}"]`);
        animateTradeLogEntry(el as HTMLElement | null);
      });
    },
    [useSharedState, appendClassroomEvent],
  );

  const runSim = useCallback(
    (description: string, mutate: (prev: TradeDetailMock) => TradeDetailMock, evt: TradePageEvent) => {
      if (!walletConnected) {
        setActionHint('请先在顶部连接钱包或选择 Demo 账号');
        return;
      }
      setPending(true);
      setActionHint(`模拟链上交易：${description}`);
      window.setTimeout(() => {
        applyTradeUpdate(mutate);
        appendEvent(evt);
        setActionHint('交易成功（课堂演示）');
        setPending(false);
        highlightFundsBox(fundsRef.current);
        const stepEl = pageRef.current?.querySelector('.trade-tl-step.active, .trade-tl-step.done:last-of-type');
        highlightTimelineStep(stepEl as HTMLElement | null);
      }, 900);
    },
    [walletConnected, appendEvent, applyTradeUpdate],
  );

  const sellerActions: RoleAction[] = useMemo(() => {
    const markDelivered: ActionAvailability =
      trade.state === 'Locked' && !trade.refundRequested
        ? { enabled: true, reason: '' }
        : { enabled: false, reason: trade.refundRequested ? '退款协商中，无法标记交付' : '仅 Locked 且未申请退款时可发货' };

    const approveRefund: ActionAvailability =
      trade.refundRequested && (trade.state === 'Locked' || trade.state === 'Delivered')
        ? { enabled: true, reason: '' }
        : { enabled: false, reason: '需买家先申请退款' };

    const timeoutRelease: ActionAvailability =
      trade.state === 'Delivered' && trade.confirmDeadlinePassed && !trade.refundRequested
        ? { enabled: true, reason: '' }
        : {
            enabled: false,
            reason:
              trade.refundRequested
                ? '买家已申请退款，卖家不能超时放款'
                : trade.state !== 'Delivered'
                  ? '仅已交付状态可超时放款'
                  : '需确认窗口超时（演示：点击下方模拟超时）',
          };

    return [
      {
        id: 'deliver',
        label: '标记已交付 markDelivered()',
        role: 'seller',
        variant: 'primary',
        availability: gateByRole(markDelivered, currentRole, 'seller'),
        onClick: () =>
          runSim(
            '卖家标记交付',
            (prev) => ({ ...prev, state: 'Delivered', deliveredAt: '刚刚' }),
            makeEvent('ItemDelivered', '卖家已发货，状态变为 Delivered'),
          ),
      },
      {
        id: 'approve-refund',
        label: '同意退款 approveRefund()',
        role: 'seller',
        variant: 'warning',
        availability: gateByRole(approveRefund, currentRole, 'seller'),
        onClick: () =>
          runSim(
            '卖家同意退款',
            (prev) => ({ ...prev, state: 'Inactive', refundRequested: false, closureReason: 'refund' as ClosureReason }),
            makeEvent('TradeFinalized', '协商退款完成，主交易金额记入买家可提现余额'),
          ),
      },
      {
        id: 'timeout',
        label: '超时放款 releaseAfterTimeout()',
        role: 'seller',
        variant: 'success',
        availability: gateByRole(timeoutRelease, currentRole, 'seller'),
        onClick: () =>
          runSim(
            '超时放款给卖家',
            (prev) => ({ ...prev, state: 'Inactive', closureReason: 'timeout' as ClosureReason }),
            makeEvent('TradeFinalized', '确认窗口超时，主交易金额记入卖家可提现余额'),
          ),
      },
    ];
  }, [trade, currentRole, runSim]);

  const buyerActions: RoleAction[] = useMemo(() => {
    const purchase: ActionAvailability =
      trade.state === 'Created'
        ? { enabled: true, reason: '' }
        : { enabled: false, reason: '商品已被购买或已结束' };

    const confirm: ActionAvailability =
      trade.state === 'Delivered' && !trade.refundRequested
        ? { enabled: true, reason: '' }
        : {
            enabled: false,
            reason: trade.refundRequested ? '退款申请中，不能确认收货' : '需卖家先标记交付',
          };

    const refund: ActionAvailability =
      (trade.state === 'Locked' || trade.state === 'Delivered') && !trade.refundRequested
        ? { enabled: true, reason: '' }
        : { enabled: false, reason: '当前状态不可申请退款' };

    const dispute: ActionAvailability =
      (trade.state === 'Locked' || trade.state === 'Delivered') && !trade.refundRequested
        ? { enabled: true, reason: '' }
        : { enabled: false, reason: '退款协商或已结束交易不可发起纠纷' };

    return [
      {
        id: 'purchase',
        label: '付款购买 purchaseItem()',
        role: 'buyer',
        variant: 'primary',
        availability: gateByRole(purchase, currentRole, 'buyer'),
        onClick: () =>
          runSim(
            '买家付款托管',
            (prev) => ({
              ...prev,
              state: 'Locked',
              buyer: walletAddressFull,
              buyerShort: walletAddress,
            }),
            makeEvent('ItemPurchased', `${trade.priceEth} ETH 锁入托管合约`),
          ),
      },
      {
        id: 'confirm',
        label: '确认收货 confirmReceived()',
        role: 'buyer',
        variant: 'success',
        availability: gateByRole(confirm, currentRole, 'buyer'),
        onClick: () =>
          runSim(
            '买家确认收货',
            (prev) => ({ ...prev, state: 'Inactive', closureReason: 'confirm' as ClosureReason }),
            makeEvent('TradeFinalized', '买家确认收货，主交易金额记入卖家可提现余额'),
          ),
      },
      {
        id: 'refund',
        label: '申请退款 requestRefund()',
        role: 'buyer',
        variant: 'warning',
        availability: gateByRole(refund, currentRole, 'buyer'),
        onClick: () =>
          runSim(
            '买家申请退款',
            (prev) => ({ ...prev, refundRequested: true }),
            makeEvent('RefundRequested', '买家发起退款申请，等待卖家同意'),
          ),
      },
      {
        id: 'dispute',
        label: '发起纠纷 openDispute()',
        role: 'buyer',
        variant: 'danger',
        availability: gateByRole(dispute, currentRole, 'buyer'),
        onClick: () =>
          runSim(
            '买家发起纠纷',
            (prev) => ({ ...prev, state: 'DisputeDepositPending', evidenceHash: evidenceInput }),
            makeEvent('DisputeOpened', '纠纷已开启，需双方补齐纠纷押金'),
          ),
      },
    ];
  }, [trade, evidenceInput, currentRole, runSim, walletAddress, walletAddressFull]);

  const disputeActions: RoleAction[] = useMemo(() => {
    const payDeposit: ActionAvailability =
      trade.state === 'DisputeDepositPending'
        ? { enabled: true, reason: '' }
        : { enabled: false, reason: '需先发起纠纷' };

    const simulateTimeout: ActionAvailability =
      trade.state === 'Delivered'
        ? { enabled: true, reason: '' }
        : { enabled: false, reason: '仅 Delivered 状态可模拟确认窗口超时' };

    return [
      {
        id: 'deposit',
        label: '补交纠纷押金 respondDispute()',
        role: 'buyer',
        variant: 'primary',
        availability:
          currentRole === 'seller' || currentRole === 'buyer'
            ? gateByRole(payDeposit, currentRole, currentRole)
            : { enabled: false, reason: '仅买卖双方可补交纠纷押金' },
        onClick: () =>
          runSim(
            '双方押金补齐',
            (prev) => ({ ...prev, state: 'Disputed' }),
            makeEvent('DisputeOpened', '纠纷押金已补齐，进入 Disputed 等待仲裁投票'),
          ),
      },
      {
        id: 'sim-timeout',
        label: '模拟确认窗口超时（演示）',
        role: 'seller',
        variant: 'outline',
        availability: gateByRole(simulateTimeout, currentRole, 'seller'),
        onClick: () => {
          applyTradeUpdate((prev) => ({ ...prev, confirmDeadlinePassed: true }));
          setActionHint('确认窗口已超时，卖家可尝试超时放款');
        },
      },
    ];
  }, [trade.state, currentRole, runSim, applyTradeUpdate]);

  const allActions = useMemo(
    () => [...sellerActions, ...buyerActions, ...disputeActions],
    [sellerActions, buyerActions, disputeActions],
  );

  const primaryActions = useMemo(() => {
    if (currentRole === 'guest' || currentRole === 'viewer' || currentRole === 'arbitrator') return [];
    return allActions.filter((a) => a.role === currentRole);
  }, [allActions, currentRole]);

  const otherRoleSummaries = useMemo(() => {
    const roles: { role: TradeRole; label: string; actions: RoleAction[] }[] = [
      { role: 'seller', label: '卖家', actions: sellerActions },
      { role: 'buyer', label: '买家', actions: [...buyerActions, ...disputeActions.filter((a) => a.id === 'deposit')] },
    ];
    return roles
      .filter((group) => group.role !== currentRole)
      .map((group) => ({
        ...group,
        items: group.actions.map((a) => ({
          label: a.label,
          reason: a.availability.reason || `仅${group.label}地址可调用`,
        })),
      }));
  }, [sellerActions, buyerActions, disputeActions, currentRole]);

  const renderActions = (actions: RoleAction[]) =>
    actions.map((action) => (
      <div key={action.id} className="action-row">
        <button
          type="button"
          className={`trade-btn trade-btn-${action.variant}`}
          disabled={!action.availability.enabled || pending}
          onClick={action.onClick}
        >
          {action.label}
        </button>
        {!action.availability.enabled ? (
          <p className="action-reason">{action.availability.reason}</p>
        ) : null}
      </div>
    ));

  const primaryPanelTitle =
    currentRole === 'seller'
      ? '卖家操作（当前地址）'
      : currentRole === 'buyer'
        ? '买家操作（当前地址）'
        : currentRole === 'arbitrator'
          ? '仲裁员视角'
          : currentRole === 'viewer'
            ? '只读视角'
            : '请先连接钱包';

  return (
    <main className="content trade-detail-page" ref={pageRef}>
      <div className="page-header trade-animate">
        <h1 className="page-title">交易详情</h1>
        <p className="page-subtitle">
          当前角色由 Demo 账号地址推导；主面板只展示当前地址可执行的操作。
        </p>
      </div>

      <div className="main-card trade-animate">
        <div className="summary-header">
          <div>
            <h2 className="summary-title">{trade.title}</h2>
            <p className="summary-subtitle">商品 ID #{trade.itemId} · {trade.description}</p>
          </div>
          <div className="summary-badges">
            <span className={`role-tag ${tradeRoleTagClass(currentRole)}`}>
              {tradeRoleLabel(currentRole)}
            </span>
            <span className={`status-capsule ${stateCapsuleClass(trade.state)}`}>
              <span className="s-dot" />
              {stateLabel(trade.state)}
            </span>
          </div>
        </div>
        <div className="summary-grid">
          <div className="s-box">
            <span className="s-label">交易价格</span>
            <span className="s-val eth">{trade.priceEth} ETH</span>
          </div>
          <div className="s-box">
            <span className="s-label">卖家</span>
            <span className="s-val mono-truncate" title={trade.seller}>{trade.sellerShort}</span>
          </div>
          <div className="s-box">
            <span className="s-label">买家</span>
            <span className="s-val mono-truncate" title={trade.buyer || '—'}>{trade.buyerShort}</span>
          </div>
          <div className="s-box">
            <span className="s-label">Metadata Hash</span>
            <span className="s-val mono-truncate hash-break" title={trade.metadataHash}>{trade.metadataHash}</span>
          </div>
        </div>
      </div>

      {actionHint ? (
        <p className="page-feedback trade-animate" aria-live="polite">{actionHint}</p>
      ) : null}

      <div className="role-primary-layout trade-detail-grid">
        <div className="main-card panel role-primary-panel trade-animate">
          <div className="panel-header">
            <span className="panel-title">{primaryPanelTitle}</span>
            <span className={`role-tag ${tradeRoleTagClass(currentRole)}`}>
              {tradeRoleLabel(currentRole)}
            </span>
          </div>
          {currentRole === 'guest' ? (
            <p className="permission-reason">请连接钱包或在演示控制台选择 Demo 账号。</p>
          ) : null}
          {currentRole === 'viewer' ? (
            <p className="permission-reason">访客账号仅可查看状态、资金流和事件日志，不能执行业务操作。</p>
          ) : null}
          {currentRole === 'arbitrator' ? (
            <div className="arbiter-trade-panel">
              <p className="permission-reason">
                当前为仲裁员地址。本案进入 Disputed 后请前往仲裁中心投票。
              </p>
              {trade.state === 'Disputed' ? (
                <Link className="btn-action btn-action-primary arbitration-link" to="/arbitration">
                  前往仲裁中心 voteDispute()
                </Link>
              ) : (
                <p className="action-reason">交易尚未进入 Disputed，暂不可投票。</p>
              )}
            </div>
          ) : null}
          {(currentRole === 'seller' || currentRole === 'buyer') ? (
            <>
              <div className="action-list">{renderActions(primaryActions)}</div>
              {currentRole === 'buyer' ? (
                <div className="dispute-section">
                  <div className="input-group">
                    <label htmlFor="evidence-hash">证据哈希 / URI</label>
                    <input
                      id="evidence-hash"
                      className="input-box hash-break"
                      value={evidenceInput}
                      onChange={(e) => setEvidenceInput(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="center-stage trade-animate">
          <div className="visual-box">
            <div className="trade-timeline">
              <div className="tl-line" />
              {TRADE_TIMELINE_STATES.map((state, index) => (
                <div
                  key={state}
                  className={`trade-tl-step ${timelineStatus(state, trade.state, index, currentIndex)}`}
                >
                  <div className="trade-tl-dot">{index + 1}</div>
                  <div className="trade-tl-label">{state}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="main-card funds-card" ref={fundsRef}>
            <div className="card-header-area compact">
              <div className="card-title-group">
                <h2>资金流向说明</h2>
                <p>{funds.fundsNote}</p>
              </div>
            </div>
            <div className="funds-grid">
              <div className="funds-item">
                <span className="funds-label">托管主金额</span>
                <span className="funds-val">{funds.escrowAmount} ETH</span>
              </div>
              <div className="funds-item">
                <span className="funds-label">卖家保证金</span>
                <span className="funds-val">{funds.sellerDeposit} ETH</span>
              </div>
              <div className="funds-item">
                <span className="funds-label">买家纠纷押金</span>
                <span className="funds-val">{funds.buyerDisputeDeposit} ETH</span>
              </div>
              <div className="funds-item">
                <span className="funds-label">卖家纠纷押金</span>
                <span className="funds-val">{funds.sellerDisputeDeposit} ETH</span>
              </div>
              <div className="funds-item wide">
                <span className="funds-label">待提现余额 (pendingWithdrawals)</span>
                <span className="funds-val">{funds.pendingWithdrawals} ETH</span>
              </div>
            </div>
            {trade.state === 'Disputed' ? (
              <Link className="btn-action btn-action-primary arbitration-link" to="/arbitration">
                前往仲裁中心查看 2/3 投票
              </Link>
            ) : null}
          </div>

          <div className="console-wrap">
            <div className="console-header">
              <span>链上事件日志（模拟）</span>
              <span>{events.length} events</span>
            </div>
            <div className="console-body">
              {events.map((evt) => (
                <div key={evt.id} className="log-entry" data-trade-event={evt.id}>
                  <span className="log-time">{evt.time}</span>
                  <span className="log-tag">{evt.type}</span>
                  <span className="log-desc">{evt.description}</span>
                  <span className="log-hash mono-truncate" title={evt.txHash}>{evt.txHash}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="main-card panel role-collapsed-panel trade-animate">
          <div className="panel-header">
            <span className="panel-title">其他角色（当前地址无权限）</span>
          </div>
          <ul className="permission-summary-list">
            {otherRoleSummaries.flatMap((group) =>
              group.items.map((item) => (
                <li key={`${group.role}-${item.label}`} className="permission-summary-item">
                  <span className="permission-action-name">{item.label}</span>
                  <span className="permission-reason">{item.reason}</span>
                </li>
              )),
            )}
          </ul>
          <p className="deposit-hint">
            纠纷押金：
            {trade.state === 'DisputeDepositPending'
              ? ' 待买卖双方补交'
              : trade.state === 'Disputed'
                ? ' 已补齐，仲裁投票进行中'
                : ' 未开启'}
          </p>
          <p className="dispute-arbitration-hint">
            DisputeResolved 由仲裁中心 2/3 投票后产生。
            <Link to="/arbitration"> 前往仲裁中心</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
