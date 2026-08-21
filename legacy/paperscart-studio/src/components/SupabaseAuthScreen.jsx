import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Store,
  UserRound,
} from 'lucide-react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { getSelectableWorkspaceModeOptions } from '../utils/companyProfile';
import BackgroundVideo from './BackgroundVideo';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function toFriendlyAuthMessage(error) {
  const lowerMessage = String(error?.message || '').toLowerCase();
  if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('networkerror')) {
    return 'We could not reach the sign-in service. Please try again in a few minutes — your account and data are safe.';
  }
  return error?.message || 'Authentication failed.';
}

export default function SupabaseAuthScreen({ onBack }) {
  const { authError, isConfigured, signIn, signInWithGoogle, signUp } = useSupabaseAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceMode: 'freelance' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });

  const isSignup = mode === 'signup';
  const signupModes = getSelectableWorkspaceModeOptions();
  const cleanedEmail = form.email.trim().toLowerCase();
  const cleanedName = form.name.trim();
  const isEmailReady = EMAIL_PATTERN.test(cleanedEmail);
  const showEmailFormatHint = Boolean(cleanedEmail && !isEmailReady);
  const passwordChecks = useMemo(
    () => [
      { label: '8+ characters', met: form.password.length >= 8 },
      { label: 'Includes a letter', met: /[A-Za-z]/.test(form.password) },
      { label: 'Includes a number', met: /\d/.test(form.password) },
    ],
    [form.password]
  );
  const isPasswordReady = isSignup
    ? passwordChecks.every((check) => check.met)
    : form.password.length >= 8;
  const isFormReady = Boolean(
      isConfigured &&
      isEmailReady &&
      isPasswordReady &&
      (!isSignup || cleanedName)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormReady || submitting) return;

    setSubmitting(true);
    setNotice({ type: '', message: '' });

    try {
      if (!isEmailReady) {
        setNotice({ type: 'error', message: 'Enter a valid email address, for example name@gmail.com.' });
        return;
      }

      const payload = {
        ...form,
        email: cleanedEmail,
        name: cleanedName,
      };

      if (isSignup) {
        const result = await signUp(payload);
        if (!result.session) {
          setNotice({
            type: 'success',
            message: 'Account created. Check your email to confirm it, then sign in.',
          });
        }
      } else {
        await signIn(payload);
      }
    } catch (error) {
      setNotice({ type: 'error', message: toFriendlyAuthMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  // Google Identity Services: the official button posts back an ID-token
  // credential which our backend verifies (/api/auth/google). Mode and
  // workspace choice live in refs so the GIS callback sees current values.
  const googleButtonRef = useRef(null);
  const modeRef = useRef(mode);
  const workspaceModeRef = useRef(form.workspaceMode);
  modeRef.current = mode;
  workspaceModeRef.current = form.workspaceMode;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined') return undefined;
    let cancelled = false;

    const initializeGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setOauthSubmitting(true);
          setNotice({ type: '', message: '' });
          try {
            await signInWithGoogle({
              credential: response.credential,
              mode: modeRef.current,
              workspaceMode: workspaceModeRef.current,
            });
          } catch (error) {
            setNotice({ type: 'error', message: toFriendlyAuthMessage(error) });
          } finally {
            setOauthSubmitting(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
    } else {
      let script = document.querySelector(`script[src="${GSI_SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = GSI_SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', initializeGoogleButton);
      return () => {
        cancelled = true;
        script.removeEventListener('load', initializeGoogleButton);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [signInWithGoogle]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-slate-50 to-slate-100 px-4 py-6 text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-1 text-sm font-semibold text-slate-600 hover:text-emerald-700"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden border-b border-slate-200 bg-brand-900 p-6 text-white sm:p-8 lg:border-b-0 lg:border-r">
            <BackgroundVideo
              src="/12084639-uhd_2560_1440_60fps.mp4"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-900/85 via-brand-900/80 to-brand-950/92" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-center">
                <div className="rounded-xl bg-white px-3 py-2 shadow-lg">
                  <img
                    src="/paperscart-logo.png"
                    alt="PapersCart"
                    className="h-8 w-auto max-w-[160px] object-contain"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-white/75">Agreements and paperwork — ready to send</p>

              <h1 className="mt-8 max-w-md text-3xl font-black tracking-tight sm:text-4xl">
                Create, save, and send paperwork from one account.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Start with the freelancer dashboard today. Your profile, clients, documents, and download history stay organized for repeat work.
              </p>

              <div className="mt-7 grid gap-3 text-sm text-slate-200">
                {[
                  ['Reusable client cards', 'Save client details once and use them across invoices, agreements, and timelines.'],
                  ['PDF-ready documents', 'Preview every document live before downloading or emailing it.'],
                  ['History that stays', 'Downloaded paperwork stays in history until you delete it.'],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} />
                      <div>
                        <p className="font-black text-white">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <ShieldCheck size={14} />
                  Secure sign in
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <FileText size={14} />
                  Freelancer mode live
                </span>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              {[
                { id: 'signin', label: 'Sign in' },
                { id: 'signup', label: 'Create account' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    setNotice({ type: '', message: '' });
                  }}
                  className={`rounded-lg px-3 py-2.5 text-sm font-black transition-colors ${
                    mode === item.id
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-black text-slate-950">
              {isSignup ? 'Create your PapersCart account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isSignup
                ? 'Set up your workspace once, then reuse your profile and clients for every document.'
                : 'Sign in to continue with your saved freelancer dashboard.'}
            </p>

            {(notice.message || authError) && (
              <div
                className={`mt-5 rounded-lg border px-3 py-2 text-sm ${
                  notice.type === 'error' || authError
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                {notice.message || authError}
              </div>
            )}

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="mt-6 flex min-h-[44px] items-center justify-center">
                  {oauthSubmitting && (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Loader2 size={18} className="animate-spin text-emerald-700" />
                      Signing in with Google...
                    </span>
                  )}
                  <div ref={googleButtonRef} className={oauthSubmitting ? 'hidden' : ''} />
                </div>

                <div className="my-5 flex items-center gap-3 text-xs font-black uppercase tracking-wide text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span>or use email</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-slate-700">Name</span>
                    <span className="relative block">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        className="w-full rounded-xl border border-slate-300 px-10 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="Your full name"
                      />
                    </span>
                  </label>

                  <div>
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Choose workspace</span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {signupModes.map((option) => {
                        const selected = form.workspaceMode === option.id;
                        const Icon = option.id === 'business' ? Store : Briefcase;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, workspaceMode: option.id }))}
                            className={`rounded-xl border p-3 text-left transition-colors ${
                              selected
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="flex items-center gap-2 text-sm font-black">
                              <Icon size={17} />
                              {option.label}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                    autoCapitalize="none"
                    autoComplete="email"
                    aria-invalid={showEmailFormatHint ? 'true' : 'false'}
                    className={`w-full rounded-xl border px-10 py-3 text-sm font-semibold outline-none transition ${
                      showEmailFormatHint
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                    }`}
                    placeholder="you@company.com"
                  />
                </span>
                {showEmailFormatHint && (
                  <span className="mt-1 block text-xs font-semibold text-red-600">
                    Use a full email address, for example name@gmail.com.
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    className="w-full rounded-xl border border-slate-300 px-10 py-3 pr-12 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              {isSignup && (
                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-600 sm:grid-cols-3">
                  {passwordChecks.map((check) => (
                    <span
                      key={check.label}
                      className={`inline-flex items-center gap-1.5 ${check.met ? 'text-emerald-700' : 'text-slate-500'}`}
                    >
                      <CheckCircle2 size={14} />
                      {check.label}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormReady || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {submitting ? 'Please wait...' : isSignup ? 'Create account' : 'Open dashboard'}
              </button>

              {!isSignup && (
                <p className="text-center text-xs font-medium text-slate-500">
                  New here? Use <button type="button" onClick={() => setMode('signup')} className="font-black text-emerald-700 hover:text-emerald-800">Create account</button> to start your freelancer workspace.
                </p>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
