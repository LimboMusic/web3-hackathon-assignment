import { Link } from 'react-router-dom';
import type { DemoTrade } from '../types/demo';
import { useDemoUI } from '../context/useDemoUI';

export function DemoTradeSnapshot({ trade }: { trade: DemoTrade }) {
  const { simulateDemoTx, simulateFailedTx } = useDemoUI();

  return (
    <div className="main-card dash-animate">
      <div className="card-header-area">
        <div className="card-title-group">
          <h2>当前课堂演示交易快照</h2>
          <p>正在链上进行状态演示与代码测试的二手交易订单</p>
        </div>
        <span className="badge badge-success">{trade.stateLabel}</span>
      </div>
      <div className="demo-trade-container">
        <div className="trade-info-panel">
          <div className="info-row">
            <span className="info-label">商品名称</span>
            <span className="info-value large">{trade.itemName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">商品 ID</span>
            <span className="info-value">#{trade.itemId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">锁定托管金额</span>
            <span className="info-value eth-amount">{trade.priceEth} ETH</span>
            <span className="escrow-note">{trade.escrowNote}</span>
          </div>
          <div className="info-row">
            <span className="info-label">卖家账户地址 (Seller)</span>
            <span className="address-box">{trade.seller}</span>
          </div>
          <div className="info-row">
            <span className="info-label">买家账户地址 (Buyer)</span>
            <span className="address-box">{trade.buyer}</span>
          </div>
          <div className="info-row">
            <span className="info-label">当前合约状态</span>
            <span className="info-value">{trade.state}</span>
          </div>
          <div className="trade-actions">
            <button type="button" className="btn-action btn-action-primary" onClick={simulateDemoTx}>
              查看交易详情
            </button>
            <Link to="/arbitration" className="btn-action btn-action-secondary">
              进入仲裁中心
            </Link>
            <button type="button" className="btn-action btn-action-danger" onClick={simulateFailedTx}>
              模拟失败交易
            </button>
          </div>
        </div>
        <div className="diagram-panel">
          <div className="diagram-title">本阶段智能合约资金流向图</div>
          <div className="flow-route">
            <div className="flow-node">
              买家钱包 (0xB456...)
              <div className="flow-node-sub">已扣款 {trade.priceEth} ETH</div>
            </div>
            <div className="flow-arrow">
              <span className="flow-arrow-label">1. 调用 purchaseItem()</span>↓
            </div>
            <div className="flow-node highlight">
              智能合约托管账户 (0x9cAF...)
              <div className="flow-node-sub" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                当前锁仓：{trade.priceEth} ETH
              </div>
            </div>
            <div className="flow-arrow">
              <span className="flow-arrow-label">2. 卖家已标记发货，等待买家确认</span>↓
            </div>
            <div className="flow-branches">
              <div className="flow-node success-branch">
                正常释放 → 卖家
                <div className="flow-node-sub">confirmReceived()</div>
              </div>
              <div className="flow-node danger-branch">
                发生纠纷 → 仲裁裁决
                <div className="flow-node-sub">openDispute()</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
