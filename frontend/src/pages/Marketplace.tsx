import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  animateMarketplaceCards,
  flashMarketplaceCard,
  flashStatusBadge,
  useMarketplaceEntrance,
} from '../animations/useMarketplaceAnimation';
import { CreateItemForm, type CreateItemPayload } from '../components/CreateItemForm';
import { MarketplaceItemCard } from '../components/MarketplaceItemCard';
import { useDemoUI } from '../context/useDemoUI';
import { getNextMarketplaceItemId } from '../data/mockMarketplace';
import type { MarketplaceFilter, MarketplaceItem, PageFeedbackEvent } from '../types/marketplace';
import { addressesEqual, walletMatchesAddress } from '../utils/walletMatch';

const FILTER_OPTIONS: { key: MarketplaceFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'Created', label: '可购买' },
  { key: 'Locked', label: '托管中' },
  { key: 'Delivered', label: '已交付' },
  { key: 'Disputed', label: '纠纷中' },
  { key: 'Inactive', label: '已结束' },
];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function Marketplace() {
  const pageRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MarketplaceFilter>('all');
  const [creating, setCreating] = useState(false);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [pageEvents, setPageEvents] = useState<PageFeedbackEvent[]>([]);
  const {
    walletConnected,
    walletAddress,
    walletAddressFull,
    currentAccount,
    marketplaceItems,
    addMarketplaceItem,
    purchaseMarketplaceItem,
  } = useDemoUI();

  const isOwnListing = useCallback(
    (item: MarketplaceItem) =>
      walletConnected &&
      (addressesEqual(walletAddressFull, item.seller) ||
        walletMatchesAddress(walletAddress, item.seller, item.sellerShort)),
    [walletConnected, walletAddress, walletAddressFull],
  );

  const canCreate = walletConnected && currentAccount?.kind === 'seller';
  const createDisabledReason = !walletConnected
    ? '请先连接钱包或选择卖家账号'
    : currentAccount?.kind !== 'seller'
      ? '仅卖家地址可调用 createItem()'
      : undefined;

  const purchaseContext = useMemo(() => {
    if (!walletConnected) {
      return { canPurchase: false, reason: '请先连接钱包或选择买家账号' };
    }
    if (currentAccount?.kind === 'viewer') {
      return { canPurchase: false, reason: '访客账号只读，不能购买商品' };
    }
    if (currentAccount?.kind === 'arbiter') {
      return { canPurchase: false, reason: '仲裁员账号不能代替买家购买' };
    }
    if (currentAccount?.kind === 'seller') {
      return { canPurchase: true, reason: undefined };
    }
    if (currentAccount?.kind === 'buyer') {
      return { canPurchase: true, reason: undefined };
    }
    return { canPurchase: false, reason: '当前地址无购买权限' };
  }, [walletConnected, currentAccount]);

  useMarketplaceEntrance(pageRef);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return marketplaceItems.filter((item) => {
      const matchFilter = filter === 'all' || item.state === filter;
      if (!matchFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.seller.toLowerCase().includes(q) ||
        item.sellerShort.toLowerCase().includes(q) ||
        String(item.id).includes(q)
      );
    });
  }, [marketplaceItems, search, filter]);

  useEffect(() => {
    animateMarketplaceCards(gridRef.current);
  }, [filter, search, filteredItems.length]);

  const pushPageEvent = useCallback((type: PageFeedbackEvent['type'], description: string) => {
    const evt: PageFeedbackEvent = {
      id: `mkt-evt-${Date.now()}`,
      time: '刚刚',
      type,
      description,
      txHash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
    };
    setPageEvents((prev) => [evt, ...prev].slice(0, 8));
  }, []);

  const handleCreate = useCallback(
    (payload: CreateItemPayload) => {
      if (!canCreate) {
        setFeedback(createDisabledReason ?? '当前账号不能创建商品');
        return;
      }
      setCreating(true);
      setFeedback('正在模拟 createItem() 上链...');
      window.setTimeout(() => {
        const newItem: MarketplaceItem = {
          id: getNextMarketplaceItemId(marketplaceItems),
          title: payload.title,
          description: payload.description,
          priceEth: payload.priceEth,
          seller: walletAddressFull,
          sellerShort: walletAddress,
          state: 'Created',
          metadataHash: payload.metadataHash,
          createdAt: '刚刚',
          deliveryWindowHours: payload.deliveryWindowHours,
          confirmWindowHours: payload.confirmWindowHours,
        };
        addMarketplaceItem(newItem);
        pushPageEvent('ItemCreated', `卖家发布商品「${payload.title}」`);
        setFeedback('商品发布成功！资金尚未托管，等待买家购买。');
        setCreating(false);
        window.setTimeout(() => {
          const card = gridRef.current?.querySelector(`[data-item-id="${newItem.id}"]`);
          flashMarketplaceCard(card as HTMLElement | null);
        }, 50);
      }, 1200);
    },
    [
      canCreate,
      createDisabledReason,
      walletAddress,
      walletAddressFull,
      marketplaceItems,
      addMarketplaceItem,
      pushPageEvent,
    ],
  );

  const handlePurchase = useCallback(
    (item: MarketplaceItem, cardEl: HTMLElement | null) => {
      if (!purchaseContext.canPurchase) {
        setFeedback(purchaseContext.reason ?? '当前账号不能购买');
        return;
      }
      if (item.state !== 'Created') return;
      if (isOwnListing(item)) {
        setFeedback('不能购买自己发布的商品（合约将校验 msg.sender ≠ seller）');
        return;
      }
      setPurchasingId(item.id);
      setFeedback(`正在模拟 purchaseItem()，向合约锁仓 ${item.priceEth} ETH...`);
      window.setTimeout(() => {
        purchaseMarketplaceItem(item.id, {
          address: walletAddressFull,
          shortAddress: walletAddress,
        });
        pushPageEvent(
          'ItemPurchased',
          `买家 ${walletAddress} 付款，${item.priceEth} ETH 已进入托管合约`,
        );
        setFeedback('购买成功！资金已进入托管合约。');
        setPurchasingId(null);
        const badge = cardEl?.querySelector('[data-status-badge]');
        flashStatusBadge(badge as HTMLElement | null);
        flashMarketplaceCard(cardEl);
      }, 1200);
    },
    [
      purchaseContext,
      walletAddress,
      walletAddressFull,
      pushPageEvent,
      isOwnListing,
      purchaseMarketplaceItem,
    ],
  );

  return (
    <main className="content marketplace-page" ref={pageRef}>
      <div className="page-header mkt-animate">
        <h1 className="page-title">交易市场</h1>
        <p className="page-subtitle">
          买家付款后资金托管于智能合约；当前 Demo 账号决定可执行的操作。
        </p>
      </div>

      {feedback ? (
        <p className="page-feedback mkt-animate" aria-live="polite">
          {feedback}
        </p>
      ) : null}

      <div className="marketplace-layout">
        <div className="main-column">
          <div className="toolbar mkt-animate">
            <div className="toolbar-left">
              <div className="search-box">
                <SearchIcon />
                <input
                  type="search"
                  placeholder="搜索商品标题、ID 或卖家地址..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="搜索商品"
                />
              </div>
              <div className="filter-chips" role="group" aria-label="状态筛选">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`chip ${filter === opt.key ? 'active' : ''}`}
                    onClick={() => setFilter(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="items-grid" ref={gridRef}>
            {filteredItems.length === 0 ? (
              <p className="empty-hint mkt-animate">没有匹配的商品，请调整搜索或筛选条件。</p>
            ) : (
              filteredItems.map((item) => (
                <MarketplaceItemCard
                  key={item.id}
                  item={item}
                  purchasing={purchasingId === item.id}
                  isOwnListing={isOwnListing(item)}
                  canPurchase={purchaseContext.canPurchase}
                  purchaseDisabledReason={purchaseContext.reason}
                  onPurchase={handlePurchase}
                />
              ))
            )}
          </div>

          {pageEvents.length > 0 ? (
            <div className="main-card mkt-animate marketplace-events">
              <div className="card-header-area compact">
                <div className="card-title-group">
                  <h2>页面事件反馈</h2>
                  <p>模拟 ItemCreated / ItemPurchased 链上事件</p>
                </div>
              </div>
              <div className="events-list compact">
                {pageEvents.map((evt) => (
                  <div key={evt.id} className="event-item">
                    <span className="event-time">{evt.time}</span>
                    <span className={`event-badge badge-${evt.type === 'ItemCreated' ? 'created' : 'purchased'}`}>
                      {evt.type}
                    </span>
                    <span className="event-desc">{evt.description}</span>
                    <span className="event-hash mono-truncate" title={evt.txHash}>
                      {evt.txHash}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="side-column">
          <CreateItemForm
            walletConnected={walletConnected}
            canCreate={canCreate}
            disabledReason={createDisabledReason}
            sellerAddress={walletAddressFull || '未连接'}
            sellerShort={walletAddress}
            submitting={creating}
            onSubmit={handleCreate}
          />
          <p className="purchase-guard-hint mkt-animate">
            合约权限由当前地址决定：卖家 createItem()，非卖家买家 purchaseItem()。
          </p>
        </div>
      </div>
    </main>
  );
}
