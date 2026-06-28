import { txStatusLabel } from '../../animations/useTxStatusAnimation';
import { useDemoUI } from '../../context/useDemoUI';
import { getDashboardMock } from '../../data/mockDashboard';
import { tradeRoleLabel, tradeRoleTagClass } from '../../utils/deriveTradeRole';

const mock = getDashboardMock();

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <path d="M22 10h-6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h6" />
    </svg>
  );
}

export function TopStatusBar() {
  const {
    walletConnected,
    walletAddress,
    currentAccount,
    txStatus,
    connecting,
    dotRef,
    textRef,
    connectWallet,
  } = useDemoUI();

  const globalRole = !walletConnected
    ? 'guest'
    : currentAccount?.kind === 'viewer'
      ? 'viewer'
      : currentAccount?.kind === 'seller'
        ? 'seller'
        : currentAccount?.kind === 'buyer'
          ? 'buyer'
          : currentAccount?.kind === 'arbiter'
            ? 'arbitrator'
            : 'viewer';

  return (
    <header className="top-bar">
      <div className="status-left">
        <div className="status-item">
          <span className="status-label">网络:</span>
          <span className="status-value-badge network">Sepolia 测试网</span>
        </div>
        <div className="status-item status-item-contract">
          <span className="status-label">合约:</span>
          <span className="status-value-badge" title={mock.contractAddress}>
            {mock.contractAddressShort}
          </span>
        </div>
        {walletConnected && currentAccount ? (
          <div className="status-item status-item-role">
            <span className="status-label">当前账号:</span>
            <span className="status-value-badge account-badge">{currentAccount.roleLabel}</span>
            <span className={`role-tag ${tradeRoleTagClass(globalRole)}`}>
              {tradeRoleLabel(globalRole)}
            </span>
          </div>
        ) : null}
      </div>
      <div className="status-right">
        <div className="tx-status">
          <span className="status-label">交易状态:</span>
          <span ref={dotRef} className={`status-dot ${txStatus}`} />
          <span ref={textRef} className={`tx-status-text ${txStatus}`}>
            {txStatusLabel(txStatus)}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">钱包:</span>
          <span className={`status-value-badge ${walletConnected ? 'connected' : ''}`}>{walletAddress}</span>
        </div>
        <button
          type="button"
          className="btn-connect"
          disabled={walletConnected || connecting}
          onClick={connectWallet}
        >
          <WalletIcon />
          <span>{connecting ? '正在连接...' : walletConnected ? '已连接钱包' : '连接钱包'}</span>
        </button>
      </div>
    </header>
  );
}
