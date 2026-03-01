import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setErrorMsg(error.message);
    } else {
      if (!name.trim()) {
        setErrorMsg('El nombre es requerido');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) setErrorMsg(error.message);
      else if (data.session) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert([
          { id: data.session.user.id, name: name.trim() }
        ]);
        if (profileError) setErrorMsg(profileError.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-stone-200 p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl md:text-5xl font-black text-stone-800 mb-2 tracking-tight drop-shadow-sm">
          Cálculo Mental <span className="text-pink-500">Pro</span>
        </h1>
        <p className="text-stone-600 mb-8 text-sm">
          Guarda todo tu progreso en la nube
        </p>

        {errorMsg && <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm font-semibold">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo..."
              className="px-4 py-4 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg font-medium shadow-inner"
              required={!isLogin}
              maxLength={40}
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email..."
            className="px-4 py-4 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg font-medium shadow-inner"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña..."
            className="px-4 py-4 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg font-medium shadow-inner"
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-lg mt-2"
          >
            {loading ? 'Cargando...' : isLogin ? <><LogIn size={24} /> Entrar</> : <><UserPlus size={24} /> Registrarme</>}
          </button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="text-indigo-600 hover:text-pink-500 font-semibold text-sm transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
