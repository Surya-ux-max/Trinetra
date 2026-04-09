export default function StatCard({ icon: Icon, label, value, color = 'default' }) {
  const colorClasses = {
    default: 'border-[#1a472a]',
    danger: 'border-[#8b0000]',
    warning: 'border-[#ff8c00]',
    info: 'border-[#4682b4]',
  };

  return (
    <div className={`stat-display ${colorClasses[color]} fade-in`}>
      <div className="flex justify-between items-start mb-3">
        {Icon && (
          <div className="w-10 h-10 flex items-center justify-center bg-black/50 border border-[#1a472a]">
            <Icon className="w-5 h-5 text-[#d4af37]" />
          </div>
        )}
      </div>
      
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
