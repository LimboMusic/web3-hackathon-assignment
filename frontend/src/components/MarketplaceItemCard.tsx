import { Link } from 'react-router-dom';
import type { MarketplaceItem } from '../types/marketplace';
import { stateBadgeClass, stateBadgeLabel } from '../utils/marketplaceState';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  purchasing: boolean;
  isOwnListing: boolean;
  canPurchase: boolean;
  purchaseDisabledReason?: string;
  onPurchase: (item: MarketplaceItem, cardEl: HTMLElement | null) => void;
}

export function MarketplaceItemCard({
  item,
  purchasing,
  isOwnListing,
  canPurchase,
  purchaseDisabledReason,
  onPurchase,
}: MarketplaceItemCardProps) {
  const canBuy = item.state === 'Created' && canPurchase && !isOwnListing;
  const cardRef = (el: HTMLDivElement | null) => {
    if (el) el.dataset.itemId = String(item.id);
  };

  let purchaseLabel = '付款购买 purchaseItem()';
  if (isOwnListing) purchaseLabel = '不可自购';
  else if (item.state !== 'Created') purchaseLabel = '不可购买';
  else if (purchasing) purchaseLabel = '购买中...';
  else if (!canPurchase && purchaseDisabledReason) purchaseLabel = '无购买权限';

  return (
    <div className="item-card mkt-animate" ref={cardRef} data-item-id={item.id}>
      <div className="item-header">
        <h3 className="item-title">{item.title}</h3>
        <div className={`status-badge ${stateBadgeClass(item.state)}`} data-status-badge>
          <span className="badge-dot" />
          {stateBadgeLabel(item.state)}
        </div>
      </div>
      <p className="item-desc">{item.description}</p>
      <div className="item-price">
        <span className="price-val">{item.priceEth}</span>
        <span className="price-unit">ETH</span>
      </div>
      <div className="item-meta">
        <div className="meta-row">
          <span className="meta-label">卖家地址</span>
          <span className="meta-value mono-truncate" title={item.seller}>
            {item.sellerShort}
          </span>
        </div>
        <div className="meta-row">
          <span className="meta-label">商品 ID</span>
          <span className="meta-value">#{item.id}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">交付/确认窗口</span>
          <span className="meta-value">
            {item.deliveryWindowHours}h / {item.confirmWindowHours}h
          </span>
        </div>
      </div>
      <div className="item-actions">
        <Link className="btn-card btn-card-secondary" to={`/trade/${item.id}`}>
          查看详情
        </Link>
        {isOwnListing ? (
          <p className="purchase-guard-hint inline" role="status">
            不能购买自己的商品
          </p>
        ) : null}
        {!canPurchase && purchaseDisabledReason && !isOwnListing ? (
          <p className="permission-reason inline" role="status">{purchaseDisabledReason}</p>
        ) : null}
        <button
          type="button"
          className="btn-card btn-card-primary"
          disabled={!canBuy || purchasing}
          title={!canBuy ? purchaseDisabledReason : undefined}
          onClick={(e) => onPurchase(item, e.currentTarget.closest('.item-card'))}
        >
          {purchaseLabel}
        </button>
      </div>
    </div>
  );
}
