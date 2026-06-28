import { createContext, useContext } from 'react';
import type { ArbitrationLogEntry, ArbitrationMock } from '../types/arbitration';
import type { DemoSceneId } from '../types/roles';
import type { TradeDetailMock, TradePageEvent } from '../types/trade';

export interface DemoTradeContextValue {
  classroomTradeId: number;
  classroomTrade: TradeDetailMock;
  classroomEvents: TradePageEvent[];
  arbitrationCase: ArbitrationMock;
  arbitrationLogs: ArbitrationLogEntry[];
  isClassroomTrade: (itemId: number) => boolean;
  setClassroomTrade: (trade: TradeDetailMock) => void;
  updateClassroomTrade: (patch: Partial<TradeDetailMock>) => void;
  setClassroomEvents: (events: TradePageEvent[]) => void;
  appendClassroomEvent: (event: TradePageEvent) => void;
  setArbitrationCase: (caseData: ArbitrationMock) => void;
  updateArbitrationCase: (updater: (prev: ArbitrationMock) => ArbitrationMock) => void;
  appendArbitrationLog: (entry: ArbitrationLogEntry) => void;
  setArbitrationLogs: (logs: ArbitrationLogEntry[]) => void;
  applyScene: (sceneId: DemoSceneId) => void;
}

export const DemoTradeContext = createContext<DemoTradeContextValue | null>(null);

export function useDemoTrade() {
  const ctx = useContext(DemoTradeContext);
  if (!ctx) throw new Error('useDemoTrade must be used within DemoTradeProvider');
  return ctx;
}
