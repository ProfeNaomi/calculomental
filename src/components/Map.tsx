import React from 'react';
import { Lock, Play, Map as MapIcon, LogOut, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';

const levels = [
  { id: 1, name: 'Números Naturales', locked: false },
  { id: 2, name: 'Números Enteros', locked: true },
  { id: 3, name: 'Números Racionales', locked: true },
  { id: 4, name: 'Números Irracionales', locked: true },
  { id: 5, name: 'Números Reales', locked: true },
  { id: 6, name: 'Números Complejos', locked: true },
];

export function Map({ userName, onSelectLevel, onOpenRanking }: { userName: string, onSelectLevel: (levelId: number) => void, onOpenRanking: () => void }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 py-8 overflow-y-auto w-full relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={onOpenRanking}
          className="flex items-center gap-2 bg-yellow-400/90 hover:bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full shadow-md transition-all font-semibold border border-yellow-500"
          title="Ver Ranking"
        >
          <Trophy size={20} /> <span className="hidden md:inline">Ranking</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/90 hover:bg-white text-stone-800 px-4 py-2 rounded-full shadow-md transition-all font-semibold border border-stone-200"
          title="Cerrar sesión"
        >
          <LogOut size={20} /> <span className="hidden md:inline">Salir</span>
        </button>
      </div>

      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MapIcon className="text-pink-500" size={32} />
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 text-center">
            Mapa de <span className="text-pink-500">Progreso</span>
          </h2>
        </div>
        <p className="text-stone-600 text-center mb-12 text-lg">
          Hola <span className="font-bold text-stone-800">{userName}</span>, selecciona un nivel para jugar
        </p>

        <div className="flex flex-col gap-8 relative px-4 md:px-0">
          {/* Línea conectora central (visible en desktop) */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-2 bg-stone-300 rounded-full -ml-1 z-0"></div>
          {/* Línea conectora lateral (visible en móvil) */}
          <div className="md:hidden absolute left-12 top-8 bottom-8 w-2 bg-stone-300 rounded-full z-0"></div>

          {levels.map((level, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={level.id} className={`relative z-10 flex items-center gap-6 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} w-full`}>

                {/* Nodo Circular */}
                <div
                  className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center shadow-lg border-4 z-10
                    ${level.locked
                      ? 'bg-stone-200 border-stone-300'
                      : 'bg-indigo-500 border-indigo-300 cursor-pointer hover:scale-110 transition-transform hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                    } md:mx-auto`}
                  onClick={() => !level.locked && onSelectLevel(level.id)}
                >
                  {level.locked ? <Lock className="text-stone-400" size={24} /> : <Play className="text-white ml-1" size={28} />}
                </div>

                {/* Tarjeta de Nivel */}
                <div className={`flex-1 ${isEven ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                  <div
                    className={`p-6 rounded-2xl backdrop-blur-md border shadow-md
                      ${level.locked
                        ? 'bg-white/50 border-stone-200'
                        : 'bg-white border-stone-200 cursor-pointer hover:bg-stone-50 transition-colors'
                      }`}
                    onClick={() => !level.locked && onSelectLevel(level.id)}
                  >
                    <div className="text-sm font-bold text-indigo-500 mb-1 tracking-widest uppercase">Nivel {level.id}</div>
                    <h3 className={`text-2xl font-black ${level.locked ? 'text-stone-400' : 'text-stone-800'}`}>
                      {level.name}
                    </h3>
                    {level.locked && (
                      <p className="text-stone-500 text-sm mt-2">Bloqueado. Supera los niveles anteriores.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
