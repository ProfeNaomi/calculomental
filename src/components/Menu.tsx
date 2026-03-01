import React, { useState, useEffect } from 'react';
import { GameType } from '../utils/gameLogic';
import { Plus, Minus, X, Divide, Hash, Layers, Trophy, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const games: { type: GameType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'suma', label: 'Suma de naturales', icon: <Plus size={32} />, color: 'bg-blue-500' },
  { type: 'resta', label: 'Resta de naturales', icon: <Minus size={32} />, color: 'bg-red-500' },
  { type: 'multiplicacion', label: 'Multiplicación', icon: <X size={32} />, color: 'bg-green-500' },
  { type: 'division', label: 'División', icon: <Divide size={32} />, color: 'bg-yellow-500' },
  { type: 'factores', label: 'Descomposición', icon: <Hash size={32} />, color: 'bg-purple-500' },
  { type: 'combinada', label: 'Oper. Combinada', icon: <Layers size={32} />, color: 'bg-orange-500' },
];

export function Menu({ onStart, onBack }: { onStart: (type: GameType) => void, onBack: () => void }) {
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('high_scores')
          .select('game_type, score')
          .eq('user_id', user.id)
          .then(({ data }) => {
            if (data) {
              const scores: Record<string, number> = {};
              data.forEach((s: any) => scores[s.game_type] = s.score);
              setHighScores(scores);
            }
          });
      }
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white/90 hover:bg-white text-stone-800 px-4 py-2 rounded-full shadow-md transition-all font-semibold border border-stone-200"
        >
          <ArrowLeft size={20} /> Volver al Mapa
        </button>
      </div>

      <div className="text-indigo-500 font-bold tracking-widest uppercase mb-2 mt-8 md:mt-0">Nivel 1</div>
      <h1 className="text-4xl md:text-6xl font-black text-stone-800 mb-2 text-center tracking-tight drop-shadow-sm">
        Números <span className="text-pink-500">Naturales</span>
      </h1>
      <p className="text-stone-600 mb-12 text-center max-w-md">
        Mejora tu agilidad mental. Tienes 7 segundos por pregunta y 3 vidas. ¡Elige un modo de juego!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {games.map((game) => (
          <button
            key={game.type}
            onClick={() => onStart(game.type)}
            className={`${game.color} hover:opacity-90 transition-all transform hover:scale-105 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-xl border border-black/10`}
          >
            <div className="bg-white/20 p-4 rounded-full">
              {game.icon}
            </div>
            <span className="font-bold text-xl text-center">{game.label}</span>
            <div className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full text-sm font-semibold">
              <Trophy size={14} className="text-yellow-300" />
              <span>Récord: {highScores[game.type] || 0}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
