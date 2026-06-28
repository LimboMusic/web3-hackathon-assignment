import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ChainEvent, ToastMessage, TradeState, TxStatus } from '../types/demo';
import type { MarketplaceItem } from '../types/marketplace';
import type { DemoAccount, DemoAccountId } from '../types/roles';
import { useTxStatusAnimation } from '../animations/useTxStatusAnimation';
import { animateEventItemIn } from '../animations/useToastAnimation';
import { getDemoAccount } from '../data/demoAccounts';
import { getInitialCatalogItems } from '../data/mockCatalog';
import { DemoUIContext } from './useDemoUI';

const ACCOUNT_STORAGE_KEY = 'demo-account-id';

function readStoredAccountId(): DemoAccountId {
  try {
    const stored = sessionStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (
      stored === 'seller' ||
      stored === 'buyer' ||
      stored === 'arbiter1' ||
      stored === 'arbiter2' ||
      stored === 'arbiter3' ||
      stored === 'viewer'
    ) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return 'buyer';
}

function applyAccountToWallet(account: DemoAccount) {
  return {
    walletAddress: account.shortAddress,
    walletAddressFull: account.address,
  };
}

export function DemoUIProvider({ children, initialEvents }: { children: ReactNode; initialEvents: ChainEvent[] }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<DemoAccount | null>(null);
  const [walletAddress, setWalletAddress] = useState('未连接');
  const [walletAddressFull, setWalletAddressFull] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [connecting, setConnecting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [events, setEvents] = useState<ChainEvent[]>(initialEvents);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(() => getInitialCatalogItems());
  const dotRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const toastId = useRef(0);
  const pendingConnectAccountRef = useRef<DemoAccountId>('buyer');

  const pushToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${++toastId.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const prependEvent = useCallback((event: ChainEvent) => {
    setEvents((prev) => [event, ...prev]);
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-event-id="${event.id}"]`);
      animateEventItemIn(el as HTMLElement | null);
    });
  }, []);

  const bindAccount = useCallback((account: DemoAccount, persist = true) => {
    const { walletAddress: short, walletAddressFull: full } = applyAccountToWallet(account);
    setWalletConnected(true);
    setCurrentAccount(account);
    setWalletAddress(short);
    setWalletAddressFull(full);
    if (persist) {
      try {
        sessionStorage.setItem(ACCOUNT_STORAGE_KEY, account.id);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const setDemoAccount = useCallback(
    (id: DemoAccountId) => {
      bindAccount(getDemoAccount(id));
    },
    [bindAccount],
  );

  const disconnectDemo = useCallback(() => {
    setWalletConnected(false);
    setCurrentAccount(null);
    setWalletAddress('未连接');
    setWalletAddressFull('');
    try {
      sessionStorage.removeItem(ACCOUNT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const resetMarketplace = useCallback(() => {
    setMarketplaceItems(getInitialCatalogItems());
  }, []);

  const callbacks = useMemo(
    () => ({
      onPending: () => setTxStatus('pending'),
      onSuccess: () => {
        setTxStatus('success');
        const account = getDemoAccount(pendingConnectAccountRef.current);
        bindAccount(account);
        setConnecting(false);
      },
      onIdle: () => setTxStatus('idle'),
      onFailed: () => {
        setTxStatus('failed');
        setConnecting(false);
        pushToast('模拟交易失败：链上回执 rejected（课堂演示）', 'error');
      },
    }),
    [bindAccount, pushToast],
  );

  const { playConnectFlow, playDemoTxFlow, playFailedFlow } = useTxStatusAnimation(dotRef, textRef, callbacks);

  const connectWallet = useCallback(() => {
    if (walletConnected || connecting) return;
    pendingConnectAccountRef.current = readStoredAccountId();
    const account = getDemoAccount(pendingConnectAccountRef.current);
    setConnecting(true);
    pushToast('正在模拟 MetaMask 授权获取公开地址...', 'info');
    playConnectFlow();
    setTimeout(() => {
      pushToast(`钱包授权成功！成功绑定地址: ${account.shortAddress}`, 'success');
      pushToast('链上状态机轮询同步完成，所有合约只读方法已放开。', 'success');
    }, 1300);
  }, [walletConnected, connecting, playConnectFlow, pushToast]);

  const simulateDemoTx = useCallback(() => {
    if (!walletConnected) {
      pushToast('请先在右上方点击 [连接钱包] 导入 Web3 账户节点', 'warning');
      return;
    }
    playDemoTxFlow();
    pushToast('正在读取智能合约 OrderData 结构体... 数据加载成功', 'success');
    prependEvent({
      id: `evt-live-${Date.now()}`,
      time: '刚刚',
      type: 'ItemDelivered',
      description: '课堂演示：模拟链上事件同步',
      txHash: '0xab12...cd34',
    });
  }, [walletConnected, playDemoTxFlow, pushToast, prependEvent]);

  const simulateFailedTx = useCallback(() => {
    if (!walletConnected) {
      pushToast('请先在右上方点击 [连接钱包] 导入 Web3 账户节点', 'warning');
      return;
    }
    playFailedFlow();
  }, [walletConnected, playFailedFlow, pushToast]);

  const getMarketplaceItem = useCallback(
    (itemId: number) => marketplaceItems.find((item) => item.id === itemId),
    [marketplaceItems],
  );

  const addMarketplaceItem = useCallback((item: MarketplaceItem) => {
    setMarketplaceItems((prev) => [item, ...prev]);
  }, []);

  const purchaseMarketplaceItem = useCallback(
    (itemId: number, buyer: { address: string; shortAddress: string }) => {
      setMarketplaceItems((prev) =>
        prev.map((row) =>
          row.id === itemId
            ? {
                ...row,
                state: 'Locked' as const,
                buyer: buyer.address,
                buyerShort: buyer.shortAddress,
              }
            : row,
        ),
      );
    },
    [],
  );

  const syncMarketplaceItemState = useCallback((itemId: number, state: TradeState) => {
    setMarketplaceItems((prev) =>
      prev.map((row) => (row.id  === itemId ? { ...row, state } : row)),
    );
  }, []);

  const updateMarketplaceItem = useCallback((itemId: number, patch: Partial<MarketplaceItem>) => {
    setMarketplaceItems((prev) =>
      prev.map((row) => (row.id === itemId ? { ...row, ...patch } : row)),
    );
  }, []);

  const value = useMemo(
    () => ({
      walletConnected,
      walletAddress,
      walletAddressFull,
      currentAccount,
      setDemoAccount,
      disconnectDemo,
      resetMarketplace,
      txStatus,
      connecting,
      toasts,
      events,
      marketplaceItems,
      dotRef,
      textRef,
      connectWallet,
      simulateDemoTx,
      simulateFailedTx,
      pushToast,
      dismissToast,
      getMarketplaceItem,
      addMarketplaceItem,
      purchaseMarketplaceItem,
      syncMarketplaceItemState,
      updateMarketplaceItem,
    }),
    [
      walletConnected,
      walletAddress,
      walletAddressFull,
      currentAccount,
      setDemoAccount,
      disconnectDemo,
      resetMarketplace,
      txStatus,
      connecting,
      toasts,
      events,
      marketplaceItems,
      connectWallet,
      simulateDemoTx,
      simulateFailedTx,
      pushToast,
      dismissToast,
      getMarketplaceItem,
      addMarketplaceItem,
      purchaseMarketplaceItem,
      syncMarketplaceItemState,
      updateMarketplaceItem,
    ],
  );

  return <DemoUIContext.Provider value={value}>{children}</DemoUIContext.Provider>;
}
