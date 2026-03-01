import React, { useEffect, useState } from 'react';
import { RotateCcw, List, Trophy } from 'lucide-react';
import { GameType } from '../utils/gameLogic';
import { supabase } from '../lib/supabase';

export function GameOver({ score, type, onRestart, onQuitToMenu }: { score: number; type: GameType; onRestart: () => void; onQuitToMenu: () => void }) {
  const [highScore, setHighScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    const saveScore = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('high_scores')
        .select('score')
        .eq('user_id', user.id)
        .eq('game_type', type)
        .single();

      const currentHigh = data ? data.score : 0;

      if (score > currentHigh) {
        await supabase.from('high_scores').upsert({
          user_id: user.id,
          game_type: type,
          score
        });
        setHighScore(score);
        if (score > 0) setIsNewRecord(true);
      } else {
        setHighScore(currentHigh);
      }
    };
    saveScore();
  }, [score, type]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-stone-200 p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-md w-full">
        {isNewRecord && (
          <div className="bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full mb-6 flex items-center gap-2 animate-bounce shadow-sm">
            <Trophy size={18} />
            ¡NUEVO RÉCORD!
          </div>
        )}

        <h2 className="text-5xl font-black text-stone-800 mb-6">¡Juego Terminado!</h2>

        <div className="text-xl text-stone-600 mb-2">Puntuación final</div>
        <div className="text-7xl font-black text-pink-500 mb-8 drop-shadow-md">{score}</div>

        <div className="text-stone-600 mb-10 flex items-center gap-2 bg-stone-100 border border-stone-200 px-4 py-2 rounded-full">
          <Trophy size={16} className="text-yellow-500" />
          Mejor puntuación: <span className="font-bold text-stone-800">{highScore}</span>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg transform hover:scale-105 transition-all"
          >
            <RotateCcw size={24} />
            Jugar de nuevo
          </button>

          <button
            onClick={onQuitToMenu}
            className="flex items-center justify-center gap-2 w-full bg-stone-200 hover:bg-stone-300 text-stone-800 px-8 py-4 rounded-full font-bold text-lg border border-stone-300 transition-all"
          >
            <List size={20} />
            Salir al menú principal
          </button>
        </div>
      </div>
    </div>
  );
}
