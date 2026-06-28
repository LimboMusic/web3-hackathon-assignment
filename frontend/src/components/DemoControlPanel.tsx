import { useDemoUI } from '../context/useDemoUI';
import { useDemoTrade } from '../context/useDemoTrade';
import { CLASSROOM_TRADE_ID } from '../data/demoAccounts';
import { DEMO_ACCOUNTS } from '../data/demoAccounts';
import type { DemoAccountId, DemoSceneId } from '../types/roles';
import { DEMO_SCENE_LABELS } from '../types/roles';

const SCENE_IDS: DemoSceneId[] = [
  'reset',
  'itemCreated',
  'buyerPaid',
  'sellerDelivered',
  'refundRequested',
  'disputeDepositPending',
  'arbitrationVoting',
];

export function DemoControlPanel() {
  const { currentAccount, setDemoAccount, walletConnected } = useDemoUI();
  const { applyScene } = useDemoTrade();

  return (
    <aside className="demo-control-panel" aria-label="课堂演示控制台">
      <div className="demo-control-header">
        <h2 className="demo-control-title">课堂演示控制台</h2>
        <p className="demo-control-subtitle">
          仅用于切换 Demo 账号与课堂场景，不是链上业务功能。主交易演示请打开侧边栏「交易详情」（商品 #{CLASSROOM_TRADE_ID}）。
        </p>
      </div>

      <div className="demo-control-section">
        <h3 className="demo-control-section-title">切换 Demo 账号</h3>
        <div className="demo-control-btn-row" role="group" aria-label="Demo 账号">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              type="button"
              className={`demo-account-btn ${currentAccount?.id === account.id ? 'active' : ''}`}
              onClick={() => setDemoAccount(account.id as DemoAccountId)}
            >
              {account.label}
            </button>
          ))}
        </div>
        {!walletConnected ? (
          <p className="demo-control-hint">点击账号将模拟已连接钱包；也可先点右上角「连接钱包」。</p>
        ) : null}
      </div>

      <div className="demo-control-section">
        <h3 className="demo-control-section-title">切换课堂场景</h3>
        <div className="demo-control-btn-row demo-scene-row" role="group" aria-label="课堂场景">
          {SCENE_IDS.map((sceneId) => (
            <button
              key={sceneId}
              type="button"
              className="demo-scene-btn"
              onClick={() => applyScene(sceneId)}
            >
              {DEMO_SCENE_LABELS[sceneId]}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
