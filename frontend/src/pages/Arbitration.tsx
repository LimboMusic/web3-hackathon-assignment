import { useCallback, useMemo, useRef, useState } from 'react';
import {
  animateVoteProgress,
  highlightArbiterRow,
  pulseVerdictCard,
  useArbitrationEntrance,
} from '../animations/useArbitrationAnimation';
import { useDemoTrade } from '../context/useDemoTrade';
import { useDemoUI } from '../context/useDemoUI';
import { DEMO_BUYER_FULL, DEMO_SELLER_FULL } from '../data/demoAccounts';
import type { ArbitrationLogEntry, ArbiterSeat, VerdictStatus, VoteSide } from '../types/arbitration';
import { addressesEqual } from '../utils/walletMatch';

function verdictLabel(verdict: VerdictStatus): string {
  if (verdict === 'buyer_wins') return '裁决完成：支持买家退款';
  if (verdict === 'seller_wins') return '裁决完成：支持卖家放款';
  return '投票进行中';
}

function voteLabel(vote: VoteSide): string {
  if (vote === 'buyer') return '支持买家退款';
  if (vote === 'seller') return '支持卖家放款';
  return '未投票';
}

function rewardLabel(status: ArbiterSeat['rewardStatus']): string {
  if (status === 'majority') return '多数票奖励';
  if (status === 'minority') return '少数票无奖励';
  if (status === 'pending') return '待裁决';
  return '—';
}

type MatchStatus = 'pending_tally' | 'absent' | 'aligned' | 'misaligned';

function deriveMatchStatus(arb: ArbiterSeat, verdict: VerdictStatus): MatchStatus {
  if (!arb.hasVoted) return 'absent';
  if (verdict === 'voting') return 'pending_tally';
  const winningSide: VoteSide = verdict === 'buyer_wins' ? 'buyer' : 'seller';
  return arb.vote === winningSide ? 'aligned' : 'misaligned';
}

function matchStatusLabel(arb: ArbiterSeat, verdict: VerdictStatus): string {
  const status = deriveMatchStatus(arb, verdict);
  if (status === 'pending_tally') return '待计票';
  if (status === 'absent') return '未参与';
  if (status === 'aligned') return '与多数一致';
  return '与少数一致';
}

function matchStatusClass(arb: ArbiterSeat, verdict: VerdictStatus): string {
  const status = deriveMatchStatus(arb, verdict);
  if (status === 'pending_tally') return 'capsule capsule-neutral';
  if (status === 'absent') return 'capsule capsule-muted';
  if (status === 'aligned') return 'capsule capsule-success';
  return 'capsule capsule-warning';
}

export function Arbitration() {
  const pageRef = useRef<HTMLElement>(null);
  const buyerBarRef = useRef<HTMLDivElement>(null);
  const sellerBarRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);

  const { walletConnected, walletAddressFull, currentAccount } = useDemoUI();
  const { arbitrationCase, arbitrationLogs, updateArbitrationCase, appendArbitrationLog } = useDemoTrade();

  const caseData = arbitrationCase;
  const logs = arbitrationLogs;

  const [feedback, setFeedback] = useState('');
  const [voting, setVoting] = useState(false);

  useArbitrationEntrance(pageRef);

  const finalized = caseData.verdict !== 'voting';

  const matchedArbiter = useMemo(
    () => caseData.arbiters.find((a) => addressesEqual(a.address, walletAddressFull)),
    [caseData.arbiters, walletAddressFull],
  );

  const isTradeParty =
    walletConnected &&
    (addressesEqual(walletAddressFull, DEMO_SELLER_FULL) ||
      addressesEqual(walletAddressFull, DEMO_BUYER_FULL));

  const isArbiterAccount = currentAccount?.kind === 'arbiter';

  const voteDisabled =
    !walletConnected ||
    !isArbiterAccount ||
    !matchedArbiter ||
    isTradeParty ||
    finalized ||
    voting ||
    !matchedArbiter.staked ||
    matchedArbiter.hasVoted;

  const showVoteBlockFeedback = useCallback(() => {
    if (!walletConnected) {
      setFeedback('请先连接钱包或在演示控制台选择仲裁员账号');
      return;
    }
    if (!isArbiterAccount || !matchedArbiter) {
      setFeedback('当前 Demo 账号不是本案仲裁员席位');
      return;
    }
    if (isTradeParty) {
      setFeedback('买卖双方不能担任自己交易的仲裁员');
      return;
    }
    if (finalized) {
      setFeedback('裁决已完成，无法继续投票');
      return;
    }
    if (voting) {
      setFeedback('投票处理中，请稍候');
      return;
    }
    if (!matchedArbiter.staked) {
      setFeedback('该仲裁员尚未质押保证金，无法投票');
      return;
    }
    if (matchedArbiter.hasVoted) {
      setFeedback('同一仲裁员对本案只能投票一次');
    }
  }, [walletConnected, isArbiterAccount, matchedArbiter, isTradeParty, finalized, voting]);

  const finalizeIfNeeded = useCallback(
    (buyerVotes: number, sellerVotes: number): VerdictStatus => {
      if (buyerVotes >= caseData.threshold) return 'buyer_wins';
      if (sellerVotes >= caseData.threshold) return 'seller_wins';
      return 'voting';
    },
    [caseData.threshold],
  );

  const applyRewards = useCallback((verdict: VerdictStatus, arbiters: ArbiterSeat[]): ArbiterSeat[] => {
    if (verdict === 'voting') return arbiters;
    const winningSide: VoteSide = verdict === 'buyer_wins' ? 'buyer' : 'seller';
    return arbiters.map((arb) => {
      if (!arb.hasVoted) return { ...arb, rewardStatus: 'none' as const };
      if (arb.vote === winningSide) return { ...arb, rewardStatus: 'majority' as const };
      return { ...arb, rewardStatus: 'minority' as const };
    });
  }, []);

  const handleVote = useCallback(
    (side: VoteSide) => {
      if (!matchedArbiter) {
        showVoteBlockFeedback();
        return;
      }
      if (voteDisabled) {
        showVoteBlockFeedback();
        return;
      }

      setVoting(true);
      setFeedback(`正在模拟 voteDispute()：${side === 'buyer' ? '支持买家退款' : '支持卖家放款'}...`);

      window.setTimeout(() => {
        updateArbitrationCase((prev) => {
          const buyerVotes = prev.buyerVotes + (side === 'buyer' ? 1 : 0);
          const sellerVotes = prev.sellerVotes + (side === 'seller' ? 1 : 0);
          const arbiters = prev.arbiters.map((arb) =>
            arb.id === matchedArbiter.id
              ? { ...arb, hasVoted: true, vote: side, locked: true }
              : arb,
          );
          const verdict = finalizeIfNeeded(buyerVotes, sellerVotes);
          const withRewards = applyRewards(verdict, arbiters);

          animateVoteProgress(
            buyerBarRef.current,
            Math.min(100, Math.round((buyerVotes / prev.threshold) * 100)),
          );
          animateVoteProgress(
            sellerBarRef.current,
            Math.min(100, Math.round((sellerVotes / prev.threshold) * 100)),
          );

          if (verdict !== 'voting') {
            const logEntry: ArbitrationLogEntry = {
              id: `alog-${Date.now()}`,
              time: '刚刚',
              event: 'DisputeResolved',
              description:
                verdict === 'buyer_wins'
                  ? '达到 2/3 多数，主交易金额退还给买家，败诉方押金奖励多数票仲裁员'
                  : '达到 2/3 多数，主交易金额放款给卖家，败诉方押金奖励多数票仲裁员',
            };
            appendArbitrationLog(logEntry);
            setFeedback(verdictLabel(verdict));
            window.setTimeout(() => pulseVerdictCard(verdictRef.current), 50);
          } else {
            appendArbitrationLog({
              id: `alog-${Date.now()}`,
              time: '刚刚',
              event: 'VoteSubmitted',
              description: `${matchedArbiter.name} 投票：${voteLabel(side)}`,
            });
            setFeedback('投票已提交，等待其他仲裁员');
          }

          const row = pageRef.current?.querySelector(`[data-arbiter-id="${matchedArbiter.id}"]`);
          highlightArbiterRow(row as HTMLElement | null);

          return {
            ...prev,
            buyerVotes,
            sellerVotes,
            verdict,
            arbiters: withRewards,
          };
        });
        setVoting(false);
      }, 800);
    },
    [
      matchedArbiter,
      voteDisabled,
      showVoteBlockFeedback,
      finalizeIfNeeded,
      applyRewards,
      appendArbitrationLog,
      updateArbitrationCase,
    ],
  );

  const handleStakeToggle = useCallback(() => {
    if (!matchedArbiter) {
      setFeedback('请切换至仲裁员 Demo 账号');
      return;
    }
    if (matchedArbiter.locked) {
      setFeedback('投票后质押锁定，演示期间不可退出');
      return;
    }
    updateArbitrationCase((prev) => ({
      ...prev,
      arbiters: prev.arbiters.map((arb) =>
        arb.id === matchedArbiter.id ? { ...arb, staked: !arb.staked } : arb,
      ),
    }));
    setFeedback(matchedArbiter.staked ? '已模拟退出质押（仅未投票席位）' : '已模拟质押 0.1 ETH，获得投票资格');
  }, [matchedArbiter, updateArbitrationCase]);

  const buyerPercent = useMemo(
    () => Math.round((caseData.buyerVotes / caseData.threshold) * 100),
    [caseData.buyerVotes, caseData.threshold],
  );
  const sellerPercent = useMemo(
    () => Math.round((caseData.sellerVotes / caseData.threshold) * 100),
    [caseData.sellerVotes, caseData.threshold],
  );

  return (
    <main className="content arbitration-page" ref={pageRef}>
      <div className="page-header arb-animate">
        <h1 className="page-title">仲裁中心</h1>
        <p className="page-subtitle">
          仲裁员身份由当前 Demo 账号地址决定；需先质押保证金才可 voteDispute()。
        </p>
      </div>

      <div className="main-card arb-animate">
        <div className="dispute-summary">
          <div className="summary-main">
            <h2>纠纷 #{caseData.disputeId} · {caseData.itemTitle}</h2>
            <p>合约状态 Disputed · 商品 ID #{caseData.itemId}</p>
          </div>
          <span className="capsule capsule-danger">
            <span className="capsule-dot" />
            {finalized ? '已裁决' : '投票进行中'}
          </span>
        </div>
        <div className="summary-grid arb-summary-grid">
          <div className="grid-item">
            <span className="grid-label">证据哈希</span>
            <span className="grid-val hash-break" title={caseData.evidenceHash}>{caseData.evidenceHash}</span>
          </div>
          <div className="grid-item">
            <span className="grid-label">纠纷押金</span>
            <span className="grid-val">
              买家 {caseData.buyerDepositPaid ? '已付' : '未付'} / 卖家 {caseData.sellerDepositPaid ? '已付' : '未付'}
            </span>
          </div>
          <div className="grid-item">
            <span className="grid-label">投票阈值</span>
            <span className="grid-val">{caseData.threshold} / {caseData.totalArbiters}（2/3 多数）</span>
          </div>
          <div className="grid-item">
            <span className="grid-label">当前账号席位</span>
            <span className="grid-val">
              {matchedArbiter
                ? `${matchedArbiter.name} (${matchedArbiter.addressShort})`
                : currentAccount
                  ? `${currentAccount.roleLabel} — 非本案仲裁员`
                  : '未连接'}
            </span>
          </div>
        </div>
      </div>

      {feedback ? (
        <p className="page-feedback arb-animate" aria-live="polite">{feedback}</p>
      ) : null}

      <div className="results-grid arb-animate">
        <div className="main-card progress-block">
          <h3 className="section-title">投票进度</h3>
          <div className="progress-wrapper">
            <div className="progress-labels">
              <span>支持买家退款</span>
              <span>{caseData.buyerVotes} 票</span>
            </div>
            <div className="progress-bar-bg">
              <div ref={buyerBarRef} className="progress-bar-fill fill-buyer" style={{ width: `${buyerPercent}%` }} />
            </div>
          </div>
          <div className="progress-wrapper">
            <div className="progress-labels">
              <span>支持卖家放款</span>
              <span>{caseData.sellerVotes} 票</span>
            </div>
            <div className="progress-bar-bg">
              <div ref={sellerBarRef} className="progress-bar-fill fill-seller" style={{ width: `${sellerPercent}%` }} />
            </div>
          </div>
          <p className="vote-rule-note">
            败诉方纠纷押金将奖励投给多数票方向的仲裁员；少数票与未投票席位在裁决后区分展示。
          </p>
        </div>

        <div className="verdict-card arb-animate" ref={verdictRef}>
          <span className="verdict-title">当前裁决状态</span>
          <span className="verdict-value">{verdictLabel(caseData.verdict)}</span>
        </div>
      </div>

      <div className="three-column-grid arb-columns arb-animate">
        <div className="main-card">
          <h3 className="section-title">证据摘要</h3>
          <div className="evidence-box">
            <p className="evidence-label">链上证据哈希</p>
            <p className="hash-text hash-break">{caseData.evidenceHash}</p>
            <p className="evidence-note">买卖双方不可作为自己交易的仲裁员（回避规则演示说明）。</p>
          </div>
        </div>

        <div className="main-card voting-stage">
          <h3 className="section-title">voteDispute() 投票</h3>
          {matchedArbiter ? (
            <p className="arb-seat-indicator">
              当前席位：<strong>{matchedArbiter.name}</strong> · {matchedArbiter.addressShort}
            </p>
          ) : (
            <p className="permission-reason">
              请在演示控制台切换至仲裁员 A/B/C 账号后再投票。
            </p>
          )}
          <div className="vote-btn-wrap" onClick={() => voteDisabled && showVoteBlockFeedback()}>
            <button
              type="button"
              className="btn-vote btn-vote-buyer"
              disabled={voteDisabled}
              style={voteDisabled ? { pointerEvents: 'none' } : undefined}
              onClick={() => handleVote('buyer')}
            >
              支持买家退款
            </button>
          </div>
          <div className="vote-btn-wrap" onClick={() => voteDisabled && showVoteBlockFeedback()}>
            <button
              type="button"
              className="btn-vote btn-vote-seller"
              disabled={voteDisabled}
              style={voteDisabled ? { pointerEvents: 'none' } : undefined}
              onClick={() => handleVote('seller')}
            >
              支持卖家放款
            </button>
          </div>
          <p className="vote-desc">
            需先质押 0.1 ETH 保证金；每个仲裁员每笔纠纷只能投票一次；达到 {caseData.threshold} 票后 finalized 并禁用继续投票。
          </p>
        </div>

        <div className="main-card">
          <h3 className="section-title">席位质押管理</h3>
          <div className="stake-status">
            <span>当前席位：{matchedArbiter?.name ?? '—'}</span>
            <span>质押状态：{matchedArbiter?.staked ? '已质押 0.1 ETH' : '未质押'}</span>
            <span>投票状态：{matchedArbiter?.hasVoted ? voteLabel(matchedArbiter.vote) : '未投票'}</span>
            <span>退出限制：投票后锁定至裁决完成</span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            disabled={!matchedArbiter || matchedArbiter.locked}
            onClick={handleStakeToggle}
          >
            {matchedArbiter?.staked ? '模拟退出质押' : '模拟质押 0.1 ETH'}
          </button>
        </div>
      </div>

      <div className="main-card arb-animate">
        <h3 className="section-title">仲裁员明细</h3>
        <div className="table-wrap">
          <table className="arbitrator-table">
            <thead>
              <tr>
                <th>仲裁员</th>
                <th>地址</th>
                <th>质押</th>
                <th>投票方向</th>
                <th>合流状态</th>
                <th>奖励状态</th>
              </tr>
            </thead>
            <tbody>
              {caseData.arbiters.map((arb) => (
                <tr
                  key={arb.id}
                  data-arbiter-id={arb.id}
                  className={matchedArbiter?.id === arb.id ? 'arbiter-row-active' : undefined}
                >
                  <td>{arb.name}</td>
                  <td className="addr-col mono-truncate" title={arb.address}>{arb.addressShort}</td>
                  <td>{arb.staked ? '已质押' : '未质押'}</td>
                  <td>{arb.hasVoted ? voteLabel(arb.vote) : '未投票'}</td>
                  <td>
                    <span className={matchStatusClass(arb, caseData.verdict)}>
                      {matchStatusLabel(arb, caseData.verdict)}
                    </span>
                  </td>
                  <td>{rewardLabel(arb.rewardStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="main-card arb-animate">
        <h3 className="section-title">仲裁日志</h3>
        <div className="logs-box">
          {logs.map((log) => (
            <div key={log.id} className="log-row">
              <span className="log-time">{log.time}</span>
              <span className="log-event">{log.event}</span>
              <span className="log-desc">{log.description}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
