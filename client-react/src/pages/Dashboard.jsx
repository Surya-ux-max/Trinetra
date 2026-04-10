import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Users, Truck, Power, Wifi, WifiOff,
  Radio, Terminal, Send, Trash2, Shield, MapPin,
  Clock, CheckCircle, Activity,
} from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';
import { api } from '../utils/api';
import WavingFlag from '../components/common/WavingFlag';
import SecurityRoom from '../components/dashboard/SecurityRoom';
import CCTVWall from '../components/dashboard/CCTVWall';

function extractThreat(analysis) {
  if (!analysis) return 'LOW';
  const m = analysis.match(/THREAT_LEVEL:\s*(HIGH|MEDIUM|LOW)/i);
  return m ? m[1].toUpperCase() : 'LOW';
}

/* ── Alert item in the feed ── */
function AlertItem({ alert }) {
  const threat = alert.threat || extractThreat(alert.analysis);
  const color = { HIGH: '#ff3333', MEDIUM: '#ff8c00', LOW: '#00ff41' }[threat] || '#00ff41';
  return (
    <div className="p-2 mb-1.5 border-l-2" style={{ borderColor: color, background: 'rgba(0,0,0,0.5)' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <MapPin size={8} color="#d4af37" />
          <span className="font-mono text-[8px] text-[#d4af37] uppercase">{alert.location}</span>
          {alert.sector && <span className="font-mono text-[7px] text-[#404040]">· {alert.sector.toUpperCase()}</span>}
        </div>
        <span className="font-mono text-[7px] font-bold px-1 border" style={{ color, borderColor: color }}>{threat}</span>
      </div>
      <div className="flex items-center gap-1 mb-1">
        <Clock size={7} color="#404040" />
        <span className="font-mono text-[7px] text-[#404040]">{alert.timestamp}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {alert.objects?.map((o, i) => (
          <span key={i} className="font-mono text-[7px] px-1 border border-[#1a472a] text-[#606060] uppercase">{o}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Desk button ── */
function DeskButton({ label, color = '#1a472a', onClick, active, small }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center transition-all"
      style={{
        background: active ? `${color}33` : 'rgba(0,0,0,0.6)',
        border: `1px solid ${active ? color : '#1a1a1a'}`,
        boxShadow: active ? `0 0 8px ${color}66` : 'none',
        padding: small ? '4px 8px' : '6px 10px',
        minWidth: small ? 36 : 44,
      }}
    >
      <div style={{
        width: small ? 6 : 8, height: small ? 6 : 8,
        borderRadius: '50%',
        background: active ? color : '#1a1a1a',
        boxShadow: active ? `0 0 6px ${color}` : 'none',
        marginBottom: 3,
      }} />
      <span className="font-mono uppercase" style={{ fontSize: 6, color: active ? color : '#303030', letterSpacing: '0.1em' }}>{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, person: 0, vehicle: 0 });
  const [sectors, setSectors] = useState({
    alpha:   { active: false, progress: 0, detections: 0, status: 'STANDBY' },
    bravo:   { active: false, progress: 0, detections: 0, status: 'STANDBY' },
    charlie: { active: false, progress: 0, detections: 0, status: 'STANDBY' },
  });
  const [commands, setCommands] = useState([]);
  const [cmdInput, setCmdInput] = useState('');
  const [sending, setSending] = useState(false);
  const [time, setTime] = useState(new Date());
  const [activeButtons, setActiveButtons] = useState({ motion: true, record: true, alert: false, night: false });
  const logRef = useRef(null);

  const alertsBySector = alerts.reduce((acc, a) => {
    const s = a.sector || 'alpha';
    if (!acc[s]) acc[s] = [];
    acc[s].push(a);
    return acc;
  }, {});

  const hasHighAlert = stats.high > 0;

  useEffect(() => {
    api.getAlertHistory().then(data => {
      const valid = data.filter(a => a.analysis && !a.analysis.includes('Unable to analyze'));
      setAlerts(valid);
      const s = { total: valid.length, high: 0, person: 0, vehicle: 0 };
      valid.forEach(a => {
        const t = a.threat || extractThreat(a.analysis);
        if (t === 'HIGH') s.high++;
        if (a.objects?.includes('person')) s.person++;
        if (a.objects?.includes('vehicle')) s.vehicle++;
      });
      setStats(s);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [commands]);

  const handleWS = useCallback((data) => {
    if (data.type === 'alert') {
      setAlerts(prev => [data, ...prev]);
      setStats(prev => {
        const t = data.threat || extractThreat(data.analysis);
        return {
          total: prev.total + 1,
          high: prev.high + (t === 'HIGH' ? 1 : 0),
          person: prev.person + (data.objects?.includes('person') ? 1 : 0),
          vehicle: prev.vehicle + (data.objects?.includes('vehicle') ? 1 : 0),
        };
      });
      setActiveButtons(b => ({ ...b, alert: true }));
      setTimeout(() => setActiveButtons(b => ({ ...b, alert: false })), 5000);
    } else if (data.type === 'command') {
      setCommands(prev => [...prev, { message: data.message, sent: false }]);
    }
  }, []);

  const { isConnected } = useWebSocket(handleWS);

  const sendCommand = async () => {
    const msg = cmdInput.trim();
    if (!msg) return;
    setSending(true);
    try {
      await api.sendCommand(msg);
      setCommands(prev => [...prev, { message: msg, sent: true }]);
      setCmdInput('');
    } catch { setCommands(prev => [...prev, { message: 'TRANSMISSION FAILED', sent: false }]); }
    finally { setSending(false); }
  };

  const clearAlerts = async () => {
    await api.clearAlertHistory();
    setAlerts([]);
    setStats({ total: 0, high: 0, person: 0, vehicle: 0 });
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">

      {/* ── 3D Room ── */}
      <SecurityRoom hasAlert={hasHighAlert} />

      {/* ── UI overlay ── */}
      <div className="absolute inset-0 z-10 flex flex-col" style={{ pointerEvents: 'none' }}>

        {/* ════════════════════════════════════════════
            SCREEN AREA — top 62% of viewport
            Positioned to sit inside the 3D bezel
        ════════════════════════════════════════════ */}
        <div
          className="flex flex-col"
          style={{
            height: '62vh',
            pointerEvents: 'all',
            padding: '0 4vw',
            paddingTop: '1vh',
          }}
        >
          {/* Screen top bar */}
          <div
            className="flex items-center justify-between px-3 py-1.5 mb-1"
            style={{ background: 'rgba(0,5,0,0.92)', borderBottom: '1px solid #0d2a0d' }}
          >
            <div className="flex items-center gap-3">
              <WavingFlag width={36} height={24} />
              <div>
                <div className="font-mono text-[10px] font-bold tracking-[4px] text-[#d4af37]">TRINETRA</div>
                <div className="font-mono text-[6px] text-[#2a2a2a] uppercase tracking-[2px]">BORDER SURVEILLANCE SYSTEM</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {hasHighAlert && (
                <div className="flex items-center gap-1 px-2 py-0.5 border border-[#ff0000] animate-pulse" style={{ background: 'rgba(255,0,0,0.1)' }}>
                  <AlertTriangle size={8} color="#ff0000" />
                  <span className="font-mono text-[7px] text-[#ff0000] uppercase tracking-widest">THREAT DETECTED</span>
                </div>
              )}
              <div className="font-mono text-lg font-bold text-[#d4af37] tracking-[4px]">
                {time.toLocaleTimeString('en-IN', { hour12: false })}
              </div>
              <div className="flex items-center gap-1.5">
                {isConnected
                  ? <><Wifi size={9} color="#00ff41" /><span className="font-mono text-[7px] text-[#00ff41]">LIVE</span></>
                  : <><WifiOff size={9} color="#606060" /><span className="font-mono text-[7px] text-[#606060]">OFFLINE</span></>
                }
              </div>
              <Link
                to="/"
                className="flex items-center gap-1 px-2 py-0.5 border border-[#1a472a] font-mono text-[7px] text-[#d4af37] uppercase tracking-widest hover:bg-[#1a472a]/30 transition-colors"
                style={{ pointerEvents: 'all' }}
              >
                <Power size={7} /> LOGOUT
              </Link>
            </div>
          </div>

          {/* CCTV Wall — fills the screen */}
          <div className="flex-1 overflow-hidden" style={{ background: 'rgba(0,3,0,0.95)' }}>
            <CCTVWall
              sectors={sectors}
              onSectorChange={(id, s) => setSectors(prev => ({ ...prev, [id]: s }))}
              alertsBySector={alertsBySector}
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════
            DESK AREA — bottom 38% of viewport
            Looks like the desk surface with controls
        ════════════════════════════════════════════ */}
        <div
          className="flex gap-2 px-4 pt-2 pb-3"
          style={{
            height: '38vh',
            pointerEvents: 'all',
            background: 'linear-gradient(to bottom, rgba(0,8,0,0.7) 0%, rgba(0,4,0,0.9) 100%)',
            borderTop: '1px solid #0d2a0d',
          }}
        >
          {/* ── LEFT DESK PANEL: Stats + Buttons ── */}
          <div className="flex flex-col gap-2" style={{ width: '18%' }}>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-1 flex-1">
              {[
                { icon: Activity,      label: 'ALERTS',   value: stats.total,   color: '#d4af37' },
                { icon: AlertTriangle, label: 'HIGH',     value: stats.high,    color: '#ff3333' },
                { icon: Users,         label: 'PERSONS',  value: stats.person,  color: '#ff8c00' },
                { icon: Truck,         label: 'VEHICLES', value: stats.vehicle, color: '#4682b4' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex flex-col items-center justify-center border" style={{ background: 'rgba(0,0,0,0.6)', borderColor: color + '33' }}>
                  <Icon size={10} style={{ color }} />
                  <div className="font-mono font-bold text-base leading-none mt-0.5" style={{ color }}>{value}</div>
                  <div className="font-mono text-[6px] text-[#303030] uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Physical-style buttons */}
            <div className="grid grid-cols-2 gap-1">
              <DeskButton label="MOTION" color="#00ff41" active={activeButtons.motion} onClick={() => setActiveButtons(b => ({ ...b, motion: !b.motion }))} />
              <DeskButton label="RECORD" color="#ff3333" active={activeButtons.record} onClick={() => setActiveButtons(b => ({ ...b, record: !b.record }))} />
              <DeskButton label="ALERT"  color="#ff8c00" active={activeButtons.alert}  onClick={() => setActiveButtons(b => ({ ...b, alert: !b.alert }))} />
              <DeskButton label="NIGHT"  color="#4682b4" active={activeButtons.night}  onClick={() => setActiveButtons(b => ({ ...b, night: !b.night }))} />
            </div>
          </div>

          {/* ── CENTER DESK PANEL: Alert Feed ── */}
          <div className="flex flex-col border border-[#0d2a0d]" style={{ flex: 1, background: 'rgba(0,0,0,0.65)' }}>
            <div className="flex items-center justify-between px-2 py-1 border-b border-[#0d2a0d]">
              <div className="flex items-center gap-1.5">
                <Radio size={9} color="#d4af37" />
                <span className="font-mono text-[8px] text-[#d4af37] uppercase tracking-widest">ALERT FEED</span>
                <span className="font-mono text-[7px] text-[#303030]">({alerts.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="status-indicator status-active" style={{ width: 5, height: 5 }} />
                {alerts.length > 0 && (
                  <button onClick={clearAlerts} className="flex items-center gap-0.5 font-mono text-[6px] px-1 py-0.5 border border-[#1a1a1a] text-[#404040] hover:border-[#d4af37] hover:text-[#d4af37] transition-colors uppercase">
                    <Trash2 size={7} /> CLR
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Shield size={16} color="#0d2a0d" className="mb-1" />
                  <span className="font-mono text-[7px] text-[#1a1a1a] uppercase tracking-widest">AWAITING DATA</span>
                </div>
              ) : (
                alerts.map((a, i) => <AlertItem key={`${a.timestamp}-${i}`} alert={a} />)
              )}
            </div>
          </div>

          {/* ── RIGHT DESK PANEL: Command + System ── */}
          <div className="flex flex-col gap-2" style={{ width: '28%' }}>
            {/* Command terminal */}
            <div className="flex flex-col border border-[#0d2a0d]" style={{ flex: 1, background: 'rgba(0,0,0,0.65)' }}>
              <div className="flex items-center gap-1.5 px-2 py-1 border-b border-[#0d2a0d]">
                <Terminal size={8} color="#d4af37" />
                <span className="font-mono text-[8px] text-[#d4af37] uppercase tracking-widest">COMMAND</span>
              </div>
              <div ref={logRef} className="flex-1 overflow-y-auto p-1.5 space-y-1">
                {commands.length === 0
                  ? <div className="font-mono text-[7px] text-[#1a1a1a] text-center py-2 uppercase">No commands</div>
                  : commands.map((c, i) => (
                    <div key={i} className="font-mono text-[7px] p-1 border border-[#0d1a0d]" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <span className={c.sent ? 'text-[#d4af37]' : 'text-[#404040]'}>
                        {c.sent ? '▶ ' : '◀ '}{c.message}
                      </span>
                    </div>
                  ))
                }
              </div>
              <div className="flex gap-1 p-1.5 border-t border-[#0d2a0d]">
                <input
                  value={cmdInput}
                  onChange={e => setCmdInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendCommand()}
                  placeholder="ENTER COMMAND..."
                  className="flex-1 font-mono text-[8px] px-1.5 py-1 bg-black border border-[#1a472a] text-[#d4af37] outline-none placeholder:text-[#1a1a1a]"
                />
                <button onClick={sendCommand} disabled={!cmdInput.trim() || sending}
                  className="px-2 border border-[#1a472a] text-[#d4af37] hover:bg-[#1a472a]/30 disabled:opacity-30 transition-colors">
                  <Send size={8} />
                </button>
              </div>
            </div>

            {/* System status mini */}
            <div className="border border-[#0d2a0d] p-2" style={{ background: 'rgba(0,0,0,0.65)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[7px] text-[#d4af37] uppercase tracking-widest">SYSTEM</span>
                <div className="flex items-center gap-1">
                  <div className="status-indicator status-active" style={{ width: 5, height: 5 }} />
                  <span className="font-mono text-[6px] text-[#00ff41]">ONLINE</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {[
                  ['YOLO', 'v8s'],
                  ['RTSP', 'READY'],
                  ['REDIS', 'OK'],
                  ['NTFY', 'ACTIVE'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="font-mono text-[6px] text-[#303030] uppercase">{k}</span>
                    <span className="font-mono text-[6px] text-[#d4af37] uppercase">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
