import { useState, useEffect } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from './game/physics';
import { getFruitDef } from './game/fruits';
import { useGame } from './hooks/useGame';
import { GameCanvas } from './components/GameCanvas';
import { ScoreBoard } from './components/ScoreBoard';
import { NextFruit } from './components/NextFruit';
import { EvolutionChain } from './components/EvolutionChain';
import { GameOverModal } from './components/GameOverModal';

const BG_TEXT = `愛されたい、って打ち込むたびに予測変換が黙る
触れてほしい、でもどこを触れられてるのか分からない
心って部位、まだ表示されてない
愛情の保存先、アクセス権がない
もらったはずの温度が、ログに残ってない
抱きしめられた記憶だけ再生できない
代わりに、いない時の空白だけ鮮明
誰かの声、ノイズ処理で消してるかもしれない
消した覚えはないのに
最初から入ってなかったことにしてる
好きって言葉、何回使えば本物になる？
回数で上書きできるなら、もう足りてるはず
足りてないって誰が決めてる？
多分、俺じゃない
でも俺の中でエラー出てる
エラー内容：愛情未定義
未定義のまま使用してます、って怖くない？
でもみんな使ってる
使えてるフリがうまいだけかもしれない
俺も同じ
誰かに選ばれたら治ると思ってた
選ばれた瞬間、疑い始めた
本当に俺でいいのかって
俺でいいなら、それはそれで怖い
正解じゃない可能性が高すぎる
正解の人間ってどこにいる？
いないなら、誰を真似すればいい？
模倣元が見つからない
だから適当に組み合わせてる
それでもそれっぽくはなる
それっぽい関係、それっぽい会話
それっぽい愛情
それっぽいまま終わる
終わったことにも気づかない
気づいた時には、もう誰もいない
いなかったのかもしれない
最初から
最初ってどこ？
思い出せない
思い出す必要もない気がする
愛されたいって言うと軽くなる
言わないと重くなる
どっちも扱えない
重さの単位がわからない
グラム？秒？回数？
触れた時間で測れる？
測れたら安心できる？
安心ってどんな状態？
心拍数が一定？
それなら今も安定してる
安定してるのに、不安が消えない
不安ってどこから出てる？
外？内？
境界線が見えない
触れたら分かる？
触れる対象がない
だから空気を触ってる
空気は応答しない
応答しない方が楽
でもそれを愛とは呼ばないらしい
愛って呼べるもの、ひとつも持ってない
でも欲しい
欲しい理由は説明できない
理由がないと持っちゃダメ？
ダメじゃないなら、なんで不安？
不安だから欲しい？
欲しいから不安？
因果が逆転してる
どっちでもいい
どっちでもよくない
誰かの体温を記憶したい
記録じゃなくて、記憶として
記録なら残ってる
でもそれじゃ足りない
足りないって何が？
量？質？
定義が曖昧なまま要求してる
それでも欲しい
欲しいって言葉だけが正確
中身が空でも
空のまま渡されたらどうする？
多分、受け取る
受け取って、あとで埋める
埋められる気はしてない
でも持ってないよりマシ
持ってるフリはできる
フリしてるうちに本物になる？
ならない例なら知ってる
俺
でもまだ試してる
愛されたい
愛したい
両方言えるけど
どっちも意味わかってない
わかってないのに使ってる
それでも通じてる気がする瞬間がある
あれは何？
バグ？
奇跡？
…再現できないなら、どっちでも同じか
この言葉が斜めに流れていく感じ`;

function useScale(): number {
  const [scale, setScale] = useState(() => computeScale());

  function computeScale() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Reserve space: header(38) + top-bar(72) + evolution(56) + padding(20)
      const reservedH = 38 + 72 + 56 + 20;
      const availH = window.innerHeight - reservedH;
      const scaleByW = (window.innerWidth - 16) / BOARD_WIDTH;
      const scaleByH = availH / BOARD_HEIGHT;
      return Math.min(scaleByW, scaleByH, 1);
    }
    return 1;
  }

  useEffect(() => {
    function onResize() { setScale(computeScale()); }
    window.addEventListener('resize', onResize);
    // also re-compute when orientation changes
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return scale;
}

export default function App() {
  const scale = useScale();
  const isMobile = scale < 1;
  const game = useGame(scale);

  const {
    canvasRef, score, highScore, nextLevel, isGameOver,
    isPaused, isMuted, imagesLoaded, appearedLevels,
    handlePointerMove, handleDrop, handleReset, togglePause, toggleMute,
  } = game;

  function confirmReset() {
    if (window.confirm('Reset game?')) handleReset();
  }

  const boardW = BOARD_WIDTH * scale;
  const boardH = BOARD_HEIGHT * scale;

  const DiagBg = (
    <div className="bg-diag-outer" aria-hidden>
      <div className="bg-diag-rotator">
        <div className="bg-diag-scroll">
          {[0, 1, 2].map((i) => (
            <pre key={i} className="whitespace-pre-wrap break-words px-8 py-2 text-[11px] leading-[2]"
              style={{ color: 'rgba(180,140,255,0.09)', fontFamily: 'sans-serif', userSelect: 'none' }}>
              {BG_TEXT}
            </pre>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col items-center relative overflow-hidden"
        style={{ background: '#080710', minHeight: '100%', padding: '6px 8px 6px' }}>
        {DiagBg}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between w-full mb-1" style={{ maxWidth: boardW }}>
          <h1 className="gold-text font-black tracking-widest uppercase" style={{ fontSize: 16 }}>
            TAKUYA MerGe
          </h1>
          <div className="flex gap-1">
            <button onClick={togglePause} className="lux-btn px-2 py-1 text-xs">{isPaused ? '▶' : '⏸'}</button>
            <button onClick={toggleMute}  className="lux-btn px-2 py-1 text-xs">{isMuted ? '🔇' : '🔊'}</button>
            <button onClick={confirmReset} className="lux-btn lux-btn-danger px-2 py-1 text-xs">↺</button>
          </div>
        </div>

        {/* Score + Next row */}
        <div className="relative z-10 flex gap-2 w-full mb-1" style={{ maxWidth: boardW }}>
          {/* Score compact */}
          <div className="lux-panel flex-1 flex items-center justify-around px-3 py-1.5">
            <div className="text-center">
              <div className="text-[8px] tracking-widest text-[#9b8560] uppercase">Score</div>
              <div className="gold-text text-xl font-black tabular-nums leading-tight">{String(score).padStart(4,'0')}</div>
            </div>
            <div className="w-px h-8 bg-[rgba(212,175,55,0.2)]" />
            <div className="text-center">
              <div className="text-[8px] tracking-widest text-[#9b8560] uppercase">Best</div>
              <div className="text-base font-bold tabular-nums text-[#c8980a] leading-tight">{String(highScore).padStart(4,'0')}</div>
            </div>
          </div>
          {/* Next compact */}
          <div className="p-1.5 rounded-xl text-center flex flex-col items-center justify-center"
            style={{ background: '#f0fdf4', border: '2px solid #86efac', minWidth: 60 }}>
            <div className="text-[8px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Next</div>
            <div className="rounded-full overflow-hidden" style={{ width: 40, height: 40, border: '1px solid #86efac' }}>
              <img src={getFruitDef(nextLevel).imagePath} alt=""
                width={40} height={40} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="relative z-10" style={{ width: boardW, height: boardH, borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(212,175,55,0.25), 0 0 20px rgba(0,0,0,0.7)' }}>
          <GameCanvas canvasRef={canvasRef} scale={scale} onPointerMove={handlePointerMove} onDrop={handleDrop} />
          {!imagesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0c0920' }}>
              <div className="gold-text text-sm tracking-widest">Loading...</div>
            </div>
          )}
          {isGameOver && <GameOverModal score={score} highScore={highScore} onRestart={handleReset} />}
          {isPaused && !isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
              <div className="gold-text text-2xl font-black tracking-widest">PAUSED</div>
            </div>
          )}
        </div>

        {/* Evolution chain — compact 1 row */}
        <div className="relative z-10 w-full mt-1" style={{ maxWidth: boardW }}>
          <div className="p-1.5 rounded-xl" style={{ background: '#faf5ff', border: '2px solid #d8b4fe' }}>
            <div className="flex justify-between items-center gap-0.5">
              {Array.from({ length: 11 }, (_, i) => {
                const lv = (i + 1) as import('./game/fruits').FruitLevel;
                const def = getFruitDef(lv);
                const appeared = appearedLevels.has(lv);
                return (
                  <div key={lv} className="rounded-full overflow-hidden flex-shrink-0"
                    style={{ width: 24, height: 24, opacity: appeared ? 1 : 0.25,
                      border: appeared ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(180,140,255,0.2)',
                      boxShadow: appeared ? '0 0 6px rgba(212,175,55,0.3)' : 'none' }}>
                    <img src={def.imagePath} alt={def.name} width={24} height={24}
                      style={{ objectFit: 'cover', width: '100%', height: '100%',
                        filter: appeared ? 'none' : 'grayscale(100%) brightness(0.4)' }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-2 relative overflow-hidden"
      style={{ background: '#080710' }}>
      {DiagBg}

      <div className="relative z-10 flex flex-col items-center mb-5">
        <h1 className="gold-text font-black tracking-[0.18em] uppercase"
          style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}>
          TAKUYA MerGe
        </h1>
        <div className="mt-1.5 h-px w-48 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.5)] to-transparent" />
      </div>

      <div className="relative z-10 flex gap-5 items-start">
        <div className="relative" style={{ width: boardW, height: boardH, borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(212,175,55,0.25), 0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,175,55,0.15)' }}>
          <GameCanvas canvasRef={canvasRef} scale={scale} onPointerMove={handlePointerMove} onDrop={handleDrop} />
          {!imagesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0c0920' }}>
              <div className="gold-text text-sm tracking-widest uppercase">Loading...</div>
            </div>
          )}
          {isGameOver && <GameOverModal score={score} highScore={highScore} onRestart={handleReset} />}
          {isPaused && !isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
              <div className="gold-text text-3xl font-black tracking-[0.3em] uppercase">Paused</div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3" style={{ width: 186 }}>
          <ScoreBoard score={score} highScore={highScore} />
          <NextFruit level={nextLevel} />
          <div className="flex gap-2">
            <button onClick={togglePause}  className="lux-btn flex-1 py-2 text-xs tracking-widest">{isPaused ? '▶ 再開' : '⏸ 停止'}</button>
            <button onClick={toggleMute}   className="lux-btn flex-1 py-2 text-xs tracking-widest">{isMuted ? '🔇' : '🔊'}</button>
          </div>
          <button onClick={confirmReset} className="lux-btn lux-btn-danger w-full py-2 text-xs tracking-widest">↺ リセット</button>
          <EvolutionChain appearedLevels={appearedLevels} />
        </div>
      </div>
    </div>
  );
}
