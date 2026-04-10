import { useState } from 'react';
import CCTVPanel from './CCTVPanel';

const SECTORS = ['alpha', 'bravo', 'charlie'];

export default function CCTVWall({ sectors, onSectorChange, alertsBySector }) {
  const [expanded, setExpanded] = useState(null);

  const handleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  if (expanded) {
    return (
      <div className="flex flex-col gap-2 h-full">
        <CCTVPanel
          sectorId={expanded}
          state={sectors[expanded]}
          onStateChange={s => onSectorChange(expanded, s)}
          latestAlert={alertsBySector[expanded]?.[0]}
          expanded
          onExpand={() => handleExpand(expanded)}
        />
        {/* Thumbnails of other cameras */}
        <div className="grid grid-cols-2 gap-2">
          {SECTORS.filter(s => s !== expanded).map(id => (
            <CCTVPanel
              key={id}
              sectorId={id}
              state={sectors[id]}
              onStateChange={s => onSectorChange(id, s)}
              latestAlert={alertsBySector[id]?.[0]}
              expanded={false}
              onExpand={() => handleExpand(id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 h-full">
      {SECTORS.map(id => (
        <CCTVPanel
          key={id}
          sectorId={id}
          state={sectors[id]}
          onStateChange={s => onSectorChange(id, s)}
          latestAlert={alertsBySector[id]?.[0]}
          expanded={false}
          onExpand={() => handleExpand(id)}
        />
      ))}
    </div>
  );
}
