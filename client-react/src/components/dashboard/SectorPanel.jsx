import { useState, useEffect, useRef } from 'react';
import { Radio, Square, Eye } from 'lucide-react';
import { api, LIVE_FEED_URL } from '../../utils/api';

export default function SectorPanel({ sectorId, title, subtitle, state, onStateChange }) {
  const [streamUrl, setStreamUrl] = useState('');
  const [showFeed, setShowFeed] = useState(false);

  const isLive = state.status === 'LIVE';

  const handleStart = async () => {
    if (!streamUrl.trim()) return;
    onStateChange({ ...state, active: true, status: 'LIVE' });
    setShowFeed(true);
    try {
      const result = await api.startStream(sectorId, streamUrl.trim());
      if (result.status !== 'started') {
        onStateChange({ ...state, active: false, status: 'ERROR' });
        setShowFeed(false);
      }
    } catch {
      onStateChange({ ...state, active: false, status: 'FAILED' });
      setShowFeed(false);
    }
  };

  const handleStop = async () => {
    await api.stopStream(sectorId);
    setShowFeed(false);
    onStateChange({ active: false, progress: 0, detections: 0, status: 'STANDBY' });
  };

  return (
    <div className="bg-black/50 border border-[#1a472a] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1a472a]">
        <div>
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-[#00ff00] animate-pulse' : 'text-[#d4af37]'}`} />
            <span className="font-display text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">{title}</span>
          </div>
          <div className="font-mono text-[8px] text-[#808080] uppercase tracking-wider mt-0.5">{subtitle}</div>
        </div>
        <div className="flex items-center gap-2">
          {isLive && <div className="status-indicator status-active" />}
          <span className={`font-mono text-[9px] uppercase tracking-wider ${isLive ? 'text-[#00ff00]' : 'text-[#808080]'}`}>
            {state.status}
          </span>
        </div>
      </div>

      {/* Stream URL input */}
      {!isLive && (
        <div className="mb-3">
          <div className="font-mono text-[8px] text-[#808080] uppercase tracking-wider mb-1">STREAM URL / WEBCAM INDEX</div>
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="0  (webcam)  or  rtsp://ip:554/stream"
            className="input-tactical w-full mb-2 text-[10px]"
          />
        </div>
      )}

      {/* Live feed viewer */}
      {isLive && (
        <div className="mb-3">
          <button
            onClick={() => setShowFeed((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-[9px] text-[#d4af37] uppercase tracking-wider mb-2"
          >
            <Eye className="w-3 h-3" />
            {showFeed ? 'HIDE FEED' : 'VIEW LIVE FEED'}
          </button>
          {showFeed && (
            <img
              src={LIVE_FEED_URL(sectorId)}
              alt={`${title} live`}
              className="w-full border border-[#1a472a]"
              style={{ imageRendering: 'auto' }}
            />
          )}
          <div className="flex justify-between font-mono text-[9px] text-[#808080] uppercase mt-1">
            <span className="text-[#00ff00]">● STREAMING</span>
            <span>{state.detections} DETECTIONS</span>
          </div>
        </div>
      )}

      {/* Action button */}
      {isLive ? (
        <button onClick={handleStop} className="btn-tactical w-full flex items-center justify-center gap-2">
          <Square className="w-3 h-3" /> STOP STREAM
        </button>
      ) : (
        <button
          onClick={handleStart}
          disabled={!streamUrl.trim()}
          className="btn-tactical w-full"
        >
          START STREAM
        </button>
      )}
    </div>
  );
}
