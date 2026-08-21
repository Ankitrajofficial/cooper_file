import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  History,
  KeyRound,
  Layers3,
  Loader2,
  Menu,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const accountTypes = [
  {
    id: 'freelancer',
    label: 'Freelancer',
    icon: UserRound,
    description: 'Solo operators managing invoices, receipts, and client work.',
  },
  {
    id: 'agency',
    label: 'Agency',
    icon: BriefcaseBusiness,
    description: 'Studios and teams handling multiple clients under one account.',
  },
  {
    id: 'business',
    label: 'General Business',
    icon: Building2,
    description: 'Shops, consultants, and service businesses issuing business documents.',
  },
];

const workspaceHighlights = [
  {
    label: 'Protected workspace',
    description: 'Every account keeps documents, client details, and business profile data scoped to the signed-in user.',
    icon: ShieldCheck,
  },
  {
    label: 'Reusable profile',
    description: 'Save your business identity once and reuse it across invoices, receipts, agreements, and timelines.',
    icon: Layers3,
  },
  {
    label: 'Document history',
    description: 'Return to previous documents without rebuilding the same client or project details again.',
    icon: History,
  },
];

const navLinks = [
  { href: '#auth', label: 'Sign in' },
  { href: '#overview', label: 'Overview' },
  { href: '#how-it-works', label: 'How it works' },
];

const workflowSteps = [
  'Create or sign in to your protected workspace.',
  'Save your business profile once for repeat use.',
  'Choose a document type, fill in client details, and generate the final file.',
];

const demoAccount = {
  name: 'Demo Workspace',
  email: 'demo@businessdocs.local',
  password: 'DemoPass123',
  accountType: 'business',
};

function getSubmitLabel(mode, loading) {
  if (loading) return mode === 'signup' ? 'Creating account...' : 'Signing in...';
  return mode === 'signup' ? 'Create account' : 'Sign in';
}

function GoogleMark({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-.8 2.3-1.7 3.1l2.8 2.2c1.7-1.5 2.6-3.9 2.6-6.7 0-.6-.1-1.3-.2-1.8H12Z"
      />
      <path
        fill="#34A853"
        d="M12 21c2.4 0 4.5-.8 6-2.2l-2.8-2.2c-.8.5-1.8.9-3.2.9-2.5 0-4.6-1.7-5.3-4H3.8v2.3A9 9 0 0 0 12 21Z"
      />
      <path
        fill="#FBBC05"
        d="M6.7 13.5a5.4 5.4 0 0 1 0-3.4V7.8H3.8a9 9 0 0 0 0 8l2.9-2.3Z"
      />
      <path
        fill="#4285F4"
        d="M12 6.5c1.3 0 2.5.5 3.4 1.3l2.5-2.5A8.7 8.7 0 0 0 12 3a9 9 0 0 0-8.2 4.8l2.9 2.3c.7-2.3 2.8-3.6 5.3-3.6Z"
      />
    </svg>
  );
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Sign-In is only available in the browser.'));
      return;
    }
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existingScript = document.querySelector('script[data-google-identity="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', () => reject(new Error('Google Sign-In failed to load.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google Sign-In failed to load.'));
    document.head.appendChild(script);
  });
}

export default function AuthScreen() {
  const { status, apiAvailable, connectivity, googleClientId, login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    accountType: 'freelancer',
  });
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const googleButtonRef = useRef(null);
  const googleStateRef = useRef({ mode: 'login', accountType: 'freelancer' });
  const googleInitializedRef = useRef(false);

  const unavailable = status === 'unavailable' || !apiAvailable;
  const isSignup = mode === 'signup';

  const activeAccount = useMemo(
    () => accountTypes.find((item) => item.id === form.accountType) || accountTypes[0],
    [form.accountType]
  );

  useEffect(() => {
    googleStateRef.current = { mode, accountType: form.accountType };
  }, [form.accountType, mode]);

  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current || unavailable) return undefined;

    let cancelled = false;

    async function initGoogle() {
      try {
        const google = await loadGoogleScript();
        if (cancelled || !googleButtonRef.current) return;

        if (!googleInitializedRef.current) {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async ({ credential }) => {
              if (!credential) return;
              const { mode: currentMode, accountType } = googleStateRef.current;
              setGoogleLoading(true);
              setError('');
              try {
                await loginWithGoogle({
                  credential,
                  mode: currentMode,
                  accountType,
                });
              } catch (submitError) {
                setError(submitError.message || 'Google sign-in failed.');
              } finally {
                setGoogleLoading(false);
              }
            },
          });
          googleInitializedRef.current = true;
        }

        googleButtonRef.current.innerHTML = '';
        const buttonWidth = Math.min(400, Math.max(240, Math.floor(googleButtonRef.current.clientWidth || 320)));
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: buttonWidth,
          text: isSignup ? 'signup_with' : 'signin_with',
          shape: 'pill',
        });
      } catch (scriptError) {
        if (!cancelled) {
          setError(scriptError.message || 'Google Sign-In failed to load.');
        }
      }
    }

    initGoogle();

    return () => {
      cancelled = true;
    };
  }, [googleClientId, isSignup, loginWithGoogle, unavailable]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (unavailable) return;

    setSubmitting(true);
    setError('');

    try {
      if (isSignup) {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          accountType: form.accountType,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    if (unavailable) return;

    setDemoLoading(true);
    setError('');

    try {
      await login({
        email: demoAccount.email,
        password: demoAccount.password,
      });
    } catch (loginError) {
      try {
        await register(demoAccount);
      } catch (registerError) {
        setError(registerError.message || loginError.message || 'Demo login failed.');
      }
    } finally {
      setDemoLoading(false);
    }
  };

  const handleNavClick = (event, href) => {
    event.preventDefault();
    setMenuOpen(false);

    const target = document.querySelector(href);
    if (!target) return;

    window.history.replaceState(null, '', href);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fb] text-slate-900">
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(135deg,_rgba(16,185,129,0.14),_rgba(59,130,246,0.10)_48%,_rgba(245,158,11,0.12))]" />
      <main className="relative mx-auto flex min-h-screen w-full min-w-0 max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="relative flex min-w-0 items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
              <ReceiptText size={21} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-950">PapersCart</p>
              <p className="truncate text-xs font-medium text-slate-500">Secure document operations</p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary navigation">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
            <div className="ml-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Workspace ready
            </div>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm md:hidden"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-14 z-20 rounded-lg border border-slate-200 bg-white p-2 shadow-xl md:hidden">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className="block rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-8 py-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-8 xl:gap-10">
          <section id="overview" className="order-2 w-full min-w-0 max-w-full lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-3 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm">
              <Sparkles size={16} />
              SaaS workspace for service businesses
            </div>

            <h1 className="mt-5 max-w-full text-3xl font-black leading-tight tracking-tight text-slate-950 sm:max-w-3xl sm:text-5xl sm:leading-[1.04] lg:text-[3.45rem]">
              One secure workspace for every business document you send.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Create invoices, receipts, agreements, timelines, lead sheets, and QR cards from a protected account with reusable business data and saved history.
            </p>

            <div className="mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['6', 'document types'],
                ['1', 'business profile'],
                ['100%', 'user-scoped'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-2xl font-black text-slate-950">{value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 hidden gap-3 sm:grid lg:grid-cols-3">
              {workspaceHighlights.map(({ label, description, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                      <Icon size={18} />
                    </span>
                    <h2 className="text-sm font-bold text-slate-950">{label}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>

            {isSignup && (
              <div className="mt-5 hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:block sm:p-5">
                <p className="text-sm font-bold text-slate-950">Workspace type</p>
                <p className="mt-1 text-sm text-slate-500">Choose the closest fit so defaults match your work.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {accountTypes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, accountType: id }))}
                      className={`rounded-lg border p-4 text-left transition ${
                        activeAccount.id === id
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={20} className={activeAccount.id === id ? 'text-emerald-700' : 'text-slate-600'} />
                      <h3 className="mt-3 text-sm font-bold">{label}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section id="auth" className="order-1 grid w-full min-w-0 max-w-full gap-5 lg:order-2 lg:grid-cols-1">
            <div className="w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/80 sm:p-6">
            <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
              {[
                { id: 'login', label: 'Sign in' },
                { id: 'signup', label: 'Create account' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    setError('');
                  }}
                  className={`min-w-0 flex-1 rounded-md px-2 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
                    mode === item.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <span className="block truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                {isSignup ? 'Create your workspace' : 'Welcome back'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {isSignup
                  ? 'Start a secure workspace for your invoices, receipts, agreements, and timelines.'
                  : 'Sign in to continue to your protected business workspace.'}
              </p>
            </div>

            {unavailable && (
              <div className="mb-5 break-words rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Backend auth is not configured. Set `VITE_API_URL=http://localhost:3001` in the frontend `.env`, run the server, and refresh.
              </div>
            )}

            {!unavailable && connectivity === 'server_unreachable' && (
              <div className="mb-5 break-words rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                The auth server is not reachable right now. Make sure the backend is running on `http://localhost:3001`.
              </div>
            )}

            {error && (
              <div className="mb-5 break-words rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignup && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="John Doe"
                    disabled={submitting || unavailable}
                    required={isSignup}
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="you@company.com"
                  disabled={submitting || unavailable}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Minimum 8 characters"
                  disabled={submitting || unavailable}
                  required
                />
              </div>

              {isSignup && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Account type</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {accountTypes.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, accountType: id }))}
                        disabled={submitting || unavailable}
                        className={`rounded-lg border px-4 py-3 text-left transition ${
                          form.accountType === id
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        <Icon size={18} />
                        <div className="mt-2 text-sm font-semibold">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || unavailable}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                {getSubmitLabel(mode, submitting)}
              </button>
            </form>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={submitting || demoLoading || unavailable}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {demoLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {demoLoading ? 'Opening demo workspace...' : 'Use demo login'}
            </button>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {googleClientId ? (
              <>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <GoogleMark className="h-5 w-5" />
                  <span>Continue with Google</span>
                </div>
                <div
                  ref={googleButtonRef}
                  className={`min-h-[44px] overflow-hidden rounded-lg ${googleLoading ? 'opacity-70 pointer-events-none' : ''}`}
                />
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {isSignup
                    ? 'Your selected account type will be used if this is your first Google sign-in.'
                    : 'If you are new here, switch to Create account before using Google so you can choose your account type.'}
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 opacity-80"
                >
                  <GoogleMark className="h-5 w-5" />
                  Continue with Google
                </button>
                <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Add `VITE_GOOGLE_CLIENT_ID` in the frontend `.env` and `GOOGLE_CLIENT_ID` in `server/.env` to enable Google sign-in.
                </p>
              </>
            )}
          </div>
        </section>
        </div>

        <section id="how-it-works" className="pb-8">
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <FileText size={20} />
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">About this website</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                PapersCart helps freelancers, agencies, and service businesses create reusable business documents from one account-based workspace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                    {index + 1}
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
