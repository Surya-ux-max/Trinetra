import { AlertTriangle, Shield, Info, MapPin, Clock, Camera } from 'lucide-react';

export default function AlertCard({ alert }) {
  const extractThreat = (analysis) => {
    if (!analysis) return 'LOW';
    const match = analysis.match(/THREAT_LEVEL:\s*(HIGH|MEDIUM|LOW)/i);
    return match ? match[1].toUpperCase() : 'LOW';
  };

  const threat = alert.threat || extractThreat(alert.analysis);

  const threatConfig = {
    HIGH: {
      icon: AlertTriangle,
      class: 'threat-high',
      badgeClass: 'badge-alert',
    },
    MEDIUM: {
      icon: Shield,
      class: 'threat-medium',
      badgeClass: 'badge-warning',
    },
    LOW: {
      icon: Info,
      class: 'threat-low',
      badgeClass: 'badge-success',
    },
  };

  const config = threatConfig[threat];
  const ThreatIcon = config.icon;

  return (
    <div className={`panel-tactical p-4 threat-card ${config.class} slide-in`}>
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3 pb-3 border-b border-[#1a472a]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#d4af37]" />
          <span className="font-display text-sm font-bold text-[#d4af37] uppercase tracking-wider">
            {alert.location}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {alert.sector && (
            <span className="badge-tactical">
              SECTOR {alert.sector.toUpperCase()}
            </span>
          )}
          <span className={`${config.badgeClass} flex items-center gap-1.5`}>
            <ThreatIcon className="w-3 h-3" />
            {threat}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-3 font-mono text-[10px] text-[#808080] uppercase">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {alert.timestamp}
        </div>
        {alert.frame_number && (
          <div className="flex items-center gap-1.5">
            <Camera className="w-3 h-3" />
            FRAME {alert.frame_number}
          </div>
        )}
      </div>

      {/* Objects */}
      <div className="mb-3">
        <div className="font-mono text-[9px] text-[#808080] uppercase tracking-wider mb-2">
          DETECTED OBJECTS:
        </div>
        <div className="flex flex-wrap gap-2">
          {alert.objects?.map((obj, i) => (
            <span key={i} className="badge-tactical">
              {obj.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Analysis */}
      <div className="pt-3 border-t border-[#1a472a]">
        <div className="font-mono text-[9px] text-[#808080] uppercase tracking-wider mb-2">
          TACTICAL ANALYSIS:
        </div>
        <div className="font-mono text-xs leading-relaxed text-[#c8c8c8] whitespace-pre-line">
          {alert.analysis}
        </div>
      </div>
    </div>
  );
}
