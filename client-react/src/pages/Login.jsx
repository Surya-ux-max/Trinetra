import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, AlertTriangle, CheckCircle, Eye, ArrowLeft } from 'lucide-react';
import WavingFlag from '../components/common/WavingFlag';
import bgImage from '../assets/Whisk_54c36f1bcedc83eb4a841dda23105503dr.jpeg';

const CORRECT_PIN = '000000';

export default function Login() {
  const navigate = useNavigate();
  const [pin, setPin]         = useState('');
  const [attempts, setAttempts] = useState(3);
  const [status, setStatus]   = useState({ message: 'Enter 6-digit authorization code', isError: false });
  const [shake, setShake]     = useState(false);
  const [locked, setLocked]   = useState(false);
  const [success, setSuccess] = useState(false);

  const pressKey = (key) => {
    if (locked || success) return;
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
    } else if (key === 'enter') {
      if (pin.length < 6) {
        setStatus({ message: 'Incomplete — enter 6 digits', isError: true });
        return;
      }
      verifyPin();
    } else {
      if (pin.length >= 6) return;
      setPin(p => p + key);
    }
  };

  const verifyPin = () => {
    if (pin === CORRECT_PIN) {
      setSuccess(true);
      setStatus({ message: 'Access Granted — Redirecting...', isError: false });
      setTimeout(() => navigate('/dashboard'), 1500);
      return;
    }
    const left = attempts - 1;
    setAttempts(left);
    setStatus({
      message: left > 0
        ? `Invalid PIN — ${left} attempt${left !== 1 ? 's' : ''} remaining`
        : 'ACCESS DENIED — TERMINAL LOCKED',
      isError: true,
    });
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
      if (left > 0) setStatus({ message: 'Enter 6-digit authorization code', isError: false });
      else setLocked(true);
    }, 1600);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (locked || success) return;
      if (e.key >= '0' && e.key <= '9') pressKey(e.key);
      else if (e.key === 'Backspace') pressKey('del');
      else if (e.key === 'Enter') pressKey('enter');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pin, locked, attempts, success]);

  useEffect(() => {
    if (pin.length === 6 && !success) setTimeout(verifyPin, 280);
  }, [pin]);

  const dotColor = (i) => {
    if (i >= pin.length) return 'border-white/20 bg-transparent';
    if (success)  return 'bg-emerald-400 border-emerald-400 shadow-[0_0_12px_#34d399]';
    if (shake)    return 'bg-red-500 border-red-500 shadow-[0_0_12px_#ef4444]';
    return 'bg-white border-white shadow-[0_0_12px_rgba(255,255,255,0.6)]';
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

      {/* ── Full-page background image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Light overlay — keep image visible */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/60" />

      {/* Classification bar */}
      <div className="absolute top-0 left-0 right-0 bg-red-900/80 backdrop-blur-sm py-1.5 z-20 text-center">
        <span className="font-mono text-[9px] tracking-[3px] uppercase text-white/90">
          TOP SECRET · NUCLEAR COMMAND AUTHORITY · MINISTRY OF DEFENCE · GOVERNMENT OF INDIA
        </span>
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="absolute top-10 left-8 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Flag + branding top-right */}
      <div className="absolute top-10 right-8 z-20 flex items-center gap-3">
        <WavingFlag width={56} height={40} />
        <div>
          <div className="font-display font-bold text-base tracking-widest text-white">TRINETRA</div>
          <div className="font-mono text-[8px] text-white/40 uppercase tracking-widest">Secure Portal</div>
        </div>
      </div>

      {/* ── Login card ── */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 mt-8 ${shake ? 'animate-shake' : ''}`}
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />

        {/* Lock icon */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: success ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${success ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`,
              boxShadow: success ? '0 0 30px rgba(16,185,129,0.3)' : '0 0 30px rgba(255,255,255,0.05)',
              transition: 'all 0.4s ease',
            }}
          >
            {success
              ? <CheckCircle className="w-10 h-10 text-emerald-400" />
              : <Lock className="w-10 h-10 text-white" />
            }
          </div>
          <h1 className="font-display text-2xl font-bold text-white tracking-widest uppercase mb-1">
            Secure Access
          </h1>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-[3px]">
            Authorization Required
          </p>
        </div>

        {/* Officer ID */}
        <div
          className="flex justify-between items-center px-4 py-3 rounded-xl mb-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Officer ID</span>
          <span className="font-mono text-xs text-white/80 tracking-widest">IND-BSF-CMD-0047</span>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-3">
          {[0,1,2,3,4,5].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${dotColor(i)}`}
            />
          ))}
        </div>

        {/* Status */}
        <div className="text-center mb-6 h-5">
          <p className={`font-mono text-[10px] uppercase tracking-wider ${
            success ? 'text-emerald-400' : status.isError ? 'text-red-400' : 'text-white/40'
          }`}>
            {status.message}
          </p>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {['1','2','3','4','5','6','7','8','9'].map(n => (
            <button
              key={n}
              onClick={() => pressKey(n)}
              disabled={locked || success}
              className="h-14 rounded-xl font-display font-bold text-xl text-white transition-all duration-150 active:scale-95 disabled:opacity-30"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => pressKey('del')}
            disabled={locked || success}
            className="h-14 rounded-xl font-display font-bold text-lg text-white/60 transition-all duration-150 active:scale-95 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            ⌫
          </button>

          <button
            onClick={() => pressKey('0')}
            disabled={locked || success}
            className="h-14 rounded-xl font-display font-bold text-xl text-white transition-all duration-150 active:scale-95 disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            0
          </button>

          <button
            onClick={() => pressKey('enter')}
            disabled={locked || success}
            className="h-14 rounded-xl font-display font-bold text-xs tracking-widest text-white transition-all duration-150 active:scale-95 disabled:opacity-30"
            style={{
              background: success ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${success ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.2)'}`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = success ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}
          >
            ENTER
          </button>
        </div>

        {/* Attempts */}
        <div className="text-center mb-5">
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
            Attempts remaining: <span className={`font-bold ${attempts <= 1 ? 'text-red-400' : 'text-white/60'}`}>{attempts}</span>
          </span>
        </div>

        {/* Warning */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <AlertTriangle className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" />
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-wider leading-relaxed">
            Unauthorized access attempts are logged and prosecuted under IT Act 2000
          </p>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 mt-5 pt-5 border-t border-white/8">
          {[
            { icon: Shield, label: '256-bit AES' },
            { icon: Lock,   label: 'MFA Enabled' },
            { icon: Eye,    label: 'Monitored' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <item.icon className="w-3 h-3 text-white/25" />
              <span className="font-mono text-[8px] text-white/25 uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
