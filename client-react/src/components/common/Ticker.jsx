export default function Ticker({ text }) {
  const content =
    text ||
    'CLASSIFIED · MINISTRY OF DEFENCE · GOVERNMENT OF INDIA · TRINETRA BORDER SURVEILLANCE SYSTEM · AUTHORIZED PERSONNEL ONLY · RESTRICTED ACCESS';

  return (
    <div className="bg-gradient-to-r from-[#1a472a] via-[#0f2818] to-[#1a472a] py-1.5 overflow-hidden border-b border-[#d4af37]/30">
      <div className="ticker-scroll font-mono text-[9px] tracking-[3px] font-bold uppercase text-[#d4af37]">
        &nbsp;&nbsp;&nbsp;{content} · {content} · {content}&nbsp;&nbsp;&nbsp;
      </div>
    </div>
  );
}
