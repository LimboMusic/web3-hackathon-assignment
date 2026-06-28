import { txStatusLabel } from '../../animations/useTxStatusAnimation';
import { useDemoUI } from '../../context/useDemoUI';
import { ESCROW_DEPLOYMENT } from '../../contracts/escrowDeployment';
import { shortAddress } from '../../data/deployment';
import { SEPOLIA_CHAIN_ID } from '../../services/ethereum';
import { tradeRoleLabel, tradeRoleTagClass } from '../../utils/deriveTradeRole';

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
    walletMode,
    walletAddress,
    chainId,
    networkLabel,
    contractBasics,
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
            : walletMode === 'live'
              ? 'viewer'
              : 'viewer';

  const networkBadgeClass =
    walletMode === 'live' && chainId !== null && chainId !== SEPOLIA_CHAIN_ID
      ? 'network-warn'
      : 'network';

  return (
    <header className="top-bar">
      <div className="status-left">
        <div className="status-item">
          <span className="status-label">模式:</span>
          <span className={`status-value-badge ${walletMode === 'live' ? 'network-ok' : 'wallet-warn'}`}>
            {walletMode === 'live' ? '链上钱包' : '课堂 Mock'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">网络:</span>
          <span className={`status-value-badge ${networkBadgeClass}`}>
            {walletConnected ? networkLabel : '未连接'}
            {walletMode === 'live' && chainId !== null ? ` (${chainId.toString()})` : ''}
          </span>
        </div>
        <div className="status-item status-item-contract">
          <span className="status-label">合约:</span>
          <span className="status-value-badge" title={ESCROW_DEPLOYMENT.address}>
            {shortAddress(ESCROW_DEPLOYMENT.address)}
          </span>
        </div>
        {walletConnected && contractBasics ? (
          <div className="status-item">
            <span className="status-label">链上:</span>
            <span className="status-value-badge">
              nextItemId={contractBasics.nextItemId.toString()} · arbiters=
              {contractBasics.activeArbiterCount.toString()}
            </span>
          </div>
        ) : null}
        {walletConnected && currentAccount ? (
          <div className="status-item status-item-role">
            <span className="status-label">当前账号:</span>
            <span className="status-value-badge account-badge">{currentAccount.roleLabel}</span>
            <span className={`role-tag ${tradeRoleTagClass(globalRole)}`}>
              {tradeRoleLabel(globalRole)}
            </span>
          </div>
        ) : walletConnected && walletMode === 'live' ? (
          <div className="status-item status-item-role">
            <span className="status-label">当前账号:</span>
            <span className="status-value-badge account-badge">MetaMask 地址</span>
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
          onClick={() => void connectWallet()}
        >
          <WalletIcon />
          <span>{connecting ? '正在连接...' : walletConnected ? '已连接钱包' : '连接钱包'}</span>
        </button>
      </div>
    </header>
  );
}
