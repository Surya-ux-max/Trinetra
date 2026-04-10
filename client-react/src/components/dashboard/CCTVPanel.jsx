import { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, WifiOff } from 'lucide-react';
import { api, LIVE_FEED_URL } from '../../utils/api';

const SECTOR_META = {
  alpha:   { label: 'CAM-01', location: 'NORTH BORDER',    id: 'ALPHA' },
  bravo:   { label: 'CAM-02', location: 'EAST PERIMETER',  id: 'BRAVO' },
  charlie: { label: 'CAM-03', location: 'SOUTH GATE',      id: 'CHARLIE' },
};

function useBlink(active, interval = 800) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setOn(v => !v), interval);
    return () => clearInterval(t);
  }, [active, interval]);
  return on;
}

export default function CCTVPanel({ sectorId, state, onStateChange, latestAlert, expanded, onExpand }) {
  const [streamUrl, setStreamUrl] = useState('');
  const [showInput, setShowInput] = useState(false);
  const meta = SECTOR_META[sectorId];
  const isLive = state.status === 'LIVE';
  const threat = latestAlert?.threat || 'NONE';
  const recBlink = useBlink(isLive);

  const threatColor = {
    HIGH:   '#ff0000',
    MEDIUM: '#ff8c00',
    LOW:    '#00ff41',
    NONE:   '#1a472a',
  }[threat] || '#1a472a';

  const handleStart = async () => {
    if (!streamUrl.trim()) return;
    onStateChange({ ...state, active: true, status: 'LIVE' });
    setShowInput(false);
    try {
      const r = await api.startStream(sectorId, streamUrl.trim());
      if (r.status !== 'started') onStateChange({ ...state, active: false, status: 'ERROR' });
    } catch {
      onStateChange({ ...state, active: false, status: 'ERROR' });
    }
  };

  const handleStop = async () => {
    await api.stopStream(sectorId);
    onStateChange({ active: false, progress: 0, detections: 0, status: 'STANDBY' });
  };

  return (
    <div
      className="relative flex flex-col"
      style={{
        background: '#000',
        border: `1px solid ${threatColor}`,
        boxShadow: `0 0 ${threat === 'HIGH' ? '20px' : '6px'} ${threatColor}44`,
        transition: 'box-shadow 0.4s, border-color 0.4s',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-2 py-1" style={{ background: '#050f05', borderBottom: `1px solid ${threatColor}33` }}>
        <div className="flex items-center gap-2">
          {/* REC indicator */}
          <div className="flex items-center gap-1">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isLive && recBlink ? '#ff0000' : '#333' }} />
            <span className="font-mono text-[8px] text-[#808080]">{isLive ? 'REC' : 'OFF'}</span>
          </div>
          <span className="font-mono text-[9px] font-bold" style={{ color: '#d4af37' }}>{meta.label}</span>
          <span className="font-mono text-[8px] text-[#606060]">{meta.location}</span>
        </div>
        <div className="flex items-center gap-2">
          {threat !== 'NONE' && (
            <span className="font-mono text-[8px] font-bold px-1" style={{ color: threatColor, border: `1px solid ${threatColor}` }}>
              {threat}
            </span>
          )}
          <span className="font-mono text-[8px] text-[#404040]">{meta.id}</span>
          <button onClick={onExpand} className="text-[#404040] hover:text-[#d4af37] transition-colors">
            {expanded ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
          </button>
        </div>
      </div>

      {/* Feed area */}
      <div className="relative flex-1 overflow-hidden" style={{ aspectRatio: expanded ? 'auto' : '16/9', minHeight: expanded ? 300 : 0 }}>
        {isLive ? (
          <>
            <img
              src={LIVE_FEED_URL(sectorId)}
              alt={`${sectorId} feed`}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.9) contrast(1.1)' }}
            />
            {/* CRT scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
            }} />
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)',
            }} />
            {/* Threat flash overlay */}
            {threat === 'HIGH' && (
              <div className="absolute inset-0 pointer-events-none animate-pulse" style={{ background: 'rgba(255,0,0,0.06)' }} />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: '#020802', aspectRatio: '16/9' }}>
            {/* No signal pattern */}
            <div className="w-full h-full absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #0a0a0a 0px, #0a0a0a 2px, #050505 2px, #050505 8px)',
              opacity: 0.5,
            }} />
            <WifiOff size={20} color="#1a472a" className="relative z-10 mb-2" />
            <span className="font-mono text-[8px] text-[#1a472a] relative z-10 uppercase tracking-widest">NO SIGNAL</span>
          </div>
        )}

        {/* Corner brackets — tactical frame */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-3 h-3 pointer-events-none`} style={{
            borderTop:    i < 2  ? `1px solid ${threatColor}` : 'none',
            borderBottom: i >= 2 ? `1px solid ${threatColor}` : 'none',
            borderLeft:   i % 2 === 0 ? `1px solid ${threatColor}` : 'none',
            borderRight:  i % 2 === 1 ? `1px solid ${threatColor}` : 'none',
          }} />
        ))}

        {/* Detection count badge */}
        {state.detections > 0 && (
          <div className="absolute bottom-1 right-1 font-mono text-[7px] px-1" style={{ background: '#000', border: `1px solid ${threatColor}`, color: threatColor }}>
            {state.detections} DET
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-2 py-1.5" style={{ borderTop: `1px solid #0d1f0d` }}>
        {!isLive ? (
          showInput ? (
            <div className="flex gap-1">
              <input
                autoFocus
                type="text"
                value={streamUrl}
                onChange={e => setStreamUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="rtsp://... or 0"
                className="flex-1 font-mono text-[8px] px-1.5 py-1 bg-black border border-[#1a472a] text-[#d4af37] outline-none placeholder:text-[#2a2a2a]"
              />
              <button onClick={handleStart} className="font-mono text-[8px] px-2 py-1 border border-[#1a472a] text-[#d4af37] hover:bg-[#1a472a]/30">GO</button>
              <button onClick={() => setShowInput(false)} className="font-mono text-[8px] px-2 py-1 border border-[#333] text-[#606060] hover:border-[#606060]">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="w-full font-mono text-[8px] uppercase tracking-widest py-1 text-[#1a472a] hover:text-[#d4af37] hover:border-[#d4af37] border border-[#1a472a] transition-colors"
            >
              + CONNECT STREAM
            </button>
          )
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-[#00ff41] animate-pulse">● LIVE</span>
            <button onClick={handleStop} className="font-mono text-[8px] px-2 py-0.5 border border-[#8b0000] text-[#ff4444] hover:bg-[#8b0000]/20">
              DISCONNECT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
