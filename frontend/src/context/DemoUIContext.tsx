import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ChainEvent, ToastMessage, TradeState, TxStatus } from '../types/demo';
import type { MarketplaceItem } from '../types/marketplace';
import type { DemoAccount, DemoAccountId } from '../types/roles';
import type { ContractBasics, WalletMode } from '../types/wallet';
import { useTxStatusAnimation } from '../animations/useTxStatusAnimation';
import { animateEventItemIn } from '../animations/useToastAnimation';
import { getDemoAccount, getDemoAccountByAddress } from '../data/demoAccounts';
import { shortAddress } from '../data/deployment';
import { getInitialCatalogItems } from '../data/mockCatalog';
import { fetchContractBasics } from '../services/escrowContract';
import {
  chainIdToLabel,
  connectMetaMask,
  getInjectedProvider,
  SEPOLIA_CHAIN_ID,
} from '../services/ethereum';
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

async function loadContractBasicsForProvider(
  provider: Awaited<ReturnType<typeof connectMetaMask>>['provider'],
  chainId: bigint,
): Promise<{ basics: ContractBasics | null; error: string | null }> {
  if (chainId !== SEPOLIA_CHAIN_ID) {
    return { basics: null, error: null };
  }
  try {
    const basics = await fetchContractBasics(provider);
    return { basics, error: null };
  } catch (err) {
    return {
      basics: null,
      error: err instanceof Error ? err.message : '合约读取失败',
    };
  }
}

export function DemoUIProvider({ children, initialEvents }: { children: ReactNode; initialEvents: ChainEvent[] }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletMode, setWalletMode] = useState<WalletMode>('mock');
  const [currentAccount, setCurrentAccount] = useState<DemoAccount | null>(null);
  const [walletAddress, setWalletAddress] = useState('未连接');
  const [walletAddressFull, setWalletAddressFull] = useState('');
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [networkLabel, setNetworkLabel] = useState('未连接');
  const [contractBasics, setContractBasics] = useState<ContractBasics | null>(null);
  const [contractReadError, setContractReadError] = useState<string | null>(null);
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

  const clearLiveWalletState = useCallback(() => {
    setWalletMode('mock');
    setChainId(null);
    setNetworkLabel('未连接');
    setContractBasics(null);
    setContractReadError(null);
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

  const bindLiveWallet = useCallback((address: string, nextChainId: bigint) => {
    setWalletMode('live');
    setWalletConnected(true);
    setCurrentAccount(getDemoAccountByAddress(address) ?? null);
    setWalletAddress(shortAddress(address));
    setWalletAddressFull(address);
    setChainId(nextChainId);
    setNetworkLabel(chainIdToLabel(nextChainId));
  }, []);

  const setDemoAccount = useCallback(
    (id: DemoAccountId) => {
      clearLiveWalletState();
      setNetworkLabel('课堂 Mock');
      setWalletMode('mock');
      bindAccount(getDemoAccount(id));
    },
    [bindAccount, clearLiveWalletState],
  );

  const disconnectDemo = useCallback(() => {
    setWalletConnected(false);
    setCurrentAccount(null);
    setWalletAddress('未连接');
    setWalletAddressFull('');
    clearLiveWalletState();
    try {
      sessionStorage.removeItem(ACCOUNT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [clearLiveWalletState]);

  const resetMarketplace = useCallback(() => {
    setMarketplaceItems(getInitialCatalogItems());
  }, []);

  const callbacks = useMemo(
    () => ({
      onPending: () => setTxStatus('pending'),
      onSuccess: () => {
        setTxStatus('success');
        const account = getDemoAccount(pendingConnectAccountRef.current);
        setWalletMode('mock');
        setNetworkLabel('课堂 Mock');
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

  const connectMockWallet = useCallback(() => {
    pendingConnectAccountRef.current = readStoredAccountId();
    const account = getDemoAccount(pendingConnectAccountRef.current);
    setConnecting(true);
    setWalletMode('mock');
    setNetworkLabel('课堂 Mock');
    setContractBasics(null);
    setContractReadError(null);
    setChainId(null);
    pushToast('未检测到 MetaMask，使用课堂 Mock 钱包模式', 'warning');
    playConnectFlow();
    window.setTimeout(() => {
      pushToast(`Mock 钱包已绑定: ${account.shortAddress}`, 'success');
    }, 1300);
  }, [playConnectFlow, pushToast]);

  const connectWallet = useCallback(async () => {
    if (walletConnected || connecting) return;

    const injected = getInjectedProvider();
    if (!injected) {
      connectMockWallet();
      return;
    }

    setConnecting(true);
    setTxStatus('pending');
    pushToast('正在请求 MetaMask 授权...', 'info');

    try {
      const { provider, chainId: nextChainId, address } = await connectMetaMask();
      bindLiveWallet(address, nextChainId);
      setConnecting(false);
      setTxStatus('success');
      pushToast(`MetaMask 已连接: ${shortAddress(address)}`, 'success');

      const { basics, error } = await loadContractBasicsForProvider(provider, nextChainId);
      setContractBasics(basics);
      setContractReadError(error);

      if (nextChainId !== SEPOLIA_CHAIN_ID) {
        pushToast('当前网络不是 Sepolia，请切换后重新连接以读取合约', 'warning');
      } else if (basics) {
        pushToast(
          `链上只读: nextItemId=${basics.nextItemId.toString()}, activeArbiterCount=${basics.activeArbiterCount.toString()}`,
          'success',
        );
      } else if (error) {
        pushToast(`合约只读失败: ${error}（课堂 mock 仍可用）`, 'warning');
      }
    } catch {
      setConnecting(false);
      setTxStatus('failed');
      pushToast('MetaMask 连接被拒绝或失败，可改用左侧课堂账号切换器', 'error');
    }
  }, [walletConnected, connecting, bindLiveWallet, connectMockWallet, pushToast]);

  useEffect(() => {
    const injected = getInjectedProvider();
    if (!injected || walletMode !== 'live' || !walletConnected) return;

    const onAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) {
        disconnectDemo();
        return;
      }
      const address = list[0];
      setWalletAddress(shortAddress(address));
      setWalletAddressFull(address);
      setCurrentAccount(getDemoAccountByAddress(address) ?? null);
    };

    const onChainChanged = () => {
      window.location.reload();
    };

    injected.on?.('accountsChanged', onAccountsChanged);
    injected.on?.('chainChanged', onChainChanged);
    return () => {
      injected.removeListener?.('accountsChanged', onAccountsChanged);
      injected.removeListener?.('chainChanged', onChainChanged);
    };
  }, [walletMode, walletConnected, disconnectDemo]);

  const simulateDemoTx = useCallback(() => {
    if (!walletConnected) {
      pushToast('请先在右上方点击 [连接钱包] 导入 Web3 账户节点', 'warning');
      return;
    }
    playDemoTxFlow();
    if (walletMode === 'live' && contractBasics) {
      pushToast(
        `链上只读同步: nextItemId=${contractBasics.nextItemId.toString()}, activeArbiterCount=${contractBasics.activeArbiterCount.toString()}`,
        'success',
      );
    } else {
      pushToast('正在读取智能合约 OrderData 结构体... 数据加载成功', 'success');
    }
    prependEvent({
      id: `evt-live-${Date.now()}`,
      time: '刚刚',
      type: 'ItemDelivered',
      description:
        walletMode === 'live' ? '链上钱包模式：演示事件同步（写操作仍为 mock）' : '课堂演示：模拟链上事件同步',
      txHash: '0xab12...cd34',
    });
  }, [walletConnected, walletMode, contractBasics, playDemoTxFlow, pushToast, prependEvent]);

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
      prev.map((row) => (row.id === itemId ? { ...row, state } : row)),
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
      walletMode,
      walletAddress,
      walletAddressFull,
      chainId,
      networkLabel,
      contractBasics,
      contractReadError,
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
      walletMode,
      walletAddress,
      walletAddressFull,
      chainId,
      networkLabel,
      contractBasics,
      contractReadError,
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
