import { useState, type FormEvent } from 'react';

export interface CreateItemPayload {
  title: string;
  description: string;
  priceEth: string;
  deliveryWindowHours: number;
  confirmWindowHours: number;
  metadataHash: string;
}

interface CreateItemFormProps {
  walletConnected: boolean;
  canCreate: boolean;
  disabledReason?: string;
  sellerAddress: string;
  sellerShort: string;
  submitting: boolean;
  onSubmit: (payload: CreateItemPayload) => void;
}

export function CreateItemForm({
  walletConnected,
  canCreate,
  disabledReason,
  sellerAddress,
  sellerShort,
  submitting,
  onSubmit,
}: CreateItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceEth, setPriceEth] = useState('');
  const [deliveryHours, setDeliveryHours] = useState('24');
  const [confirmHours, setConfirmHours] = useState('48');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!walletConnected) {
      setError('请先连接钱包后再创建商品');
      return;
    }
    if (!canCreate) {
      setError(disabledReason ?? '当前账号无创建商品权限');
      return;
    }
    if (!title.trim()) {
      setError('商品标题不能为空');
      return;
    }
    if (!description.trim()) {
      setError('商品描述不能为空');
      return;
    }
    const price = Number(priceEth);
    if (!priceEth || Number.isNaN(price) || price <= 0) {
      setError('出售价格必须大于 0 ETH');
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priceEth: price.toFixed(3),
      deliveryWindowHours: Number(deliveryHours) || 24,
      confirmWindowHours: Number(confirmHours) || 48,
      metadataHash: `0x${Math.random().toString(16).slice(2, 10)}...${sellerAddress.slice(-4)}`,
    });
    setTitle('');
    setDescription('');
    setPriceEth('');
    setDeliveryHours('24');
    setConfirmHours('48');
  };

  return (
    <div className="create-card mkt-animate">
      <h3>创建新商品</h3>
      <p className="create-hint">卖家地址（当前 Demo 账号）：{sellerShort}</p>
      {!canCreate && disabledReason ? (
        <p className="permission-reason" role="status">{disabledReason}</p>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="c-title">
            商品标题
          </label>
          <input
            id="c-title"
            className="form-control"
            placeholder="例如：iPhone 13 Pro"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canCreate}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-desc">
            商品描述
          </label>
          <textarea
            id="c-desc"
            className="form-control"
            placeholder="简要描述物品状态..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canCreate}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-price">
            出售价格
          </label>
          <div className="input-with-suffix">
            <input
              id="c-price"
              type="number"
              step="0.001"
              min="0"
              className="form-control"
              placeholder="0.00"
              value={priceEth}
              onChange={(e) => setPriceEth(e.target.value)}
              disabled={!canCreate}
            />
            <span className="input-suffix">ETH</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-delivery">
            发货窗口时间
          </label>
          <div className="input-with-suffix">
            <input
              id="c-delivery"
              type="number"
              min="1"
              className="form-control"
              value={deliveryHours}
              onChange={(e) => setDeliveryHours(e.target.value)}
              disabled={!canCreate}
            />
            <span className="input-suffix">小时</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="c-confirm">
            买家确认窗口
          </label>
          <div className="input-with-suffix">
            <input
              id="c-confirm"
              type="number"
              min="1"
              className="form-control"
              value={confirmHours}
              onChange={(e) => setConfirmHours(e.target.value)}
              disabled={!canCreate}
            />
            <span className="input-suffix">小时</span>
          </div>
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button type="submit" className="btn-submit" disabled={submitting || !canCreate}>
          {submitting ? '上链确认中...' : '创建商品 createItem()'}
        </button>
      </form>
    </div>
  );
}
