import { Outlet } from 'react-router-dom';
import { useDemoUI } from '../../context/useDemoUI';
import { DemoControlPanel } from '../DemoControlPanel';
import { ToastContainer } from '../Toast';
import { Sidebar } from './Sidebar';
import { TopStatusBar } from './TopStatusBar';

export function AppShell() {
  const { toasts, dismissToast } = useDemoUI();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-layout">
        <TopStatusBar />
        <DemoControlPanel />
        <Outlet />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
