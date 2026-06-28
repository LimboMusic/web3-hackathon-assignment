import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: '总览 Dashboard', end: true },
  { to: '/marketplace', label: '交易市场 Marketplace', end: false },
  { to: '/trade/1', label: '交易详情 Trade Detail', end: false },
  { to: '/arbitration', label: '仲裁中心 Arbitration', end: false },
  { to: '/deployment', label: '部署演示 Deployment', end: false },
];

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function isActive(pathname: string, to: string, end: boolean) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <ShieldIcon />
          <span>Escrow Market</span>
        </div>
        <div className="brand-subtitle">链上二手交易担保系统</div>
      </div>
      <ul className="sidebar-menu">
        {navItems.map((item) => (
          <li key={item.to} className={`menu-item ${isActive(pathname, item.to, item.end) ? 'active' : ''}`}>
            <NavLink to={item.to} end={item.end}>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
