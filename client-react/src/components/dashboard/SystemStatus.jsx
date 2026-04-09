import { Server, Cpu, Radio, Bell, Clock, ExternalLink } from 'lucide-react';

export default function SystemStatus() {
  const specs = [
    { icon: Cpu,         label: 'AI ENGINE',        value: 'CV THREAT ANALYSIS' },
    { icon: Server,      label: 'OBJECT DETECTION', value: 'YOLOV8S ACTIVE' },
    { icon: Radio,       label: 'STREAM SUPPORT',   value: 'RTSP / WEBCAM' },
    { icon: Bell,        label: 'PUSH ALERTS',      value: 'NTFY ACTIVE' },
    { icon: Clock,       label: 'COOLDOWN',         value: '60 SEC / SECTOR' },
    {
      icon: ExternalLink,
      label: 'LEGACY CAMERA',
      value: (
        <a
          href="http://localhost:8000/camera"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-tactical text-[8px] px-2 py-1 inline-flex items-center gap-1"
        >
          OPEN <ExternalLink className="w-2.5 h-2.5" />
        </a>
      ),
    },
  ];

  return (
    <div className="panel-tactical">
      <div className="panel-header">
        <div className="panel-title">SYSTEM STATUS</div>
        <div className="flex items-center gap-2">
          <div className="status-indicator status-active"></div>
          <span className="font-mono text-[9px] text-[#00ff00] uppercase tracking-wider font-semibold">
            ONLINE
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.label}
              className="flex items-center justify-between py-2 border-b border-[#1a472a] last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center bg-black/50 border border-[#1a472a]">
                  <Icon className="w-4 h-4 text-[#808080]" />
                </div>
                <span className="font-mono text-[9px] text-[#808080] uppercase tracking-wider font-semibold">
                  {spec.label}
                </span>
              </div>
              {typeof spec.value === 'string' ? (
                <span className="font-mono text-[9px] text-[#d4af37] uppercase tracking-wider font-semibold">
                  {spec.value}
                </span>
              ) : (
                spec.value
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
