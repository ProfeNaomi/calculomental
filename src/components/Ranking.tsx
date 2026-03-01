import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';

interface RankEntry {
    id: string;
    name: string;
    score: number;
}

export function Ranking({ onBack }: { onBack: () => void }) {
    const [rankings, setRankings] = useState<RankEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            // Fetch top 10 scores grouped by user (sum of all game types or just max single score)
            // Para aserlo facil de entender para la prof, sumamos todos los scores de cada jugador
            const { data, error } = await supabase
                .from('high_scores')
                .select(`
          score,
          profiles (
            id,
            name
          )
        `);

            if (!error && data) {
                // Group by user
                const userScores: Record<string, { id: string, name: string, score: number }> = {};
                data.forEach((entry: any) => {
                    if (!entry.profiles) return;
                    const uId = entry.profiles.id;
                    if (!userScores[uId]) {
                        userScores[uId] = { id: uId, name: entry.profiles.name, score: 0 };
                    }
                    userScores[uId].score += entry.score;
                });

                const sorted = Object.values(userScores).sort((a, b) => b.score - a.score).slice(0, 10);
                setRankings(sorted);
            }
            setLoading(false);
        };

        fetchRanking();
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

            <div className="bg-white/90 backdrop-blur-xl border border-stone-200 p-8 rounded-3xl shadow-2xl w-full max-w-lg mt-12 md:mt-0">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <Trophy className="text-yellow-500" size={32} />
                    <h2 className="text-3xl md:text-4xl font-black text-stone-800 text-center">
                        Salón de la <span className="text-yellow-500">Fama</span>
                    </h2>
                </div>

                <p className="text-stone-600 text-center mb-6">Top 10 de jugadores con mayor puntaje acumulado en Cálculo Mental Pro.</p>

                {loading ? (
                    <div className="text-center font-semibold text-stone-500 py-8">Cargando puntajes...</div>
                ) : rankings.length === 0 ? (
                    <div className="text-center font-semibold text-stone-500 py-8">Aún no hay puntajes registrados. ¡Sé el primero!</div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {rankings.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border ${index === 0 ? 'bg-yellow-50 border-yellow-200 scale-105 shadow-md my-2' : index === 1 ? 'bg-stone-50 border-stone-300' : index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-stone-100'}`}
                            >
                                <div className={`font-black text-2xl w-8 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-stone-400' : index === 2 ? 'text-orange-400' : 'text-stone-300'}`}>
                                    {index + 1}
                                </div>

                                {index < 3 && <Medal className={`shrink-0 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-stone-400' : 'text-orange-400'}`} size={24} />}

                                <div className="flex-1 font-bold text-lg text-stone-800 truncate">
                                    {player.name}
                                </div>
                                <div className="font-black text-xl text-indigo-500">
                                    {player.score} <span className="text-xs text-stone-400 font-medium">pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
