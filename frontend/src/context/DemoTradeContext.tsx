import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ArbitrationLogEntry, ArbitrationMock } from '../types/arbitration';
import {
  CLASSROOM_TRADE_ID,
  DISPUTE_TRADE_ID,
  getDemoAccount,
} from '../data/demoAccounts';
import {
  getArbitrationMock,
  getInitialArbitrationLogs,
  resetArbitrationVoting,
} from '../data/mockArbitration';
import { getInitialTradeEventsFromTrade } from '../data/mockCatalog';
import { getTradeDetailMock } from '../data/mockTrade';
import type { DemoSceneId } from '../types/roles';
import type { TradeDetailMock, TradePageEvent } from '../types/trade';
import { useDemoUI } from './useDemoUI';
import { DemoTradeContext } from './useDemoTrade';

function buildClassroomTrade(item = getTradeDetailMock(CLASSROOM_TRADE_ID)): TradeDetailMock {
  return { ...item };
}

export function DemoTradeProvider({ children }: { children: ReactNode }) {
  const {
    getMarketplaceItem,
    resetMarketplace,
    syncMarketplaceItemState,
    updateMarketplaceItem,
    pushToast,
    currentAccount,
  } = useDemoUI();

  const [classroomTrade, setClassroomTradeState] = useState<TradeDetailMock>(() =>
    buildClassroomTrade(),
  );
  const [classroomEvents, setClassroomEventsState] = useState<TradePageEvent[]>(() =>
    getInitialTradeEventsFromTrade(buildClassroomTrade()),
  );
  const [arbitrationCase, setArbitrationCaseState] = useState<ArbitrationMock>(() =>
    getArbitrationMock(),
  );
  const [arbitrationLogs, setArbitrationLogsState] = useState<ArbitrationLogEntry[]>(() =>
    getInitialArbitrationLogs(),
  );

  const isClassroomTrade = useCallback((itemId: number) => itemId === CLASSROOM_TRADE_ID, []);

  const setClassroomTrade = useCallback((trade: TradeDetailMock) => {
    setClassroomTradeState(trade);
    syncMarketplaceItemState(trade.itemId, trade.state);
    updateMarketplaceItem(trade.itemId, {
      state: trade.state,
      buyer: trade.buyer || undefined,
      buyerShort: trade.buyerShort !== '—' ? trade.buyerShort : undefined,
    });
  }, [syncMarketplaceItemState, updateMarketplaceItem]);

  const updateClassroomTrade = useCallback(
    (patch: Partial<TradeDetailMock>) => {
      setClassroomTradeState((prev) => {
        const next = { ...prev, ...patch };
        syncMarketplaceItemState(next.itemId, next.state);
        updateMarketplaceItem(next.itemId, {
          state: next.state,
          buyer: next.buyer || undefined,
          buyerShort: next.buyerShort !== '—' ? next.buyerShort : undefined,
        });
        return next;
      });
    },
    [syncMarketplaceItemState, updateMarketplaceItem],
  );

  const setClassroomEvents = useCallback((events: TradePageEvent[]) => {
    setClassroomEventsState(events);
  }, []);

  const appendClassroomEvent = useCallback((event: TradePageEvent) => {
    setClassroomEventsState((prev) => [event, ...prev]);
  }, []);

  const setArbitrationCase = useCallback((caseData: ArbitrationMock) => {
    setArbitrationCaseState(caseData);
  }, []);

  const updateArbitrationCase = useCallback((updater: (prev: ArbitrationMock) => ArbitrationMock) => {
    setArbitrationCaseState(updater);
  }, []);

  const appendArbitrationLog = useCallback((entry: ArbitrationLogEntry) => {
    setArbitrationLogsState((prev) => [entry, ...prev]);
  }, []);

  const setArbitrationLogs = useCallback((logs: ArbitrationLogEntry[]) => {
    setArbitrationLogsState(logs);
  }, []);

  const applyScene = useCallback(
    (sceneId: DemoSceneId) => {
      const buyer = getDemoAccount('buyer');
      const buyerAddr = currentAccount?.kind === 'buyer' ? currentAccount : buyer;

      if (sceneId === 'reset') {
        resetMarketplace();
        const fresh = buildClassroomTrade(getTradeDetailMock(CLASSROOM_TRADE_ID));
        setClassroomTradeState(fresh);
        setClassroomEventsState(getInitialTradeEventsFromTrade(fresh));
        setArbitrationCaseState(resetArbitrationVoting());
        setArbitrationLogsState(getInitialArbitrationLogs());
        pushToast('已载入课堂演示场景：重置 Demo（不代表真实链上交易）', 'info');
        return;
      }

      if (sceneId === 'arbitrationVoting') {
        resetMarketplace();
        const disputeItem = getMarketplaceItem(DISPUTE_TRADE_ID);
        const disputeTrade = getTradeDetailMock(DISPUTE_TRADE_ID, disputeItem);
        syncMarketplaceItemState(DISPUTE_TRADE_ID, 'Disputed');
        setArbitrationCaseState(resetArbitrationVoting());
        setArbitrationLogsState(getInitialArbitrationLogs());
        setClassroomTradeState(buildClassroomTrade(getTradeDetailMock(CLASSROOM_TRADE_ID)));
        setClassroomEventsState(getInitialTradeEventsFromTrade(disputeTrade));
        pushToast('已载入课堂演示场景：仲裁投票中（不代表真实链上交易）', 'info');
        return;
      }

      const base = buildClassroomTrade(getTradeDetailMock(CLASSROOM_TRADE_ID, getMarketplaceItem(CLASSROOM_TRADE_ID)));
      let next: TradeDetailMock = { ...base };
      let events = getInitialTradeEventsFromTrade(next);

      switch (sceneId) {
        case 'itemCreated':
          next = {
            ...base,
            state: 'Created',
            buyer: '',
            buyerShort: '—',
            refundRequested: false,
            deliveredAt: null,
            confirmDeadlinePassed: false,
            closureReason: null,
            evidenceHash: '',
          };
          events = [];
          break;
        case 'buyerPaid':
          next = {
            ...base,
            state: 'Locked',
            buyer: buyerAddr.address,
            buyerShort: buyerAddr.shortAddress,
            refundRequested: false,
            deliveredAt: null,
            confirmDeadlinePassed: false,
            closureReason: null,
          };
          events = getInitialTradeEventsFromTrade(next);
          break;
        case 'sellerDelivered':
          next = {
            ...base,
            state: 'Delivered',
            buyer: buyerAddr.address,
            buyerShort: buyerAddr.shortAddress,
            refundRequested: false,
            deliveredAt: '刚刚',
            confirmDeadlinePassed: false,
            closureReason: null,
          };
          events = getInitialTradeEventsFromTrade(next);
          break;
        case 'refundRequested':
          next = {
            ...base,
            state: 'Delivered',
            buyer: buyerAddr.address,
            buyerShort: buyerAddr.shortAddress,
            refundRequested: true,
            deliveredAt: '1 小时前',
            confirmDeadlinePassed: false,
            closureReason: null,
          };
          events = getInitialTradeEventsFromTrade(next);
          break;
        case 'disputeDepositPending':
          next = {
            ...base,
            state: 'DisputeDepositPending',
            buyer: buyerAddr.address,
            buyerShort: buyerAddr.shortAddress,
            refundRequested: false,
            deliveredAt: '2 小时前',
            evidenceHash: '0x4e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
          };
          events = getInitialTradeEventsFromTrade(next);
          break;
        default:
          break;
      }

      setClassroomTrade(next);
      setClassroomEvents(events);
      pushToast(`已载入课堂演示场景：${sceneId}（不代表真实链上交易）`, 'info');
    },
    [
      currentAccount,
      getMarketplaceItem,
      pushToast,
      resetMarketplace,
      setClassroomTrade,
      setClassroomEvents,
      syncMarketplaceItemState,
    ],
  );

  const value = useMemo(
    () => ({
      classroomTradeId: CLASSROOM_TRADE_ID,
      classroomTrade,
      classroomEvents,
      arbitrationCase,
      arbitrationLogs,
      isClassroomTrade,
      setClassroomTrade,
      updateClassroomTrade,
      setClassroomEvents,
      appendClassroomEvent,
      setArbitrationCase,
      updateArbitrationCase,
      appendArbitrationLog,
      setArbitrationLogs,
      applyScene,
    }),
    [
      classroomTrade,
      classroomEvents,
      arbitrationCase,
      arbitrationLogs,
      isClassroomTrade,
      setClassroomTrade,
      updateClassroomTrade,
      setClassroomEvents,
      appendClassroomEvent,
      setArbitrationCase,
      updateArbitrationCase,
      appendArbitrationLog,
      setArbitrationLogs,
      applyScene,
    ],
  );

  return <DemoTradeContext.Provider value={value}>{children}</DemoTradeContext.Provider>;
}
