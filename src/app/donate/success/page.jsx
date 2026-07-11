import { useEffect } from 'react';
import { Link } from 'react-router';
import confetti from 'canvas-confetti';
import { Heart, CheckCircle, ArrowLeft } from 'lucide-react';

export default function DonateSuccessPage() {
  useEffect(() => {
    // Fire confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-md w-full text-center relative z-10 animate-fade-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/20">
          <CheckCircle className="text-white" size={40} />
        </div>
        
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
          Thank You! <Heart className="inline text-pink-500 fill-pink-500 relative -top-1" size={28} />
        </h1>
        
        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
          Your support means the world to us. It helps keep SeeUI free and fuels future development. You are awesome!
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95 ring-1 ring-white/10"
        >
          <ArrowLeft size={16} />
          Back to SeeUI
        </Link>
      </div>
    </div>
  );
}
