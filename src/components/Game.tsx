import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameType, generateQuestion, Question } from '../utils/gameLogic';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds';
import { Heart, Pause } from 'lucide-react';

const TIME_LIMIT = 7000; // 7 seconds

export function Game({ type, onGameOver, onQuit, onRestart }: { type: GameType; onGameOver: (score: number) => void; onQuit: () => void; onRestart: () => void }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [difficulty, setDifficulty] = useState(1);
  const [history, setHistory] = useState<Set<string>>(new Set());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [isPaused, setIsPaused] = useState(false);
  
  const isTransitioningRef = useRef(false);

  const nextQuestion = useCallback((currentScore: number, currentDiff: number, currentHistory: Set<string>) => {
    const q = generateQuestion(type, currentDiff, currentHistory);
    setCurrentQuestion(q);
    setHistory(new Set(currentHistory).add(q.text));
    setInputValue('');
    setTimeLeft(TIME_LIMIT);
    isTransitioningRef.current = false;
  }, [type]);

  useEffect(() => {
    nextQuestion(0, 1, new Set());
  }, [nextQuestion]);

  const handleWrongAnswer = useCallback(() => {
    playIncorrectSound();
    setFeedback('incorrect');
    setLives(l => {
      const newLives = l - 1;
      if (newLives <= 0) {
        setTimeout(() => onGameOver(score), 500);
      } else {
        setTimeout(() => {
          setFeedback('none');
          nextQuestion(score, difficulty, history);
        }, 500);
      }
      return newLives;
    });
  }, [score, difficulty, history, nextQuestion, onGameOver]);

  const handleCorrectAnswer = useCallback(() => {
    playCorrectSound();
    setFeedback('correct');
    const newScore = score + 1;
    const newDiff = Math.floor(newScore / 4) + 1; // Increase difficulty every 4 points (slightly easier than 3)
    setScore(newScore);
    setDifficulty(newDiff);
    
    setTimeout(() => {
      setFeedback('none');
      nextQuestion(newScore, newDiff, history);
    }, 500);
  }, [score, difficulty, history, nextQuestion]);

  // Robust Timer Logic using setInterval
  useEffect(() => {
    if (isTransitioningRef.current || !currentQuestion || lives <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 50;
        return next < 0 ? 0 : next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentQuestion, lives, isPaused]);

  // Check for timeout
  useEffect(() => {
    if (timeLeft <= 0 && !isTransitioningRef.current && lives > 0 && !isPaused) {
      isTransitioningRef.current = true;
      handleWrongAnswer();
    }
  }, [timeLeft, lives, handleWrongAnswer, isPaused]);

  const handleSubmit = () => {
    if (isTransitioningRef.current || !currentQuestion) return;
    
    const numAnswer = parseInt(inputValue, 10);
    if (isNaN(numAnswer)) return;

    isTransitioningRef.current = true;
    if (numAnswer === currentQuestion.answer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleOptionClick = (opt: string) => {
    if (isTransitioningRef.current || !currentQuestion) return;
    isTransitioningRef.current = true;
    if (opt === currentQuestion.answer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleNumpad = (val: string) => {
    if (isTransitioningRef.current) return;
    if (val === 'del') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (val === 'enter') {
      handleSubmit();
    } else {
      // Limit length to avoid overflow
      if (inputValue.length < 6) {
        setInputValue(prev => prev + val);
      }
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current || currentQuestion?.options || isPaused) return;
      if (e.key >= '0' && e.key <= '9') {
        handleNumpad(e.key);
      } else if (e.key === 'Backspace') {
        handleNumpad('del');
      } else if (e.key === 'Enter') {
        handleNumpad('enter');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, currentQuestion]);

  if (!currentQuestion) return null;

  const progressPercent = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
  let progressColor = 'bg-green-500';
  if (progressPercent < 50) progressColor = 'bg-yellow-500';
  if (progressPercent < 20) progressColor = 'bg-red-500';

  let bgColor = 'bg-white/95';
  if (feedback === 'correct') bgColor = 'bg-green-100';
  if (feedback === 'incorrect') bgColor = 'bg-red-100';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center max-w-5xl mx-auto w-full px-4">
        <button 
          onClick={() => setIsPaused(true)} 
          className="flex items-center gap-2 bg-white/90 hover:bg-white text-stone-800 px-5 py-2.5 rounded-full shadow-md transition-all font-bold border border-stone-200"
        >
          <Pause size={20} /> Pausa
        </button>
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-3xl font-black text-stone-800 mb-4">Pausa</h2>
            <button 
              onClick={() => { setIsPaused(false); onRestart(); }}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-md transition-transform active:scale-95 text-lg"
            >
              Reiniciar
            </button>
            <button 
              onClick={onQuit}
              className="w-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-4 rounded-xl shadow-md transition-transform active:scale-95 text-lg"
            >
              Salir al menú principal
            </button>
            <button 
              onClick={() => setIsPaused(false)}
              className="w-full mt-2 text-stone-500 hover:text-stone-700 font-bold py-2"
            >
              Continuar jugando
            </button>
          </div>
        </div>
      )}

      {/* Game Card Container */}
      <div className={`w-full max-w-lg backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50 transition-colors duration-300 flex flex-col items-center mt-12 ${bgColor}`}>
        
        {/* Header: Score and Lives */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="text-2xl font-black text-stone-800">
            Puntos: <span className="text-indigo-600">{score}</span>
          </div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                size={28} 
                className={i < lives ? "text-red-500 fill-red-500" : "text-stone-300"} 
              />
            ))}
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden mb-10 shadow-inner">
          <div 
            className={`h-full ${progressColor} transition-all duration-75 ease-linear`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question */}
        <div className="text-6xl md:text-8xl font-black text-stone-800 mb-8 tracking-tighter text-center">
          {currentQuestion.text}
        </div>

        {/* Multiple Choice OR Numpad */}
        {currentQuestion.options ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                className="bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-2xl md:text-3xl py-6 rounded-2xl shadow-md border-2 border-indigo-100 active:scale-95 transition-transform"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Input Display */}
            <div className="w-full max-w-xs h-20 bg-white rounded-2xl shadow-inner border-2 border-stone-200 flex items-center justify-center text-4xl font-bold text-indigo-600 mb-8">
              {inputValue || <span className="text-stone-300">?</span>}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num}
                  onClick={() => handleNumpad(num.toString())}
                  className="bg-white hover:bg-stone-50 text-stone-800 font-bold text-2xl py-4 rounded-xl shadow-sm border border-stone-200 active:scale-95 transition-transform"
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => handleNumpad('del')}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xl py-4 rounded-xl shadow-sm border border-stone-300 active:scale-95 transition-transform flex items-center justify-center"
              >
                DEL
              </button>
              <button 
                onClick={() => handleNumpad('0')}
                className="bg-white hover:bg-stone-50 text-stone-800 font-bold text-2xl py-4 rounded-xl shadow-sm border border-stone-200 active:scale-95 transition-transform"
              >
                0
              </button>
              <button 
                onClick={() => handleNumpad('enter')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xl py-4 rounded-xl shadow-sm border-b-4 border-indigo-700 active:scale-95 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
