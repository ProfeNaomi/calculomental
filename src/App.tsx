/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Map } from './components/Map';
import { Menu } from './components/Menu';
import { Game } from './components/Game';
import { GameOver } from './components/GameOver';
import { Footer } from './components/Footer';
import { Ranking } from './components/Ranking';
import { GameType } from './utils/gameLogic';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [gameState, setGameState] = useState<'login' | 'map' | 'menu' | 'playing' | 'gameover' | 'ranking'>('login');
  const [userName, setUserName] = useState('');
  const [gameType, setGameType] = useState<GameType>('suma');
  const [score, setScore] = useState(0);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setGameState('login');
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('name').eq('id', userId).single();
    if (data) {
      setUserName(data.name);
      setGameState('map');
    }
  };

  const handleSelectLevel = (levelId: number) => {
    if (levelId === 1) {
      setGameState('menu');
    }
  };

  const startGame = (type: GameType) => {
    setGameType(type);
    setScore(0);
    setGameState('playing');
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setGameState('gameover');
  };

  return (
    <div className="min-h-screen bg-math-pattern flex flex-col font-sans pb-24">
      {gameState === 'login' && <Login onLogin={() => { }} />}
      {gameState === 'map' && <Map userName={userName} onSelectLevel={handleSelectLevel} onOpenRanking={() => setGameState('ranking')} />}
      {gameState === 'ranking' && <Ranking onBack={() => setGameState('map')} />}
      {gameState === 'menu' && <Menu onStart={startGame} onBack={() => setGameState('map')} />}
      {gameState === 'playing' && <Game type={gameType} onGameOver={handleGameOver} onQuit={() => setGameState('menu')} onRestart={() => startGame(gameType)} />}
      {gameState === 'gameover' && <GameOver score={score} type={gameType} onRestart={() => startGame(gameType)} onQuitToMenu={() => setGameState('menu')} />}
      <Footer />
    </div>
  );
}
