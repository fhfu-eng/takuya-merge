interface Props {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export function GameOverModal({ score, highScore, onRestart }: Props) {
  const isNewRecord = score >= highScore && score > 0;
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-xl" />
      <div
        className="relative mx-4 w-full max-w-xs rounded-2xl p-7 text-center"
        style={{
          background: 'linear-gradient(160deg, #10091f 0%, #0a0714 100%)',
          border: '1px solid rgba(212,175,55,0.35)',
          boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.1)',
        }}
      >
        {/* decorative top line */}
        <div className="h-px mb-5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />

        <div
          className="text-3xl font-black tracking-widest mb-1 gold-text"
        >
          GAME OVER
        </div>
        <div className="text-[11px] tracking-widest text-[#9b8560] uppercase mb-6">End of round</div>

        <div className="rounded-xl p-4 mb-4"
          style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="text-[10px] tracking-[0.3em] text-[#9b8560] uppercase mb-1">Final Score</div>
          <div className="gold-text text-4xl font-black tabular-nums">{score}</div>
        </div>

        {isNewRecord && (
          <div className="text-[11px] tracking-widest text-[#d4af37] mb-3 uppercase">
            ✦ New Record ✦
          </div>
        )}

        <div className="text-[10px] text-[#5a4a30] mb-6 tracking-widest">
          BEST &nbsp;{highScore}
        </div>

        <button onClick={onRestart} className="lux-btn w-full py-3 text-sm tracking-widest uppercase">
          Play Again
        </button>

        <div className="h-px mt-5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
      </div>
    </div>
  );
}
