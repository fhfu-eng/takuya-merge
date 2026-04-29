import { type FruitLevel, getFruitDef } from '../game/fruits';

interface Props {
  level: FruitLevel;
}

export function NextFruit({ level }: Props) {
  const def = getFruitDef(level);
  const size = 64;
  return (
    <div className="p-3 text-center rounded-xl" style={{ background: '#f0fdf4', border: '2px solid #86efac' }}>
      <div className="text-[10px] font-bold tracking-widest text-green-700 uppercase mb-2">Next</div>
      <div className="flex justify-center items-center mb-2" style={{ height: size + 8 }}>
        <div
          className="rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: size,
            height: size,
            boxShadow: '0 0 16px rgba(212,175,55,0.2), 0 2px 8px rgba(0,0,0,0.5)',
            border: '1px solid rgba(212,175,55,0.25)',
          }}
        >
          <img
            src={def.imagePath}
            alt={def.name}
            width={size}
            height={size}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const p = e.currentTarget.parentElement;
              if (p) p.style.background = def.color;
            }}
          />
        </div>
      </div>
      <div className="text-[10px] text-green-800 font-medium truncate">{def.name}</div>
    </div>
  );
}
