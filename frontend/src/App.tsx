import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DemoTradeProvider } from './context/DemoTradeContext';
import { DemoUIProvider } from './context/DemoUIContext';
import { getDashboardMock } from './data/mockDashboard';
import { Arbitration } from './pages/Arbitration';
import { Dashboard } from './pages/Dashboard';
import { Deployment } from './pages/Deployment';
import { Marketplace } from './pages/Marketplace';
import { TradeDetail } from './pages/TradeDetail';

const mock = getDashboardMock();

export default function App() {
  return (
    <DemoUIProvider initialEvents={mock.events}>
      <DemoTradeProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="trade/:id" element={<TradeDetail />} />
              <Route path="arbitration" element={<Arbitration />} />
              <Route path="deployment" element={<Deployment />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </DemoTradeProvider>
    </DemoUIProvider>
  );
}
