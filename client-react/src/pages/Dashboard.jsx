import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Radio, Shield, Users, AlertTriangle, Power, Wifi, WifiOff, Truck } from 'lucide-react';
import Ticker from '../components/common/Ticker';
import WavingFlag from '../components/common/WavingFlag';
import useWebSocket from '../hooks/useWebSocket';
import { api } from '../utils/api';
import StatCard from '../components/dashboard/StatCard';
import AlertFeed from '../components/dashboard/AlertFeed';
import SectorPanel from '../components/dashboard/SectorPanel';
import SystemStatus from '../components/dashboard/SystemStatus';
import CommandPanel from '../components/dashboard/CommandPanel';

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, person: 0, vehicle: 0 });
  const [sectors, setSectors] = useState({
    alpha: { active: false, progress: 0, detections: 0, status: 'STANDBY' },
    bravo: { active: false, progress: 0, detections: 0, status: 'STANDBY' },
    charlie: { active: false, progress: 0, detections: 0, status: 'STANDBY' },
  });
  const [commands, setCommands] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    api
      .getAlertHistory()
      .then((data) => {
        const validAlerts = data.filter((a) => a.analysis && !a.analysis.includes('Unable to analyze'));
        setAlerts(validAlerts);

        const newStats = { total: validAlerts.length, high: 0, person: 0, vehicle: 0 };
        validAlerts.forEach((alert) => {
          const threat = alert.threat || extractThreat(alert.analysis);
          if (threat === 'HIGH') newStats.high++;
          if (alert.objects?.includes('person')) newStats.person++;
          if (alert.objects?.includes('vehicle')) newStats.vehicle++;
        });
        setStats(newStats);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'alert') {
      setAlerts((prev) => [data, ...prev]);
      setStats((prev) => {
        const threat = data.threat || extractThreat(data.analysis);
        return {
          total: prev.total + 1,
          high: prev.high + (threat === 'HIGH' ? 1 : 0),
          person: prev.person + (data.objects?.includes('person') ? 1 : 0),
          vehicle: prev.vehicle + (data.objects?.includes('vehicle') ? 1 : 0),
        };
      });
    } else if (data.type === 'command') {
      setCommands((prev) => [...prev, { message: data.message, sent: false }]);
    }
  }, []);

  const { isConnected } = useWebSocket(handleWebSocketMessage);

  const extractThreat = (analysis) => {
    if (!analysis) return 'LOW';
    const match = analysis.match(/THREAT_LEVEL:\s*(HIGH|MEDIUM|LOW)/i);
    return match ? match[1].toUpperCase() : 'LOW';
  };

  return (
    <div className="min-h-screen grid-tactical">
      {/* Top Bar */}
      <div className="z1 bg-black border-b-2 border-[#1a472a]">
        <Ticker />
        
        {/* Command Bar */}
        <div className="px-6 py-3 flex items-center justify-between bg-gradient-to-r from-black via-[#0d0d0d] to-black">
          {/* Left: Branding */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-[40px] bg-gradient-to-b from-[#d4af37] to-[#1a472a]"></div>
              <WavingFlag width={60} height={40} />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-[3px] text-[#d4af37] text-shadow-glow">
                TRINETRA
              </div>
              <div className="font-mono text-[9px] text-[#808080] uppercase tracking-[2px]">
                TACTICAL COMMAND CENTER
              </div>
            </div>
          </div>

          {/* Center: Time & Location */}
          <div className="hidden md:block text-center">
            <div className="font-display text-2xl tracking-[4px] text-[#d4af37] font-bold">
              {time.toLocaleTimeString('en-IN', { hour12: false })}
            </div>
            <div className="font-mono text-[9px] text-[#808080] uppercase tracking-[2px] mt-1">
              IST · BORDER POST ALPHA · SECTOR COMMAND
            </div>
          </div>

          {/* Right: Status & Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 panel-tactical">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-[#00ff00]" />
                  <div className="status-indicator status-active"></div>
                  <span className="font-mono text-[10px] text-[#00ff00] uppercase tracking-[1px] font-semibold">
                    LIVE
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-[#808080]" />
                  <span className="font-mono text-[10px] text-[#808080] uppercase tracking-[1px]">
                    CONNECTING
                  </span>
                </>
              )}
            </div>

            <Link to="/" className="btn-tactical flex items-center gap-2">
              <Power className="w-3 h-3" />
              LOGOUT
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="z1 max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Left Column - Stats & Alerts */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={Activity}
              label="TOTAL ALERTS"
              value={stats.total}
              color="default"
            />
            <StatCard
              icon={AlertTriangle}
              label="HIGH THREAT"
              value={stats.high}
              color="danger"
            />
            <StatCard
              icon={Users}
              label="PERSONS"
              value={stats.person}
              color="warning"
            />
            <StatCard
              icon={Truck}
              label="VEHICLES"
              value={stats.vehicle}
              color="info"
            />
          </div>

          {/* Alert Feed */}
          <AlertFeed alerts={alerts} onClear={() => { setAlerts([]); setStats({ total: 0, high: 0, person: 0, vehicle: 0 }); }} />
        </div>

        {/* Right Column - Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Sector Controls */}
          <div className="panel-tactical">
            <div className="panel-header">
              <div className="panel-title">SECTOR OPERATIONS</div>
              <Radio className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="p-4 space-y-4">
              <SectorPanel
                sectorId="alpha"
                title="ALPHA"
                subtitle="North Border"
                state={sectors.alpha}
                onStateChange={(newState) => setSectors((prev) => ({ ...prev, alpha: newState }))}
              />
              <SectorPanel
                sectorId="bravo"
                title="BRAVO"
                subtitle="East Perimeter"
                state={sectors.bravo}
                onStateChange={(newState) => setSectors((prev) => ({ ...prev, bravo: newState }))}
              />
              <SectorPanel
                sectorId="charlie"
                title="CHARLIE"
                subtitle="South Gate"
                state={sectors.charlie}
                onStateChange={(newState) => setSectors((prev) => ({ ...prev, charlie: newState }))}
              />
            </div>
          </div>

          {/* System Status */}
          <SystemStatus />

          {/* Command Panel */}
          <CommandPanel
            commands={commands}
            onCommandSent={(cmd) => setCommands((prev) => [...prev, { message: cmd, sent: true }])}
          />

          {/* Classification */}
          <div className="panel-tactical p-4 text-center">
            <div className="badge-alert mb-2">TOP SECRET / SCI</div>
            <p className="font-mono text-[9px] text-[#808080] uppercase tracking-[1px] leading-relaxed">
              NUCLEAR COMMAND AUTHORITY
              <br />
              UNAUTHORIZED ACCESS PUNISHABLE UNDER IT ACT 2000
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
