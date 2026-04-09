import { Activity, Radio, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import AlertCard from './AlertCard';

export default function AlertFeed({ alerts, onClear }) {
  const handleClear = async () => {
    await api.clearAlertHistory();
    onClear();
  };

  return (
    <div className="panel-tactical">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-[#d4af37]" />
          <div>
            <div className="panel-title">LIVE ALERT FEED</div>
            <div className="font-mono text-[8px] text-[#808080] uppercase tracking-wider mt-1">
              REAL-TIME SURVEILLANCE MONITORING
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#808080] uppercase tracking-wider">
            {alerts.length} ALERT{alerts.length !== 1 ? 'S' : ''}
          </span>
          {alerts.length > 0 && (
            <button onClick={handleClear} className="btn-tactical flex items-center gap-1 px-2 py-1">
              <Trash2 className="w-3 h-3" /> CLEAR
            </button>
          )}
          <div className="status-indicator status-active"></div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 flex items-center justify-center bg-black/50 border-2 border-[#1a472a] mb-4">
                <Activity className="w-10 h-10 text-[#808080]" />
              </div>
              <div className="font-display text-sm font-bold text-[#808080] uppercase tracking-wider mb-2">
                AWAITING SURVEILLANCE DATA
              </div>
              <div className="font-mono text-[9px] text-[#606060] uppercase tracking-wider">
                SYSTEM MONITORING ACTIVE
              </div>
            </div>
          ) : (
            alerts.map((alert, index) => <AlertCard key={`${alert.timestamp}-${index}`} alert={alert} />)
          )}
        </div>
      </div>
    </div>
  );
}
