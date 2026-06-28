import { useRef } from 'react';
import type { TimelineStepData } from '../types/demo';
import { calcTimelineProgress, useTimelineProgress } from '../animations/useDashboardEntrance';

export function LifecycleTimeline({ steps, activeIndex }: { steps: TimelineStepData[]; activeIndex: number }) {
  const progressRef = useRef<HTMLDivElement>(null);
  useTimelineProgress(progressRef, activeIndex, steps.length);

  return (
    <div className="timeline-card dash-animate">
      <div className="card-header-area no-border">
        <div className="card-title-group">
          <h2>订单生命周期智能合约状态机进度</h2>
          <p>对应 Solidity 状态枚举：Created, Locked, Delivered, DisputeDepositPending, Disputed, Inactive</p>
        </div>
      </div>
      <div className="timeline-container">
        <div className="timeline-line-bg" />
        <div
          ref={progressRef}
          className="timeline-line-progress"
          style={{ width: calcTimelineProgress(activeIndex, steps.length) }}
        />
        {steps.map((step, index) => (
          <div key={step.state} className={`timeline-step ${step.status}`}>
            <div className="timeline-dot">{step.status === 'completed' ? '✓' : index + 1}</div>
            <div className="timeline-label">{step.label}</div>
            <div className="timeline-desc">{step.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
