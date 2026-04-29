interface Props {
  score: number;
  highScore: number;
}

export function ScoreBoard({ score, highScore }: Props) {
  return (
    <div className="lux-panel flex flex-col gap-3 p-4">
      <div className="text-center">
        <div className="text-[10px] tracking-[0.3em] text-[#9b8560] uppercase mb-1">Score</div>
        <div className="gold-text text-3xl font-black tabular-nums tracking-wider">
          {String(score).padStart(4, '0')}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.3)] to-transparent" />
      <div className="text-center">
        <div className="text-[10px] tracking-[0.3em] text-[#9b8560] uppercase mb-1">Best</div>
        <div className="text-xl font-bold tabular-nums text-[#c8980a]">
          {String(highScore).padStart(4, '0')}
        </div>
      </div>
    </div>
  );
}
