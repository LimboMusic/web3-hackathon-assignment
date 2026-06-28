import { useRef } from 'react';
import { useDashboardEntrance } from '../animations/useDashboardEntrance';
import { DemoTradeSnapshot } from '../components/DemoTradeSnapshot';
import { EventLog } from '../components/EventLog';
import { LifecycleTimeline } from '../components/LifecycleTimeline';
import { StatCard } from '../components/StatCard';
import { useDemoUI } from '../context/useDemoUI';
import { getDashboardMock } from '../data/mockDashboard';

const mock = getDashboardMock();

export function Dashboard() {
  const pageRef = useRef<HTMLElement>(null);
  const { events } = useDemoUI();
  useDashboardEntrance(pageRef);

  return (
    <main className="content" ref={pageRef}>
      <div className="page-header dash-animate">
        <h1 className="page-title">链上二手交易担保托管平台</h1>
        <p className="page-subtitle">
          基于智能合约的去中心化二手电商双边担保平台。买家资金锁定在托管合约中，待收到商品并确认无误后自动向卖家放款；若发生交付纠纷，系统将引入去中心化仲裁员网络，通过多方质押投票公平裁决资金归属。
        </p>
      </div>

      <div className="stats-grid">
        {mock.stats.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </div>

      <div className="dashboard-row">
        <DemoTradeSnapshot trade={mock.demoTrade} />
        <div className="main-card dash-animate">
          <div className="card-header-area compact">
            <div className="card-title-group">
              <h2>最近链上事件 (Recent Events)</h2>
              <p>实时监听智能合约 Event 抛出的链上日志</p>
            </div>
          </div>
          <EventLog events={events} />
        </div>
      </div>

      <LifecycleTimeline steps={mock.timeline} activeIndex={mock.activeStepIndex} />
    </main>
  );
}
