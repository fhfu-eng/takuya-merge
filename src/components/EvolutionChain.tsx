import { FRUITS, type FruitLevel } from '../game/fruits';

interface Props {
  appearedLevels: Set<FruitLevel>;
}

export function EvolutionChain({ appearedLevels }: Props) {
  return (
    <div className="p-3 rounded-xl" style={{ background: '#faf5ff', border: '2px solid #d8b4fe' }}>
      <div className="text-[10px] font-bold tracking-widest text-purple-700 uppercase mb-3 text-center">Evolution</div>
      <div className="grid grid-cols-4 gap-1.5">
        {FRUITS.map((def) => {
          const appeared = appearedLevels.has(def.level);
          return (
            <div key={def.level} className="flex flex-col items-center gap-0.5">
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: 30,
                  height: 30,
                  opacity: appeared ? 1 : 0.25,
                  boxShadow: appeared
                    ? '0 0 8px rgba(212,175,55,0.35), 0 0 0 1px rgba(212,175,55,0.2)'
                    : 'none',
                  border: appeared ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={def.imagePath}
                  alt={def.name}
                  width={30}
                  height={30}
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    filter: appeared ? 'none' : 'grayscale(100%) brightness(0.4)',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const p = e.currentTarget.parentElement;
                    if (p) p.style.background = appeared ? def.color : '#333';
                  }}
                />
              </div>
              <span style={{ fontSize: 7, color: appeared ? '#7e22ce' : '#bbb', textAlign: 'center', lineHeight: 1.2 }}>
                {def.level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
