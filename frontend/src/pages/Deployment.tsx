import { useCallback, useRef, useState } from 'react';
import {
  flashButtonFeedback,
  flashCopyRow,
  useDeploymentEntrance,
} from '../animations/useDeploymentEntrance';
import { useDemoUI } from '../context/useDemoUI';
import {
  formatDeployedAt,
  getConstructorParamDisplays,
  getSepoliaDeployment,
  sepoliaAddressUrl,
  sepoliaTxUrl,
  shortAddress,
} from '../data/deployment';
import {
  getClassroomGuideSteps,
  getDemoAccounts,
  getDemoSequenceSteps,
} from '../data/mockDeployment';
import type { DemoAccountRole } from '../types/deployment';

const deployment = getSepoliaDeployment();
const constructorParams = getConstructorParamDisplays(deployment.constructorArgs);
const demoAccounts = getDemoAccounts();
const sequenceSteps = getDemoSequenceSteps();
const guideSteps = getClassroomGuideSteps();

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function roleTagClass(role: DemoAccountRole): string {
  if (role === 'seller') return 'role-seller';
  if (role === 'buyer') return 'role-buyer';
  if (role === 'arbiter') return 'role-arbiter';
  return 'role-owner';
}

function statusBadgeClass(variant: 'success' | 'primary' | 'warning'): string {
  if (variant === 'success') return 'badge badge-success';
  if (variant === 'primary') return 'badge badge-primary';
  return 'badge badge-warning';
}

export function Deployment() {
  const pageRef = useRef<HTMLElement>(null);
  const copyHintRef = useRef<HTMLParagraphElement>(null);
  const [activeTimeline, setActiveTimeline] = useState(1);
  const [activeAccountRow, setActiveAccountRow] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyHint, setCopyHint] = useState('');
  const { walletConnected, simulateDemoTx } = useDemoUI();

  useDeploymentEntrance(pageRef);

  const copyText = useCallback(async (text: string, field: string, rowEl?: HTMLElement | null) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setCopyHint(`已复制 ${shortAddress(text)}`);
      flashCopyRow(rowEl ?? null);
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
        setCopyHint('');
      }, 2000);
    } catch {
      setCopyHint('复制失败，请手动选择文本');
    }
  }, []);

  const handleCopyAddress = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      flashButtonFeedback(e.currentTarget);
      void copyText(deployment.address, 'address');
    },
    [copyText],
  );

  const handleOpenEtherscan = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    flashButtonFeedback(e.currentTarget);
    window.open(sepoliaAddressUrl(deployment.address), '_blank', 'noopener,noreferrer');
  }, []);

  const handleStartDemo = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      flashButtonFeedback(e.currentTarget);
      simulateDemoTx();
    },
    [simulateDemoTx],
  );

  return (
    <main className="content dep-card-stack" ref={pageRef}>
      <div className="page-header dep-animate">
        <h1 className="page-title">Sepolia 部署与课堂演示</h1>
        <p className="page-subtitle">
          本面板集中展示了智能合约的生产环境部署参数、沙盒测试账户、以及完整的课堂端到端状态机测试日志，供答辩演示审查。
        </p>
      </div>

      <div className="deployment-status-strip dep-animate" aria-label="部署与连接状态">
        <span className="deployment-status-pill deployed">已部署 Sepolia</span>
        <span className={`deployment-status-pill ${walletConnected ? 'network-ok' : 'wallet-warn'}`}>
          {walletConnected ? '演示钱包已连接' : '演示钱包未连接'}
        </span>
        <span className="deployment-status-pill network-ok">网络匹配: Sepolia (chainId {deployment.chainId})</span>
      </div>

      <div className="grid-two-col">
        <div className="main-card dep-animate">
          <div className="card-header-area compact">
            <div className="card-title-group">
              <h2>智能合约链上发布快照</h2>
              <p>Sepolia 测试网部署证据，地址与交易哈希可跳转 Etherscan 核对</p>
            </div>
          </div>
          <div className="dep-info-list">
            <div className="dep-info-row">
              <span className="dep-info-label">网络 / ChainId</span>
              <span className="dep-info-value">
                <span className="badge badge-primary">{deployment.network.toUpperCase()}</span>
                <span>{deployment.chainId}</span>
              </span>
            </div>
            <div className="dep-info-row">
              <span className="dep-info-label">合约代号</span>
              <span className="dep-info-value">
                <span className="badge badge-primary">{deployment.contractName}</span>
              </span>
            </div>
            <div className="dep-info-row">
              <span className="dep-info-label">合约公钥地址</span>
              <span className="dep-info-value mono">
                <a
                  className="mono-truncate"
                  href={sepoliaAddressUrl(deployment.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={deployment.address}
                >
                  {deployment.address}
                </a>
                <button
                  type="button"
                  className={`btn-copy ${copiedField === 'address' ? 'copied' : ''}`}
                  aria-label="复制合约地址"
                  onClick={handleCopyAddress}
                >
                  <CopyIcon />
                </button>
              </span>
            </div>
            <div className="dep-info-row">
              <span className="dep-info-label">部署者 (Deployer)</span>
              <span className="dep-info-value mono">
                <span className="mono-truncate" title={deployment.deployer}>
                  {deployment.deployer}
                </span>
                <button
                  type="button"
                  className={`btn-copy ${copiedField === 'deployer' ? 'copied' : ''}`}
                  aria-label="复制部署账户"
                  onClick={(e) => {
                    flashButtonFeedback(e.currentTarget);
                    void copyText(deployment.deployer, 'deployer', e.currentTarget.closest('.dep-info-row'));
                  }}
                >
                  <CopyIcon />
                </button>
              </span>
            </div>
            <div className="dep-info-row">
              <span className="dep-info-label">发布交易哈希</span>
              <span className="dep-info-value mono">
                <a
                  className="mono-truncate"
                  href={sepoliaTxUrl(deployment.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={deployment.transactionHash}
                >
                  {deployment.transactionHash}
                </a>
                <button
                  type="button"
                  className={`btn-copy ${copiedField === 'tx' ? 'copied' : ''}`}
                  aria-label="复制交易哈希"
                  onClick={(e) => {
                    flashButtonFeedback(e.currentTarget);
                    void copyText(deployment.transactionHash, 'tx', e.currentTarget.closest('.dep-info-row'));
                  }}
                >
                  <CopyIcon />
                </button>
              </span>
            </div>
            <div className="dep-info-row">
              <span className="dep-info-label">部署时间</span>
              <span className="dep-info-value">{formatDeployedAt(deployment.deployedAt)} (UTC+8)</span>
            </div>
            <div className="dep-info-row">
              <span className="dep-info-label">ABI 摘要</span>
              <span className="dep-info-value">
                {deployment.abiFunctionCount} 个公开函数 · 来源 {deployment.abiSource}
              </span>
            </div>
          </div>
        </div>

        <div className="main-card dep-animate">
          <div className="card-header-area compact">
            <div className="card-title-group">
              <h2>智能合约底层 Constructor 参数</h2>
              <p>与 deployments/sepolia/EscrowMarketplace.json 中 constructorArgs 一致</p>
            </div>
          </div>
          <div className="param-grid">
            {constructorParams.map((param) => (
              <div key={param.key} className="param-box">
                <div className="param-label">{param.key}</div>
                <div className="param-value">{param.label}: {param.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main-card dep-animate">
        <div className="card-header-area compact">
          <div className="card-title-group">
            <h2>答辩沙盒集群：演示钱包账户矩阵</h2>
            <p>课堂演示用公开测试地址，不包含私钥或助记词</p>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="demo-table">
            <thead>
              <tr>
                <th>角色 (Role)</th>
                <th>确定性公开测试地址</th>
                <th>系统核心职责与演示方法</th>
                <th>初始状态</th>
              </tr>
            </thead>
            <tbody>
              {demoAccounts.map((account, index) => (
                <tr
                  key={account.roleLabel}
                  className={activeAccountRow === index ? 'active-row' : ''}
                  onClick={() => setActiveAccountRow(index)}
                >
                  <td>
                    <span className={`role-tag ${roleTagClass(account.role)}`}>{account.roleLabel}</span>
                  </td>
                  <td className="mono-truncate" title={account.address}>
                    {account.addressShort}
                  </td>
                  <td>{account.responsibility}</td>
                  <td>
                    <span className={statusBadgeClass(account.statusVariant)}>{account.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-bottom-col">
        <div className="main-card dep-animate">
          <div className="card-header-area compact">
            <div className="card-title-group">
              <h2>课堂端到端演示步骤</h2>
              <p>覆盖连接钱包、创建商品、购买托管、交付确认、退款/纠纷、仲裁裁决、提款</p>
            </div>
          </div>
          <div className="dep-timeline-list">
            {sequenceSteps.map((step) => (
              <div
                key={step.order}
                className={`dep-timeline-item ${activeTimeline === step.order ? 'active-row' : ''}`}
                onClick={() => setActiveTimeline(step.order)}
              >
                <div className="dep-timeline-marker" />
                <div className="dep-tl-left">
                  <span className="dep-tl-event">
                    {step.order}. {step.title}
                  </span>
                  <span className="dep-tl-desc">{step.description}</span>
                  {step.txHashShort ? (
                    <span className="dep-tl-hash mono-truncate" title={step.txHash}>
                      {step.txHashShort}
                    </span>
                  ) : null}
                </div>
                <div className="dep-tl-right">
                  {step.order > 1 ? <span className="badge badge-success">Success</span> : null}
                  {step.timeLabel ? <span className="dep-tl-time">{step.timeLabel}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="main-card dep-animate">
          <div className="card-header-area compact">
            <div className="card-title-group">
              <h2>课堂答辩端到端标准演示路径指南</h2>
              <p>配合顶部【连接钱包】与【开始演示】按钮使用</p>
            </div>
          </div>
          <div className="step-list">
            {guideSteps.map((step) => (
              <div key={step.order} className="step-box">
                <div className="step-num">{step.order}</div>
                <div className="step-text">{step.text}</div>
              </div>
            ))}
          </div>

          <div className="deployment-actions">
            <button type="button" className="btn-action btn-action-secondary" onClick={handleCopyAddress}>
              复制合约地址
            </button>
            <button type="button" className="btn-action btn-action-secondary" onClick={handleOpenEtherscan}>
              打开 Etherscan
            </button>
            <button type="button" className="btn-action btn-action-primary" onClick={handleStartDemo}>
              开始演示
            </button>
          </div>
          <p className="deployment-copy-hint" ref={copyHintRef} aria-live="polite">
            {copyHint}
          </p>

          <div className="risk-card">
            <div className="risk-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="risk-text">
              <strong>答辩提防与安全红线：</strong>
              <br />
              本开源项目前端代码绝不包含、不提交任何私钥或 <code>.env</code> 隐私敏感常数文件。所有链上数据均使用
              RPC Node 统一广播，测试金额参数已做脱敏 Demo 配置，切勿在主网上运行。
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
