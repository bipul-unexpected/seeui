import { useState } from 'react';
import { Client, Functions } from 'appwrite';
import { Heart, X, Loader2 } from 'lucide-react';

// ─── Appwrite SDK setup ────────────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

const functions = new Functions(client);

// ─── Config ────────────────────────────────────────────────────────────────────
const FUNCTION_ID = import.meta.env.VITE_APPWRITE_FUNCTION_ID || '';
const PRESET_AMOUNTS = [5, 10, 25, 50];
const MIN_AMOUNT = 5;

export default function DonateModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState(PRESET_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDonate = async () => {
    const finalAmount = isCustom ? parseFloat(customAmount) : amount;

    if (!finalAmount || finalAmount < MIN_AMOUNT) {
      setError(`Minimum donation is $${MIN_AMOUNT}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ── Call Appwrite Function via SDK ──────────────────────────────────────
      const execution = await functions.createExecution(
        FUNCTION_ID,
        JSON.stringify({ amount: Number(finalAmount) }), // Send dollars
        false,  // not async
        '/',    // path
        'POST', // method
        { 'Content-Type': 'application/json' }
      );

      // Parse the function response
      const response = JSON.parse(execution.responseBody);

      if (response.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error(response.error || 'No checkout URL returned');
      }
    } catch (err) {
      console.error('Donation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl p-6 md:p-8 animate-pop-in"
        style={{
          background:
            'linear-gradient(155deg, rgba(30,30,40,0.95) 0%, rgba(15,15,22,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow:
            '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          color: '#F8FAFC',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30">
            <Heart className="text-white fill-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Support SeeUI
          </h2>
          <p className="text-sm text-slate-400">
            SeeUI is free forever. If it saves you time, consider buying us a
            coffee to support development!
          </p>
        </div>

        {/* Preset amount buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setIsCustom(false);
                setAmount(preset);
                setError(null);
              }}
              className={`rounded-xl py-3 text-lg font-bold transition-all duration-200 ${
                !isCustom && amount === preset
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400/50'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 ring-1 ring-white/10'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div className="mb-6">
          <div
            className={`flex items-center rounded-xl p-1 transition-all duration-200 ${
              isCustom
                ? 'bg-white/10 ring-1 ring-indigo-400/50'
                : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10'
            }`}
            onClick={() => {
              setIsCustom(true);
              if (!customAmount) setCustomAmount('15');
            }}
          >
            <div
              className={`pl-4 font-bold ${isCustom ? 'text-white' : 'text-slate-400'}`}
            >
              $
            </div>
            <input
              type="number"
              min={MIN_AMOUNT}
              step="1"
              placeholder="Custom amount"
              value={isCustom ? customAmount : ''}
              onChange={(e) => {
                setIsCustom(true);
                setCustomAmount(e.target.value);
                setError(null);
              }}
              className="w-full bg-transparent px-2 py-2.5 font-bold text-white placeholder-slate-500 outline-none"
            />
          </div>
          {isCustom && parseFloat(customAmount) < MIN_AMOUNT && (
            <p className="mt-2 text-xs text-rose-400 pl-1">
              Minimum donation is ${MIN_AMOUNT}
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 ring-1 ring-rose-500/20 text-center">
            {error}
          </div>
        )}

        {/* Donate button */}
        <button
          onClick={handleDonate}
          disabled={
            loading || (isCustom && parseFloat(customAmount) < MIN_AMOUNT)
          }
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3.5 px-4 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Securely redirecting...</span>
              </>
            ) : (
              <>
                <span>
                  Donate ${isCustom ? customAmount || 0 : amount}
                </span>
                <Heart
                  size={16}
                  className="fill-white/20 transition-transform group-hover:scale-110"
                />
              </>
            )}
          </div>
          {/* Glass shine */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
        </button>

        <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Payments secured by Stripe
        </p>
      </div>
    </div>
  );
}
