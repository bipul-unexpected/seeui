import { Link } from 'react-router';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

export default function DonateCancelPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-md w-full text-center animate-fade-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 ring-4 ring-slate-800/50 text-slate-400">
          <RefreshCcw size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
          Payment Cancelled
        </h1>
        
        <p className="text-base text-slate-400 mb-8 leading-relaxed">
          No worries! Your payment was cancelled and you haven't been charged. We still appreciate you using SeeUI.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
        >
          <ArrowLeft size={16} />
          Return to SeeUI
        </Link>
      </div>
    </div>
  );
}
