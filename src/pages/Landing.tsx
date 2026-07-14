import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Brain, Rocket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const phrases = [
  'Build your career.',
  'Match your dream job.',
  'Land top universities.',
  'Powered by AI.',
];

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Typewriter cycle
  useEffect(() => {
    const phrase = phrases[phraseIdx];
    let i = 0;
    setTyped('');
    const typer = setInterval(() => {
      i++;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) {
        clearInterval(typer);
        setTimeout(() => setPhraseIdx((p) => (p + 1) % phrases.length), 1800);
      }
    }, 55);
    return () => clearInterval(typer);
  }, [phraseIdx]);

  return (
    <div className="min-h-screen bg-[#05060f] text-white relative overflow-hidden">
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.12) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-[28rem] h-[28rem] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-violet-600/10 rounded-full blur-[140px]" />

      {/* Floating crypto-style tickers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['+248%','AI','#1','▲','◆','</>','{ }','★'].map((t, i) => (
          <div
            key={i}
            className="absolute text-cyan-300/30 font-mono text-xs md:text-sm animate-float"
            style={{
              left: `${(i * 13 + 7) % 95}%`,
              top: `${(i * 21 + 12) % 85}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + (i % 4) * 2}s`,
            }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 pb-5 pt-[calc(1.25rem+env(safe-area-inset-top))] md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 grid place-items-center shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold tracking-tight">PathFuse AI</span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">
            The future of
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
            your career.
          </span>
        </h1>

        <div className="h-8 mb-10 font-mono text-base md:text-lg text-cyan-300">
          {typed}
          <span className="inline-block w-2 h-5 ml-0.5 align-middle bg-cyan-300 animate-pulse" />
        </div>

        <Button
          size="lg"
          onClick={() => navigate('/auth')}
          className="group relative px-8 py-6 text-base font-semibold rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black hover:opacity-90 shadow-2xl shadow-cyan-500/30 transition-all hover:scale-105"
        >
          Get started — it's free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="mt-4 text-xs text-gray-500">
          Sign up with Google, Apple, or email • No card required
        </p>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mt-16 w-full max-w-2xl">
          {[
            { icon: Brain, label: 'AI Resume' },
            { icon: TrendingUp, label: 'Job Match' },
            { icon: Rocket, label: 'Uni Predictor' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-400/40 hover:bg-white/10 transition-all"
            >
              <Icon className="w-5 h-5 text-cyan-300 mx-auto mb-2" />
              <div className="text-xs text-gray-300">{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Landing;
