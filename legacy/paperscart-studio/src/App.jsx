import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  ExternalLink,
  FileSignature,
  FileText,
  LayoutGrid,
  LogOut,
  Mail,
  QrCode,
  Receipt,
  Share2,
  Settings,
  Sparkles,
  UserRound,
  History as HistoryIcon,
  Menu,
  X,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import {
  BusinessDataProvider,
  createDefaultAgreement,
  createDefaultInvoice,
  createDefaultTimeline,
  useBusinessData,
} from './context/BusinessDataContext';
import DocumentTypeSelector from './components/DocumentTypeSelector';
import PdfThemePicker from './components/PdfThemePicker';
import { ProfileArt, PayArt, ThemeArt, PrivateArt } from './components/FeatureArt';
import BackgroundVideo from './components/BackgroundVideo';
import CompanyProfileForm from './components/CompanyProfileForm';
import WorkspaceModePanel from './components/WorkspaceModePanel';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import AgreementForm from './components/AgreementForm';
import AgreementPreview from './components/AgreementPreview';
import ScopeForm from './components/ScopeForm';
import ScopePreview from './components/ScopePreview';
import TimelineForm from './components/TimelineForm';
import TimelinePreview from './components/TimelinePreview';
import LeadSheetForm from './components/LeadSheetForm';
import LeadSheetPreview from './components/LeadSheetPreview';
import DocumentHistory from './components/DocumentHistory';
import AccountSettingsModal from './components/AccountSettingsModal';
import SendPaperworkModal from './components/SendPaperworkModal';
import AiPaperworkModal from './components/AiPaperworkModal';
import QRCardForm from './components/QRCardForm';
import QRCardPreview from './components/QRCardPreview';
import ShippingLabelForm from './components/ShippingLabelForm';
import ShippingLabelPreview from './components/ShippingLabelPreview';
import InvoiceTemplateForm from './components/InvoiceTemplateForm';
import SupabaseAuthScreen from './components/SupabaseAuthScreen';
import AdSenseSlot from './components/AdSenseSlot';
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext';
import {
  COMPANY_PROFILE_FIELDS,
  getCompanyDisplayProfile,
  getCompanyProfileCompletion,
  normalizeDeployableWorkspaceMode,
  normalizeWorkspaceMode,
} from './utils/companyProfile';
import { readStoredCompanyProfile } from './utils/profileStorage';
import { clearStoredDocumentDrafts } from './utils/documentDraftStorage';
import {
  getDocumentDataByType,
  getDocumentHistoryDuplicateKey,
  getDocumentHistoryLabel,
  getDocumentHistoryMeta,
} from './utils/documentHistoryMetadata';
import { getHistory, saveToHistory, updateHistoryEntry } from './utils/historyStorage';
import { createLocalInvoiceNumber, getNextInvoiceNumber } from './utils/invoiceNumberService';
import { getInvoiceTotals } from './utils/invoiceMath';
import {
  isPaperworkEmailApiConfigured,
  isWelcomeEmailApiConfigured,
  sendPaperworkEmail,
  sendWelcomeEmail,
} from './utils/emailService';
import {
  getLocalCompanyProfileFallback,
  loadSupabaseCompanyProfile,
  saveSupabaseCompanyProfile,
} from './utils/supabaseProfileStorage';
import AccountSetupPage from './pages/AccountSetupPage';
import AgencyComingSoonPage from './pages/AgencyComingSoonPage';
import HubChooserPage from './pages/HubChooserPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import FreelanceDashboardPage from './pages/FreelanceDashboardPage';

function LandingPage({ isSignedIn, onSignOut, onStart, user }) {
  const documents = [
    { title: 'Client invoices', description: 'Send GST-ready invoices with a UPI pay-now QR, so clients can pay you the moment they open it.', icon: Receipt },
    { title: 'Contracts & agreements', description: 'Lock scope, deliverables and payment terms before you start — a clean contract, no lawyer needed.', icon: FileSignature },
    { title: 'Project timelines', description: 'Share a milestone timeline so clients always know what is coming, when, and what is done.', icon: CalendarClock },
  ];

  const features = [
    { title: 'One profile, every client', description: 'Add your logo, address and UPI details once. Every invoice and contract fills itself in — no retyping per client.', art: ProfileArt },
    { title: 'Get paid faster', description: 'Every invoice carries a UPI pay-now QR. Clients scan and pay in seconds — no bank details to share.', art: PayArt },
    { title: 'Look the part', description: 'Pick a colour theme once and every document matches your brand. Polished work gets taken seriously.', art: ThemeArt },
    { title: 'Yours and private', description: 'Documents are made right in your browser. No client data leaves your device.', art: PrivateArt },
  ];

  const steps = [
    {
      title: 'Set up your profile',
      description: 'Add your name, logo, UPI, bank details, and brand colour once.',
      result: 'Every new document starts branded.',
      meta: 'One-time setup',
      icon: Settings,
    },
    {
      title: 'Pick a document & add the client',
      description: 'Choose an invoice, agreement, or timeline, then fill the project details.',
      result: 'Client information stays consistent.',
      meta: '2-3 minute draft',
      icon: FileText,
    },
    {
      title: 'Send a polished PDF',
      description: 'Download a print-ready PDF, email it, or keep it ready for the next project.',
      result: 'Clean paperwork without redesigning.',
      meta: 'Ready to share',
      icon: Download,
    },
  ];

  const guides = [
    {
      title: 'Invoice generator guide',
      description: 'Create cleaner freelancer invoices with GST fields, discounts, UPI payment QR, and PDF downloads.',
      href: '/guides/invoice-generator/',
      label: 'Invoices',
      readTime: '5 min read',
      icon: Receipt,
    },
    {
      title: 'Freelance agreement guide',
      description: 'Understand project scope, deliverables, payment terms, timelines, and signature-ready agreement basics.',
      href: '/guides/freelance-agreement/',
      label: 'Agreements',
      readTime: '6 min read',
      icon: FileSignature,
    },
    {
      title: 'Project timeline guide',
      description: 'Share milestones, delivery status, and review dates with clients before confusion starts.',
      href: '/guides/project-timeline/',
      label: 'Timelines',
      readTime: '4 min read',
      icon: CalendarClock,
    },
  ];

  const trustPoints = ['No subscription', 'GST & UPI ready', 'Built for freelancers'];

  const primaryCtaLabel = isSignedIn ? 'Open workspace' : 'Get started free';

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <img
                src="/paperscart-logo.png"
                alt="PapersCart"
                className="h-8 w-auto max-w-[150px] object-contain sm:h-9 sm:max-w-[170px]"
              />
              <p className="text-xs font-medium text-black/50">Agreements and paperwork — ready to send</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-black/60 md:flex">
            <a href="#documents" className="transition-colors hover:text-brand-700">Documents</a>
            <a href="#features" className="transition-colors hover:text-brand-700">Features</a>
            <a href="#guide" className="transition-colors hover:text-brand-700">How it works</a>
            <a href="#guides" className="transition-colors hover:text-brand-700">Guides</a>
            <a href="#company" className="transition-colors hover:text-brand-700">Company</a>
            {isSignedIn && (
              <span className="max-w-[180px] truncate rounded-full bg-black/5 px-3 py-1.5 text-xs text-black/60">
                {user?.email}
              </span>
            )}
            <button
              type="button"
              onClick={onStart}
              className="rounded-lg bg-brand-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              {isSignedIn ? 'Open app' : 'Sign in'}
            </button>
            {isSignedIn && (
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-lg border border-black/15 px-3 py-2 text-black/70 transition-colors hover:border-red-200 hover:text-red-700"
              >
                Sign out
              </button>
            )}
          </nav>
          <button
            type="button"
            onClick={onStart}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 md:hidden"
          >
            {isSignedIn ? 'Open' : 'Sign in'}
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative flex min-h-[70vh] items-center overflow-hidden">
          {/* Video background */}
          <BackgroundVideo
            src="/12084639-uhd_2560_1440_60fps.mp4"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          {/* Brand-green tint + bottom fade for text readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/65 to-brand-900/35" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
                <Sparkles size={15} />
                Made for freelancers
              </div>
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
                Invoices &amp; contracts that get you{' '}
                <span className="text-brand-300">paid</span>.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
                Freelancing is the fun part — the invoices, contracts and follow-ups aren't. Create polished,
                GST-ready paperwork with your branding and a UPI pay-now QR, so clients take you seriously and
                pay you faster.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onStart}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-brand-700"
                >
                  {primaryCtaLabel}
                  <ArrowRight size={18} />
                </button>
                <a
                  href="#documents"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <BookOpen size={18} />
                  See what you can make
                </a>
              </div>
              <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
                {trustPoints.map((point) => (
                  <li key={point} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/85">
                    <CheckCircle2 size={16} className="text-brand-300" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Product mock: a mini invoice */}
            <div className="relative">
              <div className="mx-auto w-full max-w-md rotate-1 rounded-2xl border border-black/10 bg-white shadow-2xl transition-transform hover:rotate-0">
                <div className="flex items-start justify-between rounded-t-2xl bg-brand-600 px-6 py-5 text-white">
                  <div>
                    <div className="h-2.5 w-24 rounded bg-white/80" />
                    <div className="mt-2 h-2 w-16 rounded bg-white/40" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black uppercase tracking-wide">Invoice</p>
                    <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">#INV-014</span>
                  </div>
                </div>
                <div className="space-y-3 px-6 py-5">
                  <div className="flex items-center justify-between text-xs text-black/40">
                    <span>Bill To</span><span>Issued On</span>
                  </div>
                  <div className="h-2.5 w-32 rounded bg-black/10" />
                  <div className="mt-4 overflow-hidden rounded-lg">
                    <div className="flex items-center justify-between bg-brand-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white">
                      <span>Description</span><span>Total</span>
                    </div>
                    {[0, 1, 2].map((row) => (
                      <div key={row} className={`flex items-center justify-between px-3 py-2 ${row % 2 ? 'bg-black/[0.03]' : 'bg-white'}`}>
                        <div className="h-2 w-28 rounded bg-black/10" />
                        <div className="h-2 w-12 rounded bg-black/10" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-black/10 bg-white">
                      <QrCode size={36} className="text-black" />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-brand-600 px-4 py-3 text-white">
                      <span className="text-xs font-bold uppercase tracking-wide">Total</span>
                      <span className="text-lg font-black">₹23,600</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-black/10 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-black/10 px-px sm:grid-cols-4">
            {[
              { k: 'Free', v: 'No subscription' },
              { k: 'UPI', v: 'Pay-now QR' },
              { k: 'GST', v: 'Ready invoices' },
              { k: '1-click', v: 'PDF export' },
            ].map((stat) => (
              <div key={stat.v} className="bg-white px-4 py-6 text-center">
                <p className="text-2xl font-black text-brand-600">{stat.k}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-black/50">{stat.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section id="documents" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">For freelancers</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-brand-800 sm:text-4xl">Every document a client project needs</h2>
            <p className="mt-3 text-base leading-7 text-black/60">From the contract that kicks things off to the invoice that gets you paid — all branded and consistent.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map(({ title, description, icon: Icon }) => (
              <div key={title} className="group rounded-2xl border border-black/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brand-800">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-black/60">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-black/10 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Why freelancers use it</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-brand-800 sm:text-4xl">Less admin, more billable hours</h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {features.map(({ title, description, art: Art }) => (
                <div key={title} className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
                  <div className="h-44 w-full border-b border-black/10 bg-brand-50">
                    <Art />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-brand-800">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-black/60">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="guide" className="border-y border-black/10 bg-[#f7fbf8]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold uppercase text-brand-700">How it works</p>
              <h2 className="mt-3 max-w-xl text-3xl font-black text-brand-900 sm:text-4xl">
                From blank page to client-ready paperwork.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-black/60">
                PapersCart keeps the process tight: save your business details once, create the right document, then send a polished PDF without rebuilding the layout.
              </p>
              <div className="mt-7 grid max-w-lg grid-cols-2 gap-3 text-sm">
                {['Branded by default', 'UPI payment ready', 'PDF export built in', 'Reusable client details'].map((point) => (
                  <div key={point} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 font-semibold text-black/70">
                    <CheckCircle2 size={16} className="shrink-0 text-brand-600" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onStart}
                className="mt-8 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Start a document
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="grid gap-4">
              {steps.map(({ title, description, result, meta, icon: Icon }, index) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-4 sm:w-52">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <Icon size={22} />
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase text-black/35">Step {index + 1}</p>
                        <p className="mt-1 text-sm font-bold text-brand-700">{meta}</p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black text-brand-900">{title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-black/60">{description}</p>
                    </div>
                    <div className="rounded-lg bg-black/[0.03] px-4 py-3 text-sm font-semibold leading-6 text-black/65 sm:w-56">
                      {result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="guides" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase text-brand-700">Guides</p>
                <h2 className="mt-3 text-3xl font-black text-brand-900 sm:text-4xl">Learn the paperwork workflow</h2>
                <p className="mt-3 text-base leading-7 text-black/60">
                  Practical notes for freelancers who want invoices, agreements, and timelines that clients can understand quickly.
                </p>
              </div>
              <a
                href="/guides/"
                className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-black/70 transition-colors hover:border-brand-200 hover:text-brand-700"
              >
                View all guides
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {guides.map(({ title, description, href, label, readTime, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="group flex min-h-[260px] flex-col rounded-xl border border-black/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      <Icon size={22} />
                    </span>
                    <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-bold text-black/55">{readTime}</span>
                  </div>
                  <div className="mt-6">
                    <p className="text-xs font-black uppercase text-brand-700">{label}</p>
                    <h3 className="mt-2 text-xl font-black text-brand-900 group-hover:text-brand-700">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/60">{description}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 pt-7 text-sm font-black text-brand-700">
                    Read guide <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <AdSenseSlot
          slot={import.meta.env.VITE_ADSENSE_HOMEPAGE_SLOT}
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        />

        {/* Company */}
        <section id="company" className="border-b border-black/10 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Company</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-brand-800 sm:text-4xl">A product of AR Group</h2>
              <p className="mt-3 text-base leading-7 text-black/60">
                PapersCart is built by <span className="font-semibold text-black">AR Group</span> — we
                build practical, no-friction software for Indian businesses. Here's what else we make.
              </p>
              <p className="mt-3 text-sm leading-6 text-black/55">
                PapersCart is sometimes searched as PaperCart, papercart, paper cart, or PaperCard. The product name is PapersCart, and it is focused on invoices, agreements, project timelines, and client-ready paperwork.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                    <FileText size={20} />
                  </span>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">You're here</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-brand-800">PapersCart</h3>
                <p className="mt-1.5 text-sm leading-6 text-black/60">
                  Branded invoices, contracts and timelines for freelancers — ready to send in minutes.
                </p>
              </div>
              <a
                href="https://inook.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-black/10 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-black/10">
                    <svg viewBox="0 0 100 100" className="h-7 w-7" fill="#29b765" aria-hidden="true">
                      <path d="M50 16 84 82 60 82 50 52 40 82 16 82Z" />
                      <path d="M50 58 58 82 42 82Z" />
                    </svg>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700">
                    inook.in <ExternalLink size={13} />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-brand-800 group-hover:text-brand-700">inook ai</h3>
                <p className="mt-1.5 text-sm leading-6 text-black/60">
                  Our AI product, live now at inook.in. Visit the site to explore what it does.
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-600 px-6 py-16 text-center shadow-xl sm:px-12">
            {/* Video background */}
            <BackgroundVideo
              src="/12084639-uhd_2560_1440_60fps.mp4"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            {/* Brand-green tint so white text stays readable */}
            <div className="pointer-events-none absolute inset-0 bg-brand-700/80" />
            <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Spend less time on paperwork, more on the work you love
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-base leading-7 text-white/85">
              Set up your profile once and send polished invoices, contracts and timelines to every client — free.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-black text-brand-700 shadow-sm transition-transform hover:scale-[1.02]"
            >
              {primaryCtaLabel}
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div>
              <img src="/paperscart-logo.png" alt="PapersCart" className="h-7 w-auto max-w-[140px] object-contain" />
              <p className="text-xs text-black/50">An AR Group company · Made in India 🇮🇳</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold text-black/60">
            <a href="#documents" className="hover:text-brand-700">Documents</a>
            <a href="#features" className="hover:text-brand-700">Features</a>
            <a href="#guides" className="hover:text-brand-700">Guides</a>
            <a href="#company" className="hover:text-brand-700">Company</a>
            <a href="/privacy/" className="hover:text-brand-700">Privacy</a>
            <a href="/terms/" className="hover:text-brand-700">Terms</a>
            <a href="/contact/" className="hover:text-brand-700">Contact</a>
            <a href="tel:+916283464174" className="hover:text-brand-700">+91 62834 64174</a>
            <a href="mailto:support@paperscart.com" className="hover:text-brand-700">Support</a>
            <a
              href="https://inook.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-brand-700"
            >
              inook ai <ExternalLink size={13} />
            </a>
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-black/40">
          © {new Date().getFullYear()} AR Group · PapersCart &amp; inook ai
        </p>
      </footer>
    </div>
  );
}

function formatWorkspaceDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function cleanWorkspaceText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanWorkspaceText(value));
}

function formatWhatsAppPhone(value) {
  const digits = cleanWorkspaceText(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

function createWorkspaceRecordId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPaperworkFilename(prefix, value) {
  const safeValue = cleanWorkspaceText(value)
    .replace(/[^a-z0-9._ -]/gi, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${prefix}-${safeValue || 'Draft'}.pdf`;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.includes(',') ? result.split(',').pop() : result);
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read generated PDF.'));
    reader.readAsDataURL(blob);
  });
}

const PDF_CANVAS_SCALE = 2;
const A4_RATIO = 297 / 210;

// Every PDF came out with a blank second page, and it was pure rounding.
// html2pdf slices the rendered canvas into pages of
// `Math.floor(canvasWidth * 297/210)` px: at scale 2 on a 794px preview that is
// floor(2245.88) = 2245. The preview itself lays out at 1123px because the
// browser rounds `min-height: 297mm` (1122.52px) up to a whole pixel, so the
// canvas comes back 2246px tall. One pixel over the slice, and
// `Math.ceil(2246/2245)` bills a whole extra page.
//
// So trim an overshoot this small off the capture height. The tolerance is in
// element px and deliberately tiny — a couple of pixels cannot hold a line of
// text, so this can only ever drop the rounding artifact, never real content.
// A document that genuinely runs long still paginates normally.
const PDF_PAGE_OVERSHOOT_TOLERANCE = 3;

function getPdfCaptureHeight(element, width) {
  const rawHeight = element.scrollHeight || element.offsetHeight;
  const pagePx = Math.floor(width * PDF_CANVAS_SCALE * A4_RATIO) / PDF_CANVAS_SCALE;
  if (!pagePx) return rawHeight;

  const overshoot = rawHeight % pagePx;
  const spillsASliver = overshoot > 0 && overshoot <= PDF_PAGE_OVERSHOOT_TOLERANCE;
  return spillsASliver ? rawHeight - overshoot : rawHeight;
}

// Shared by download, share, and email so all three produce the same PDF.
//
// `pagebreak.avoid` is what keeps a document that runs past the bottom of the
// A4 page from being sliced through the middle of a line: without it html2pdf
// cuts the canvas at exactly 297mm wherever that lands, which put the page
// break through the signature and the "Electronically signed" note. Blocks
// tagged .pdf-keep-together move to the next page whole instead.
function buildPdfOptions(element, filename) {
  const width = element.scrollWidth || element.offsetWidth;
  const height = getPdfCaptureHeight(element, width);
  return {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: PDF_CANVAS_SCALE,
      useCORS: true,
      width,
      height,
      windowWidth: width,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-keep-together'] },
  };
}

async function createPdfAttachmentFromElement(element, filename) {
  if (!element) {
    throw new Error(`Unable to generate ${filename}.`);
  }

  const blob = await html2pdf()
    .set(buildPdfOptions(element, filename))
    .from(element)
    .outputPdf('blob');

  return {
    filename,
    contentType: 'application/pdf',
    contentBase64: await blobToBase64(blob),
  };
}

function getAvailableDocumentTypesForMode(mode, businessSubMode = 'shop') {
  if (mode === 'business') {
    return businessSubMode === 'delivery'
      ? ['invoice', 'shippinglabel', 'templates']
      : ['invoice', 'templates'];
  }
  if (mode === 'freelance') return ['invoice', 'agreement', 'scope', 'timeline'];
  return ['invoice'];
}

// The post-login chooser ("hub") is a view inside the studio app rather than a
// dedicated route. The contracts marketplace links back to it via
// /studio?choose=1 so users can switch sections without a hard reset.
function wantsChooser() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('choose') === '1';
}

function getDirectDashboardMode() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return '';

  const pathMode = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (pathMode === 'freelance' || pathMode === 'freelancer') return 'freelance';

  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get('direct') || params.get('dashboard') || '';
  if (requestedMode.toLowerCase() === 'freelancer') return 'freelance';
  return requestedMode ? normalizeDeployableWorkspaceMode(requestedMode) : '';
}

function buildInvoiceItemFromProduct(product) {
  const name = cleanWorkspaceText(product?.name);
  const description = cleanWorkspaceText(product?.description);
  const unit = cleanWorkspaceText(product?.unit);
  const sku = cleanWorkspaceText(product?.sku);
  const details = [sku && `SKU: ${sku}`, unit && `Unit: ${unit}`, description].filter(Boolean).join(' | ');

  return {
    description: details ? `${name}${name ? ' - ' : ''}${details}` : name || 'Product',
    quantity: 1,
    price: Math.max(0, Number(product?.price) || 0),
    imageDataUrl: cleanWorkspaceText(product?.imageDataUrl),
  };
}

function isStarterInvoiceItem(item) {
  return item?.description === 'Web Development Services' && Number(item?.quantity) === 1 && Number(item?.price) === 5000;
}

function confirmDashboardRemoval(message) {
  if (typeof window === 'undefined') return true;
  return window.confirm(message);
}

const DOWNLOAD_HISTORY_DOCUMENT_TYPES = new Set(['invoice', 'agreement', 'timeline']);

function clearDocumentDraftsAfterLogout(storageNamespace) {
  if (!storageNamespace) return;
  clearStoredDocumentDrafts(storageNamespace);
  if (typeof window !== 'undefined') {
    window.setTimeout(() => clearStoredDocumentDrafts(storageNamespace), 750);
  }
}

function BusinessProfileStatusCard({
  company,
  isLocked,
  profileSyncStatus,
  updatedAt,
  onOpen,
}) {
  const { isComplete, missingFields } = getCompanyProfileCompletion(company);
  const requiredFields = COMPANY_PROFILE_FIELDS.filter((field) => field.required);
  const completedRequiredCount = requiredFields.length - missingFields.length;
  const completionPercent = Math.round((completedRequiredCount / requiredFields.length) * 100);
  const hasBankDetails = ['bankAccountName', 'bankName', 'bankAccountNumber', 'bankIfscCode', 'bankBranch'].some(
    (key) => typeof company?.[key] === 'string' && company[key].trim()
  );
  const savedAt = formatWorkspaceDate(updatedAt);
  const profileStatusLabel =
    profileSyncStatus === 'saving'
      ? 'Saving profile'
      : profileSyncStatus === 'loading'
      ? 'Checking cloud profile'
      : profileSyncStatus === 'error'
      ? 'Sync needs attention'
      : profileSyncStatus === 'local'
      ? 'Saved locally'
      : 'Cloud synced';

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            {company?.logoDataUrl ? (
              <img src={company.logoDataUrl} alt="Business logo" className="h-9 w-9 object-contain" />
            ) : (
              <Building2 size={20} />
            )}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">Business settings</h2>
            <p className="truncate text-sm text-slate-500">Profile, logo, UPI, and bank details reused on documents.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${
              isComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            Profile
            <span className="rounded-full bg-white/75 px-2 py-0.5">
              {completedRequiredCount}/{requiredFields.length}
            </span>
            <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-white/80 sm:block">
              <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${completionPercent}%` }} />
            </span>
          </span>

          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${
              profileSyncStatus === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
            title={savedAt ? `Last saved ${savedAt}` : 'Changes save after you edit settings.'}
          >
            <CheckCircle2 size={15} />
            <span>{profileStatusLabel}</span>
          </span>

          <span
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${
              hasBankDetails ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <CreditCard size={15} />
            {hasBankDetails ? (isLocked ? 'Settings locked' : 'Bank saved') : 'Bank missing'}
          </span>

          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-800 touch-ignore"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>
    </section>
  );
}

function BusinessSettingsModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-3 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Settings</p>
            <h2 className="text-lg font-black text-slate-950">Business profile and payment details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
            aria-label="Close business settings"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DocumentWorkspace({
  onShowGuide,
  onSwitchWorkspace,
  onSignOut,
  profileSyncError,
  profileSyncStatus,
  profileStorageLabel = 'to your account',
  emailAccessToken = '',
  user,
}) {
  const {
    company,
    isCompanyProfileLocked,
    companyProfileUpdatedAt,
    invoice,
    agreement,
    scope,
    timeline,
    leadSheet,
    qrCard,
    documentDraftSavedAt,
    updateCompany,
    replaceCompany,
    lockCompanyProfile,
    unlockCompanyProfile,
    resetCompanyProfile,
    updateInvoice,
    updateAgreement,
    updateScope,
    updateTimeline,
    updateLeadSheet,
    updateQRCard,
  } = useBusinessData();
  const [docType, setDocType] = useState('invoice');
  const [isBusinessSettingsOpen, setIsBusinessSettingsOpen] = useState(false);
  const [shareState, setShareState] = useState({ status: 'idle', message: '' }); // idle | loading | done | unsupported | error
  const [emailState, setEmailState] = useState({ status: 'idle', message: '' }); // idle | loading | done | error
  const [invoiceNumberState, setInvoiceNumberState] = useState({ status: 'idle', message: '' });
  const [previewLayout, setPreviewLayout] = useState({ height: 0, scale: 0.9, width: 0 });
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSendPaperworkOpen, setIsSendPaperworkOpen] = useState(false);
  const [isAiPaperworkOpen, setIsAiPaperworkOpen] = useState(false);
  const historyMenuRef = useRef(null);
  const historyMobileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const formContentRef = useRef(null);
  const previewNaturalRef = useRef(null);
  const previewViewportRef = useRef(null);
  const previewRef = useRef();
  const emailInvoiceRef = useRef(null);
  const emailAgreementRef = useRef(null);
  const emailScopeRef = useRef(null);
  const emailTimelineRef = useRef(null);
  const invoiceNumberRequestRef = useRef(0);
  const displayCompany = getCompanyDisplayProfile(company);

  // Nav menus are overlays, so dismiss them the two ways users expect.
  useEffect(() => {
    if (!isHistoryMenuOpen && !isMobileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      // The history dropdown renders twice (desktop anchor + phone full-width),
      // so a click is "outside" only when it misses both.
      const insideHistory =
        historyMenuRef.current?.contains(event.target) ||
        historyMobileMenuRef.current?.contains(event.target);
      if (isHistoryMenuOpen && !insideHistory) {
        setIsHistoryMenuOpen(false);
      }
      if (isMobileMenuOpen && !mobileMenuRef.current?.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsHistoryMenuOpen(false);
      setIsMobileMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHistoryMenuOpen, isMobileMenuOpen]);

  // Freelancing is the only workspace now, so an unset profile still gets the
  // freelance tools rather than falling through to an empty mode.
  const workspaceMode = normalizeDeployableWorkspaceMode(company.workspaceMode);
  const businessSubMode = company.businessSubMode || 'shop';
  const availableDocumentTypes = useMemo(
    () => getAvailableDocumentTypesForMode(workspaceMode, businessSubMode),
    [workspaceMode, businessSubMode]
  );
  const freelanceClients = Array.isArray(company.freelanceClients) ? company.freelanceClients : [];
  const businessProducts = Array.isArray(company.businessProducts) ? company.businessProducts : [];
  const bankDetailKeys = ['bankAccountName', 'bankName', 'bankAccountNumber', 'bankIfscCode', 'bankBranch'];
  const getProfileBankDetails = (sourceCompany = company) =>
    bankDetailKeys.reduce((details, key) => {
      details[key] = sourceCompany?.[key] || '';
      return details;
    }, {});
  const documentLabels = {
    invoice: ['Invoice / Receipt', 'Create bills, receipts, payment requests, and download-ready PDFs.'],
    agreement: ['Project Agreement', 'Capture scope, terms, dates, and client agreement details.'],
    scope: ['Scope of Work', 'Spell out what is included, what is not, and how work is accepted.'],
    timeline: ['Project Timeline', 'Plan milestones, delivery phases, and project status.'],
    leadsheet: ['Lead Sheet', 'Track leads, follow-ups, and status notes.'],
    qrcard: ['QR Code Card', 'Create a shareable QR card for payments, reviews, or links.'],
    shippinglabel: ['Shipping Label', 'Create a printable delivery label from customer shipping details.'],
    templates: ['Invoice Templates', 'Customize the title and style of your startup invoice.'],
  };
  const [currentDocumentTitle, currentDocumentDescription] = documentLabels[docType] || documentLabels.invoice;

  const updatePreviewLayout = useCallback(() => {
    const previewElement = previewNaturalRef.current;
    const viewportElement = previewViewportRef.current;
    if (!previewElement || !viewportElement) return;

    const naturalHeight = previewElement.offsetHeight;
    const naturalWidth = previewElement.offsetWidth;
    if (!naturalHeight || !naturalWidth) return;

    const viewportWidth = viewportElement.clientWidth || viewportElement.getBoundingClientRect().width || naturalWidth;
    const minimumPreviewScale = viewportWidth < 640 ? 0.36 : 0.62;
    const widthScale = Math.max(0.1, (viewportWidth - 4) / naturalWidth);
    const nextScale = Math.min(Math.max(widthScale * 0.98, Math.min(minimumPreviewScale, widthScale)), widthScale, 1.15);
    const nextLayout = {
      height: Math.round(naturalHeight * nextScale),
      scale: Number(nextScale.toFixed(3)),
      width: Math.round(naturalWidth * nextScale),
    };

    setPreviewLayout((prev) =>
      prev.height === nextLayout.height && prev.width === nextLayout.width && prev.scale === nextLayout.scale
        ? prev
        : nextLayout
    );
  }, []);

  useEffect(() => {
    if (!availableDocumentTypes.includes(docType)) {
      setDocType(availableDocumentTypes[0] || 'invoice');
    }
  }, [availableDocumentTypes, docType]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let frameId = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updatePreviewLayout);
    };

    scheduleUpdate();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleUpdate);
      return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener('resize', scheduleUpdate);
      };
    }

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    [formContentRef.current, previewNaturalRef.current, previewViewportRef.current]
      .filter(Boolean)
      .forEach((element) => resizeObserver.observe(element));
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [docType, updatePreviewLayout]);

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date') {
      updateInvoice({
        date: value,
        invoiceNumber: '',
        invoiceNumberIssuedDate: '',
      });
      return;
    }
    if (name === 'invoiceNumber') {
      updateInvoice({
        invoiceNumber: value,
        invoiceNumberIssuedDate: invoice.date,
      });
      setInvoiceNumberState({
        status: 'idle',
        message: 'Manual invoice number. Use refresh to generate one automatically again.',
      });
      return;
    }
    if (name === 'discountValue' || name === 'paymentRequestValue' || name === 'gstRate') {
      updateInvoice({ [name]: Math.max(0, Number(value) || 0) });
      return;
    }
    updateInvoice({ [name]: value });
  };

  const generateInvoiceNumber = useCallback(
    async (issueDate, { force = false } = {}) => {
      if (!issueDate) {
        setInvoiceNumberState({ status: 'error', message: 'Choose an issue date before generating an invoice number.' });
        return;
      }

      if (!force && invoice.invoiceNumber && invoice.invoiceNumberIssuedDate === issueDate) {
        return;
      }

      const requestId = invoiceNumberRequestRef.current + 1;
      invoiceNumberRequestRef.current = requestId;
      setInvoiceNumberState({ status: 'loading', message: 'Generating invoice number...' });

      try {
        const nextInvoiceNumber = await getNextInvoiceNumber(issueDate);
        if (requestId !== invoiceNumberRequestRef.current) return;

        updateInvoice({
          invoiceNumber: nextInvoiceNumber,
          invoiceNumberIssuedDate: issueDate,
        });
        setInvoiceNumberState({ status: 'saved', message: `Generated ${nextInvoiceNumber}` });
      } catch (error) {
        if (requestId !== invoiceNumberRequestRef.current) return;
        const fallbackInvoiceNumber = createLocalInvoiceNumber(issueDate);
        updateInvoice({
          invoiceNumber: fallbackInvoiceNumber,
          invoiceNumberIssuedDate: issueDate,
        });
        setInvoiceNumberState({
          status: 'error',
          message: error.message || 'Could not generate an invoice number.',
        });
      }
    },
    [invoice.invoiceNumber, invoice.invoiceNumberIssuedDate, updateInvoice]
  );

  useEffect(() => {
    if (docType !== 'invoice') return;
    if (!invoice.date) return;
    if (invoice.invoiceNumber && invoice.invoiceNumberIssuedDate === invoice.date) return;

    generateInvoiceNumber(invoice.date);
  }, [docType, generateInvoiceNumber, invoice.date, invoice.invoiceNumber, invoice.invoiceNumberIssuedDate]);

  const handleInvoiceItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateInvoice({ items: newItems });
  };

  const addInvoiceItem = () => {
    updateInvoice({ items: [...invoice.items, { description: '', quantity: 1, price: 0 }] });
  };

  const removeInvoiceItem = (index) => {
    const itemName = cleanWorkspaceText(invoice.items[index]?.description) || `item ${index + 1}`;
    if (!confirmDashboardRemoval(`Remove "${itemName}" from this invoice?`)) return;
    updateInvoice({ items: invoice.items.filter((_, i) => i !== index) });
  };

  const handleTimelineMilestoneChange = (index, field, value) => {
    const newMilestones = [...timeline.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    updateTimeline({ milestones: newMilestones });
  };

  const addTimelineMilestone = () => {
    updateTimeline({
      milestones: [...timeline.milestones, { phase: '', description: '', dueDate: '', status: 'Pending' }],
    });
  };

  const removeTimelineMilestone = (index) => {
    const milestoneName = cleanWorkspaceText(timeline.milestones[index]?.phase) || `milestone ${index + 1}`;
    if (!confirmDashboardRemoval(`Remove "${milestoneName}" from this timeline?`)) return;
    updateTimeline({ milestones: timeline.milestones.filter((_, i) => i !== index) });
  };

  const handleLeadChange = (index, field, value) => {
    const newLeads = [...(leadSheet.leads || [])];
    if (!newLeads[index]) return;
    newLeads[index] = { ...newLeads[index], [field]: value };
    updateLeadSheet({ leads: newLeads });
  };

  const addLead = (lead) => {
    updateLeadSheet({ leads: [...(leadSheet.leads || []), lead] });
  };

  const removeLead = (index) => {
    const leadName = cleanWorkspaceText(leadSheet.leads?.[index]?.name) || `lead ${index + 1}`;
    if (!confirmDashboardRemoval(`Remove "${leadName}" from this lead sheet?`)) return;
    updateLeadSheet({ leads: leadSheet.leads.filter((_, i) => i !== index) });
  };

  const createFreelanceInvoiceDraft = (client = null) => {
    const projectName = cleanWorkspaceText(client?.projectName);
    const scopeHeadline = cleanWorkspaceText(client?.scope).split(/\n/)[0];

    return {
      ...createDefaultInvoice(),
      ...getProfileBankDetails(company),
      clientName: cleanWorkspaceText(client?.name),
      clientAddress: cleanWorkspaceText(client?.address),
      clientEmail: cleanWorkspaceText(client?.email),
      clientPhone: cleanWorkspaceText(client?.phone),
      stateOperatingHead: cleanWorkspaceText(client?.contactName),
      items: [
        {
          description: projectName || scopeHeadline || 'Professional Services',
          quantity: 1,
          price: 0,
        },
      ],
    };
  };

  const createBusinessInvoiceDraft = () => ({
    ...createDefaultInvoice(),
    ...getProfileBankDetails(company),
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    shippingAddress: '',
    stateOperatingHead: '',
    items: [],
  });

  const createFreelanceAgreementDraft = (client = null) => ({
    ...createDefaultAgreement(),
    clientName: cleanWorkspaceText(client?.name),
    clientAddress: cleanWorkspaceText(client?.address),
    clientEmail: cleanWorkspaceText(client?.email),
    clientPhone: cleanWorkspaceText(client?.phone),
    stateOperatingHead: cleanWorkspaceText(client?.contactName),
    projectName: cleanWorkspaceText(client?.projectName),
    scope: cleanWorkspaceText(client?.scope),
    deliverables: cleanWorkspaceText(client?.deliverables),
    paymentTerms: cleanWorkspaceText(client?.paymentTerms),
  });

  const createFreelanceTimelineDraft = (client = null) => ({
    ...createDefaultTimeline(),
    clientName: cleanWorkspaceText(client?.name),
    clientAddress: cleanWorkspaceText(client?.address),
    clientEmail: cleanWorkspaceText(client?.email),
    clientPhone: cleanWorkspaceText(client?.phone),
    stateOperatingHead: cleanWorkspaceText(client?.contactName),
    projectName: cleanWorkspaceText(client?.projectName),
  });

  const handleWorkspaceModeChange = (nextMode) => {
    if (nextMode === workspaceMode) return;

    const activeClient = freelanceClients.find((client) => client.id === company.activeFreelanceClientId) || null;
    const nextDocumentTypes = getAvailableDocumentTypesForMode(nextMode, businessSubMode);

    updateCompany({ workspaceMode: nextMode });

    if (nextMode === 'freelance') {
      updateInvoice(createFreelanceInvoiceDraft(activeClient));
      updateAgreement(createFreelanceAgreementDraft(activeClient));
      updateTimeline(createFreelanceTimelineDraft(activeClient));
      setInvoiceNumberState({ status: 'idle', message: '' });
    }

    if (nextMode === 'business') {
      updateInvoice(createBusinessInvoiceDraft());
      updateAgreement(createDefaultAgreement());
      updateTimeline(createDefaultTimeline());
      setInvoiceNumberState({ status: 'idle', message: '' });
    }

    if (!nextDocumentTypes.includes(docType)) {
      setDocType(nextDocumentTypes[0] || 'invoice');
    }
  };

  const handleBusinessSubModeChange = (nextSubMode) => {
    const safeSubMode = nextSubMode === 'delivery' ? 'delivery' : 'shop';
    updateCompany({ businessSubMode: safeSubMode });

    if (safeSubMode === 'shop') {
      updateInvoice({
        shippingAddress: '',
        clientAddress: '',
      });
      if (docType === 'shippinglabel') setDocType('invoice');
    }
  };

  const applyFreelanceClientToDocuments = (client, target = 'invoice') => {
    updateInvoice(createFreelanceInvoiceDraft(client));
    updateAgreement(createFreelanceAgreementDraft(client));
    updateTimeline(createFreelanceTimelineDraft(client));
    setInvoiceNumberState({ status: 'idle', message: '' });
    updateCompany({
      workspaceMode: 'freelance',
      activeFreelanceClientId: client.id,
    });

    if (target === 'agreement' || target === 'scope') {
      setDocType('agreement');
      return;
    }
    if (target === 'timeline') {
      setDocType('timeline');
      return;
    }
    setDocType('invoice');
  };

  const handleSaveFreelanceClient = (draft) => {
    const now = new Date().toISOString();
    const client = {
      id: createWorkspaceRecordId('client'),
      name: cleanWorkspaceText(draft.name),
      contactName: cleanWorkspaceText(draft.contactName),
      email: cleanWorkspaceText(draft.email),
      phone: cleanWorkspaceText(draft.phone),
      address: cleanWorkspaceText(draft.address),
      projectName: cleanWorkspaceText(draft.projectName),
      scope: cleanWorkspaceText(draft.scope),
      deliverables: cleanWorkspaceText(draft.deliverables),
      paymentTerms: cleanWorkspaceText(draft.paymentTerms),
      notes: cleanWorkspaceText(draft.notes),
      createdAt: now,
      updatedAt: now,
    };

    updateCompany({
      workspaceMode: 'freelance',
      activeFreelanceClientId: client.id,
      freelanceClients: [client, ...freelanceClients].slice(0, 60),
    });
    applyFreelanceClientToDocuments(client, 'invoice');
  };

  const handleUpdateFreelanceClient = (clientId, draft) => {
    const existingClient = freelanceClients.find((client) => client.id === clientId);
    if (!existingClient) return;

    const now = new Date().toISOString();
    const updatedClient = {
      ...existingClient,
      name: cleanWorkspaceText(draft.name),
      contactName: cleanWorkspaceText(draft.contactName),
      email: cleanWorkspaceText(draft.email),
      phone: cleanWorkspaceText(draft.phone),
      address: cleanWorkspaceText(draft.address),
      projectName: cleanWorkspaceText(draft.projectName),
      scope: cleanWorkspaceText(draft.scope),
      deliverables: cleanWorkspaceText(draft.deliverables),
      paymentTerms: cleanWorkspaceText(draft.paymentTerms),
      notes: cleanWorkspaceText(draft.notes),
      updatedAt: now,
      createdAt: existingClient.createdAt || now,
    };

    updateCompany({
      workspaceMode: 'freelance',
      activeFreelanceClientId: updatedClient.id,
      freelanceClients: freelanceClients.map((client) => (client.id === clientId ? updatedClient : client)),
    });
    updateInvoice(createFreelanceInvoiceDraft(updatedClient));
    updateAgreement(createFreelanceAgreementDraft(updatedClient));
    updateTimeline(createFreelanceTimelineDraft(updatedClient));
    setInvoiceNumberState({ status: 'idle', message: '' });
    setDocType('invoice');
  };

  const handleRemoveFreelanceClient = (clientId) => {
    const client = freelanceClients.find((item) => item.id === clientId);
    const clientName = cleanWorkspaceText(client?.name) || 'this client';
    if (!confirmDashboardRemoval(`Delete "${clientName}" from saved client cards?`)) return;
    updateCompany({
      freelanceClients: freelanceClients.filter((client) => client.id !== clientId),
      activeFreelanceClientId: company.activeFreelanceClientId === clientId ? '' : company.activeFreelanceClientId,
    });
  };

  const handleSaveBusinessProduct = (draft) => {
    const now = new Date().toISOString();
    const product = {
      id: createWorkspaceRecordId('product'),
      name: cleanWorkspaceText(draft.name),
      sku: cleanWorkspaceText(draft.sku),
      description: cleanWorkspaceText(draft.description),
      imageDataUrl: cleanWorkspaceText(draft.imageDataUrl),
      price: Math.max(0, Number(draft.price) || 0),
      stockQuantity: Math.max(0, Math.floor(Number(draft.stockQuantity) || 0)),
      unit: cleanWorkspaceText(draft.unit) || 'pieces',
      createdAt: now,
      updatedAt: now,
    };

    updateCompany({
      workspaceMode: 'business',
      activeBusinessProductId: product.id,
      businessProducts: [product, ...businessProducts].slice(0, 120),
    });
    setDocType('invoice');
  };

  const handleRemoveBusinessProduct = (productId) => {
    const product = businessProducts.find((item) => item.id === productId);
    const productName = cleanWorkspaceText(product?.name) || 'this product';
    if (!confirmDashboardRemoval(`Delete "${productName}" from the product catalog?`)) return;
    updateCompany({
      businessProducts: businessProducts.filter((product) => product.id !== productId),
      activeBusinessProductId: company.activeBusinessProductId === productId ? '' : company.activeBusinessProductId,
    });
  };

  const handleUpdateProductInventory = (productId, stockQuantity) => {
    const safeStockQuantity = Math.max(0, Math.floor(Number(stockQuantity) || 0));
    updateCompany({
      businessProducts: businessProducts.map((product) =>
        product.id === productId
          ? { ...product, stockQuantity: safeStockQuantity, updatedAt: new Date().toISOString() }
          : product
      ),
    });
  };

  const handleAddProductToInvoice = (product) => {
    const stockQuantity = Math.max(0, Math.floor(Number(product.stockQuantity) || 0));
    if (stockQuantity <= 0) return false;

    const nextItem = buildInvoiceItemFromProduct(product);
    const currentItems = Array.isArray(invoice.items) ? invoice.items : [];
    const shouldReplaceStarterItem = currentItems.length === 1 && isStarterInvoiceItem(currentItems[0]);

    updateInvoice({
      items: shouldReplaceStarterItem ? [nextItem] : [...currentItems, nextItem],
    });
    updateCompany({
      workspaceMode: 'business',
      activeBusinessProductId: product.id,
      businessProducts: businessProducts.map((savedProduct) =>
        savedProduct.id === product.id
          ? { ...savedProduct, stockQuantity: Math.max(0, stockQuantity - 1) }
          : savedProduct
      ),
    });
    setDocType('invoice');
    return true;
  };

  const buildBusinessInvoiceWithCustomer = (customer = {}) => {
    const isDeliveryMode = businessSubMode === 'delivery';
    return {
      ...invoice,
      clientName: cleanWorkspaceText(customer.name),
      clientPhone: cleanWorkspaceText(customer.phone),
      clientEmail: cleanWorkspaceText(customer.email),
      clientAddress: '',
      shippingAddress: isDeliveryMode ? cleanWorkspaceText(customer.shippingAddress) : '',
    };
  };

  const handleUseBusinessCustomer = (customer) => {
    const customerInvoice = buildBusinessInvoiceWithCustomer(customer);
    updateInvoice({
      clientName: customerInvoice.clientName,
      clientPhone: customerInvoice.clientPhone,
      clientEmail: customerInvoice.clientEmail,
      clientAddress: customerInvoice.clientAddress,
      shippingAddress: customerInvoice.shippingAddress,
    });
    setDocType('invoice');
  };

  const handlePrepareEmail = (customer) => {
    const emailInvoice = {
      ...buildBusinessInvoiceWithCustomer(customer),
      clientName: cleanWorkspaceText(customer.name) || invoice.clientName,
      clientPhone: cleanWorkspaceText(customer.phone) || invoice.clientPhone,
      clientEmail: cleanWorkspaceText(customer.email) || invoice.clientEmail,
      shippingAddress: businessSubMode === 'delivery'
        ? cleanWorkspaceText(customer.shippingAddress) || invoice.shippingAddress
        : '',
    };
    const recipient = cleanWorkspaceText(emailInvoice.clientEmail);
    if (!recipient) return;

    updateInvoice({
      clientName: emailInvoice.clientName,
      clientPhone: emailInvoice.clientPhone,
      clientEmail: emailInvoice.clientEmail,
      clientAddress: emailInvoice.clientAddress,
      shippingAddress: emailInvoice.shippingAddress,
    });

    const { total } = getInvoiceTotals(emailInvoice);
    const subject = `Invoice ${emailInvoice.invoiceNumber || emailInvoice.date || ''} from ${displayCompany.companyName}`;
    const body = [
      `Hi ${emailInvoice.clientName || 'there'},`,
      '',
      `Please find invoice ${emailInvoice.invoiceNumber || 'draft invoice'} from ${displayCompany.companyName}.`,
      `Total: ₹${total.toFixed(2)}`,
      emailInvoice.dueDate ? `Due date: ${emailInvoice.dueDate}` : '',
      '',
      'This is a paperless invoice. Please attach the downloaded PDF before sending.',
      '',
      `Regards,`,
      displayCompany.founderName,
      displayCompany.companyName,
    ].filter((line) => line !== '').join('\n');

    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Facts handed to the drafter. These come from the client card and the live
  // invoice — the model is told to reuse them rather than invent its own.
  const buildAiPaperworkContext = () => {
    const activeClient = freelanceClients.find((client) => client.id === company.activeFreelanceClientId) || null;
    const { total } = getInvoiceTotals(invoice);
    return {
      companyName: displayCompany.companyName,
      clientName:
        cleanWorkspaceText(activeClient?.name) ||
        cleanWorkspaceText(invoice.clientName) ||
        cleanWorkspaceText(agreement.clientName),
      invoiceNumber: cleanWorkspaceText(invoice.invoiceNumber),
      invoiceTotal: Number.isFinite(total) && total > 0 ? `Rs ${total.toFixed(2)}` : '',
      invoiceDueDate: cleanWorkspaceText(invoice.dueDate),
      invoiceItems: (Array.isArray(invoice.items) ? invoice.items : [])
        .map((item) => ({
          description: cleanWorkspaceText(item?.description),
          quantity: item?.quantity,
        }))
        .filter((item) => item.description),
      startDate: cleanWorkspaceText(agreement.startDate) || cleanWorkspaceText(timeline.startDate),
      endDate: cleanWorkspaceText(agreement.endDate) || cleanWorkspaceText(timeline.endDate),
    };
  };

  // Client identity is copied from the client card / invoice, never from the
  // model, so a drafted document can never address the wrong person.
  const handleApplyAiPaperwork = ({ draft, startDate, endDate }) => {
    const activeClient = freelanceClients.find((client) => client.id === company.activeFreelanceClientId) || null;
    const clientFields = {
      clientName:
        cleanWorkspaceText(activeClient?.name) || cleanWorkspaceText(invoice.clientName) || agreement.clientName,
      clientAddress:
        cleanWorkspaceText(activeClient?.address) || cleanWorkspaceText(invoice.clientAddress) || agreement.clientAddress,
      clientEmail:
        cleanWorkspaceText(activeClient?.email) || cleanWorkspaceText(invoice.clientEmail) || agreement.clientEmail,
      clientPhone:
        cleanWorkspaceText(activeClient?.phone) || cleanWorkspaceText(invoice.clientPhone) || agreement.clientPhone,
    };
    const projectName = draft.projectName || agreement.projectName;

    updateAgreement({
      ...clientFields,
      projectName,
      startDate: startDate || agreement.startDate,
      endDate: endDate || agreement.endDate,
      scope: draft.agreement.scope || agreement.scope,
      deliverables: draft.agreement.deliverables || agreement.deliverables,
      paymentTerms: draft.agreement.paymentTerms || agreement.paymentTerms,
      specialTerms: draft.agreement.specialTerms || agreement.specialTerms,
    });

    updateScope({
      ...clientFields,
      projectName,
      startDate: startDate || scope.startDate,
      endDate: endDate || scope.endDate,
      overview: draft.scope.overview || scope.overview,
      deliverables: draft.scope.deliverables || scope.deliverables,
      outOfScope: draft.scope.outOfScope || scope.outOfScope,
      assumptions: draft.scope.assumptions || scope.assumptions,
      acceptanceCriteria: draft.scope.acceptanceCriteria || scope.acceptanceCriteria,
      revisionRounds: draft.scope.revisionRounds || scope.revisionRounds,
    });

    updateTimeline({
      ...clientFields,
      projectName,
      startDate: startDate || timeline.startDate,
      endDate: endDate || timeline.endDate,
      ...(draft.timeline.milestones.length ? { milestones: draft.timeline.milestones } : {}),
    });

    setIsAiPaperworkOpen(false);
    setDocType('agreement');
  };

  // Which of the three freelance PDFs to attach. Scope of work is a section of
  // the agreement PDF, so it travels with 'agreement' rather than on its own.
  const handleEmailPaperwork = async ({ documents, recipient: recipientOverride } = {}) => {
    if (emailState.status === 'loading') return;

    const selectedDocuments =
      Array.isArray(documents) && documents.length > 0
        ? documents
        : ['invoice', 'agreement', 'scope', 'timeline'];

    const activeClient = freelanceClients.find((client) => client.id === company.activeFreelanceClientId) || null;
    const recipient =
      cleanWorkspaceText(recipientOverride) ||
      cleanWorkspaceText(activeClient?.email) ||
      cleanWorkspaceText(invoice.clientEmail) ||
      cleanWorkspaceText(agreement.clientEmail) ||
      cleanWorkspaceText(timeline.clientEmail);

    const finalRecipient =
      recipient ||
      (typeof window !== 'undefined'
        ? cleanWorkspaceText(window.prompt('Enter client email address') || '')
        : '');

    if (!finalRecipient || !isValidEmailAddress(finalRecipient)) {
      setEmailState({
        status: 'error',
        message: 'Add a valid client email before sending paperwork.',
      });
      setTimeout(() => setEmailState({ status: 'idle', message: '' }), 4000);
      return;
    }

    if (!isPaperworkEmailApiConfigured()) {
      setEmailState({
        status: 'error',
        message: 'Email API is not configured. Add VITE_API_URL in the frontend env and run the backend.',
      });
      setTimeout(() => setEmailState({ status: 'idle', message: '' }), 6000);
      return;
    }

    const clientName =
      cleanWorkspaceText(activeClient?.name) ||
      cleanWorkspaceText(invoice.clientName) ||
      cleanWorkspaceText(agreement.clientName) ||
      cleanWorkspaceText(timeline.clientName) ||
      'Client';
    const projectName =
      cleanWorkspaceText(agreement.projectName) ||
      cleanWorkspaceText(timeline.projectName) ||
      cleanWorkspaceText(activeClient?.projectName);
    const { total } = getInvoiceTotals(invoice);
    const wantsInvoice = selectedDocuments.includes('invoice');
    const wantsAgreement = selectedDocuments.includes('agreement');
    const wantsScope = selectedDocuments.includes('scope');
    const wantsTimeline = selectedDocuments.includes('timeline');

    const documentLines = [
      wantsInvoice && invoice.invoiceNumber && `Invoice: ${invoice.invoiceNumber}`,
      wantsAgreement && agreement.agreementNumber && `Agreement: ${agreement.agreementNumber}`,
      wantsScope && scope.scopeNumber && `Scope of work: ${scope.scopeNumber}`,
      projectName && `Project: ${projectName}`,
      wantsTimeline && (timeline.startDate || timeline.endDate)
        ? `Timeline: ${timeline.startDate || 'start date pending'} to ${timeline.endDate || 'end date pending'}`
        : '',
      wantsInvoice && Number.isFinite(total) ? `Invoice total: ₹${total.toFixed(2)}` : '',
      wantsInvoice && invoice.dueDate ? `Invoice due date: ${invoice.dueDate}` : '',
    ].filter(Boolean);

    // Name only what is actually attached, so a single-invoice send does not
    // promise an agreement and a timeline that are not there.
    const documentNames = [
      wantsInvoice && 'invoice',
      wantsAgreement && 'agreement',
      wantsScope && 'scope of work',
      wantsTimeline && 'project timeline',
    ].filter(Boolean);
    const documentSentence =
      documentNames.length === 1
        ? `Please find the attached ${documentNames[0]} PDF.`
        : `Please find the attached ${documentNames.slice(0, -1).join(', ')} and ${
            documentNames[documentNames.length - 1]
          } PDFs.`;

    const onlyInvoice = documentNames.length === 1 && wantsInvoice;
    const subject = onlyInvoice
      ? projectName
        ? `Invoice for ${projectName}`
        : `Invoice from ${displayCompany.companyName}`
      : projectName
      ? `Project paperwork for ${projectName}`
      : `Project paperwork from ${displayCompany.companyName}`;

    const bodyText = [
      `Hi ${clientName},`,
      '',
      `I am sharing the paperwork from ${displayCompany.companyName} for your review.`,
      '',
      ...documentLines,
      '',
      documentSentence,
      '',
      'Regards,',
      displayCompany.founderName,
      displayCompany.companyName,
    ].filter((line) => line !== '').join('\n');

    setEmailState({
      status: 'loading',
      message: `Generating ${documentNames.join(', ')} PDF${documentNames.length > 1 ? 's' : ''}...`,
    });

    try {
      const attachmentJobs = [
        wantsInvoice &&
          createPdfAttachmentFromElement(
            emailInvoiceRef.current,
            createPaperworkFilename('Invoice', invoice.invoiceNumber || clientName)
          ),
        wantsAgreement &&
          createPdfAttachmentFromElement(
            emailAgreementRef.current,
            createPaperworkFilename('Agreement', agreement.agreementNumber || projectName || clientName)
          ),
        wantsScope &&
          createPdfAttachmentFromElement(
            emailScopeRef.current,
            createPaperworkFilename('Scope-of-Work', scope.scopeNumber || projectName || clientName)
          ),
        wantsTimeline &&
          createPdfAttachmentFromElement(
            emailTimelineRef.current,
            createPaperworkFilename('Timeline', timeline.projectName || projectName || clientName)
          ),
      ].filter(Boolean);
      const attachments = await Promise.all(attachmentJobs);

      setEmailState({ status: 'loading', message: `Sending ${attachments.length} PDFs to ${finalRecipient}...` });
      await sendPaperworkEmail({
        to: finalRecipient,
        recipientName: clientName,
        subject,
        bodyText,
        attachments,
      }, {
        accessToken: emailAccessToken,
      });
      await saveDocumentsToHistory(selectedDocuments, 'email');

      setEmailState({
        status: 'done',
        message: `Paperwork sent to ${finalRecipient}.`,
      });
      setTimeout(() => setEmailState({ status: 'idle', message: '' }), 5000);
    } catch (error) {
      setEmailState({
        status: 'error',
        message: error.message || 'Email send failed. Check server email configuration.',
      });
      setTimeout(() => setEmailState({ status: 'idle', message: '' }), 7000);
    }
  };

  const handleSendWhatsApp = (customer) => {
    const whatsAppInvoice = {
      ...buildBusinessInvoiceWithCustomer(customer),
      clientName: cleanWorkspaceText(customer.name) || invoice.clientName,
      clientPhone: cleanWorkspaceText(customer.phone) || invoice.clientPhone,
      clientEmail: cleanWorkspaceText(customer.email) || invoice.clientEmail,
      shippingAddress: businessSubMode === 'delivery'
        ? cleanWorkspaceText(customer.shippingAddress) || invoice.shippingAddress
        : '',
    };
    const phone = formatWhatsAppPhone(whatsAppInvoice.clientPhone);
    if (!phone) return;

    updateInvoice({
      clientName: whatsAppInvoice.clientName,
      clientPhone: whatsAppInvoice.clientPhone,
      clientEmail: whatsAppInvoice.clientEmail,
      clientAddress: whatsAppInvoice.clientAddress,
      shippingAddress: whatsAppInvoice.shippingAddress,
    });
    setDocType('invoice');

    const { total } = getInvoiceTotals(whatsAppInvoice);
    const itemLines = (Array.isArray(whatsAppInvoice.items) ? whatsAppInvoice.items : [])
      .filter((item) => cleanWorkspaceText(item.description))
      .slice(0, 6)
      .map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return `${index + 1}. ${item.description} x ${quantity} - ₹${(quantity * price).toFixed(2)}`;
      });

    const message = [
      `Invoice ${whatsAppInvoice.invoiceNumber || 'draft invoice'}`,
      displayCompany.companyName ? `From: ${displayCompany.companyName}` : '',
      whatsAppInvoice.clientName ? `Customer: ${whatsAppInvoice.clientName}` : '',
      '',
      ...itemLines,
      itemLines.length ? '' : '',
      `Total: ₹${total.toFixed(2)}`,
      whatsAppInvoice.dueDate ? `Due date: ${whatsAppInvoice.dueDate}` : '',
      businessSubMode === 'delivery' && whatsAppInvoice.shippingAddress ? `Shipping: ${whatsAppInvoice.shippingAddress}` : '',
      '',
      'Paperless bill. Please attach the downloaded PDF if needed.',
    ].filter((line) => line !== '').join('\n');

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleLoadFromHistory = (companySnapshot, dataSnapshot) => {
    if (companySnapshot && !isCompanyProfileLocked) {
      const safeCompanySnapshot = {
        ...companySnapshot,
        workspaceMode,
      };
      replaceCompany(
        isCompanyProfileLocked || company.bankDetailsLocked
          ? {
              ...safeCompanySnapshot,
              ...getProfileBankDetails(company),
              bankDetailsLocked: true,
            }
          : safeCompanySnapshot
      );
    }
    switch (docType) {
      case 'invoice':
        if (dataSnapshot) {
          updateInvoice({
            ...createDefaultInvoice(),
            ...dataSnapshot,
            invoiceNumberIssuedDate: dataSnapshot.invoiceNumberIssuedDate || dataSnapshot.date || '',
            ...getProfileBankDetails(company),
          });
        }
        break;
      case 'agreement':
        if (dataSnapshot) updateAgreement(dataSnapshot);
        break;
      case 'scope':
        if (dataSnapshot) updateScope(dataSnapshot);
        break;
      case 'timeline':
        if (dataSnapshot) updateTimeline(dataSnapshot);
        break;
      case 'leadsheet':
        if (dataSnapshot) updateLeadSheet(dataSnapshot);
        break;
      case 'qrcard':
        if (dataSnapshot) updateQRCard(dataSnapshot);
        break;
      default:
        break;
    }
  };

  const getFilename = () => {
    switch (docType) {
      case 'invoice':
        return `Invoice-${invoice.invoiceNumber || invoice.date || 'Draft'}.pdf`;
      case 'agreement':
        return `Agreement-${agreement.agreementNumber}.pdf`;
      case 'scope':
        return `Scope-of-Work-${scope.scopeNumber || scope.projectName || 'Draft'}.pdf`;
      case 'timeline':
        return `Timeline-${timeline.projectName || 'Project'}.pdf`;
      case 'leadsheet':
        return `Leads-Tracking-Sheet.pdf`;
      case 'qrcard':
        return `QR-Card-${qrCard.hostelName?.replace(/\s+/g, '-') || 'Business'}.png`;
      case 'shippinglabel':
        return `Shipping-Label-${invoice.clientName?.replace(/\s+/g, '-') || invoice.invoiceNumber || 'Customer'}.pdf`;
      case 'templates':
        return `Invoice-Template-${invoice.invoiceLabel || 'Invoice'}.pdf`;
      default:
        return 'document.pdf';
    }
  };

  const saveDocumentsToHistory = useCallback(async (documentTypes, source = 'download') => {
    if (company.historyAutoSaveOnDownload === false) return;

    let didChangeHistory = false;
    try {
      for (const documentType of documentTypes) {
        if (!DOWNLOAD_HISTORY_DOCUMENT_TYPES.has(documentType)) continue;
        const data = getDocumentDataByType(documentType, { invoice, agreement, scope, timeline, leadSheet, qrCard });
        if (!data) continue;

        const label = getDocumentHistoryLabel(documentType, data);
        const duplicateKey = getDocumentHistoryDuplicateKey(documentType, data);
        const meta = {
          ...getDocumentHistoryMeta(documentType, data),
          duplicateKey,
          source,
        };
        const payload = {
          label,
          company: JSON.parse(JSON.stringify(company)),
          data: JSON.parse(JSON.stringify(data)),
          meta,
        };

        if (company.historyAvoidDuplicateDownloads !== false && duplicateKey) {
          const entries = await getHistory(documentType);
          const existingEntry = entries.find((entry) => {
            const entryDuplicateKey = entry?.meta?.duplicateKey;
            return entryDuplicateKey === duplicateKey || (!entryDuplicateKey && entry.label === label);
          });

          if (existingEntry) {
            await updateHistoryEntry(documentType, existingEntry.id, {
              ...payload,
              savedAt: new Date().toISOString(),
            });
            didChangeHistory = true;
            continue;
          }
        }

        await saveToHistory(documentType, payload);
        didChangeHistory = true;
      }

      if (didChangeHistory) {
        setHistoryRefreshToken((token) => token + 1);
      }
    } catch (error) {
      console.warn('Document history save failed:', error);
    }
  }, [agreement, company, invoice, leadSheet, qrCard, scope, timeline]);

  const saveCurrentDownloadToHistory = useCallback(async () => {
    await saveDocumentsToHistory([docType], 'download');
  }, [docType, saveDocumentsToHistory]);

  const handleDownloadFile = () => {
    const element = previewRef.current;
    if (!element) return;

    if (docType === 'qrcard') {
      // For QR Cards, download as a PNG image
      
      // Temporarily stash original styles to handle theme-specific text rendering issues
      const cardElement = element.querySelector('.qr-card');
      const h1Element = element.querySelector('.card-header h1');
      let originalBackground = '';
      let originalWebkitTextFillColor = '';
      
      if (h1Element && docType === 'qrcard') {
        originalBackground = h1Element.style.background;
        originalWebkitTextFillColor = h1Element.style.webkitTextFillColor;
        
        // Force removing the background gradient and clip for the snapshot
        h1Element.style.background = 'none';
        h1Element.style.webkitTextFillColor = 'initial';
        h1Element.style.color = '#333399'; // Fallback color
      }

      html2canvas(cardElement || element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null, // transparent base
      })
        .then((canvas) => {
          // Restore original styles
          if (h1Element) {
            h1Element.style.background = originalBackground;
            h1Element.style.webkitTextFillColor = originalWebkitTextFillColor;
            h1Element.style.color = '';
          }
          const link = document.createElement('a');
          link.download = getFilename();
          link.href = canvas.toDataURL('image/png');
          link.click();
        })
        .catch((err) => {
          // Restore original styles on error too
          if (h1Element) {
            h1Element.style.background = originalBackground;
            h1Element.style.webkitTextFillColor = originalWebkitTextFillColor;
            h1Element.style.color = '';
          }
          console.error("Error generating card image:", err);
          alert("Error generating the image. Please try again.");
        });

    } else {
      // For standard documents, download as PDF
      html2pdf()
        .set(getPdfOptions())
        .from(element)
        .save()
        .then(() => {
          saveCurrentDownloadToHistory();
        })
        .catch((err) => {
          console.error('Error generating PDF:', err);
          alert('Error generating the PDF. Please try again.');
        });
    }
  };

  // Callers guard that previewRef.current exists before reaching here.
  const getPdfOptions = () => buildPdfOptions(previewRef.current, getFilename());

  const handleSharePDF = async () => {
    const element = previewRef.current;
    if (!element) return;

    // Only check that the API exists here. Probing with an empty files array
    // reports false even where file sharing works, because "no files" is
    // nothing to share — the real capability check happens below, once there is
    // an actual PDF to hand to canShare().
    const canShareFile =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function';
    if (!canShareFile) {
      setShareState({ status: 'unsupported', message: 'Sharing from this device is not supported. Use Download PDF instead.' });
      setTimeout(() => setShareState({ status: 'idle', message: '' }), 4000);
      return;
    }

    setShareState({ status: 'loading', message: 'Generating PDF…' });
    try {
      const opt = getPdfOptions();
      const blob = await html2pdf().set(opt).from(element).outputPdf('blob');
      const file = new File([blob], getFilename(), { type: 'application/pdf' });

      if (!navigator.canShare({ files: [file] })) {
        setShareState({ status: 'unsupported', message: 'Sharing PDF is not supported here. Use Download PDF.' });
        setTimeout(() => setShareState({ status: 'idle', message: '' }), 4000);
        return;
      }

      await navigator.share({
        title: getFilename().replace('.pdf', ''),
        text: `${docType === 'invoice' ? 'Invoice' : docType === 'agreement' ? 'Project Agreement' : docType === 'timeline' ? 'Project Timeline' : 'Lead Sheet'} from ${displayCompany.companyName || 'PapersCart'}`,
        files: [file],
      });
      setShareState({ status: 'done', message: 'Shared successfully!' });
      setTimeout(() => setShareState({ status: 'idle', message: '' }), 3000);
    } catch (err) {
      if (err.name === 'AbortError') {
        setShareState({ status: 'idle', message: '' });
        return;
      }
      setShareState({ status: 'error', message: err.message || 'Share failed. Try Download PDF.' });
      setTimeout(() => setShareState({ status: 'idle', message: '' }), 4000);
    }
  };

  const renderForm = () => {
    switch (docType) {
      case 'invoice':
        return (
          <InvoiceForm
            data={invoice}
            invoiceNumberState={invoiceNumberState}
            onChange={handleInvoiceChange}
            onGenerateInvoiceNumber={() => generateInvoiceNumber(invoice.date, { force: true })}
            onItemChange={handleInvoiceItemChange}
            onAddItem={addInvoiceItem}
            onRemoveItem={removeInvoiceItem}
            hideClientInfo={workspaceMode === 'freelance' || workspaceMode === 'business'}
            formMode={workspaceMode === 'business' ? 'business' : 'standard'}
            businessSubMode={businessSubMode}
          />
        );
      case 'agreement':
        return <AgreementForm data={agreement} onChange={updateAgreement} hideClientInfo={workspaceMode === 'freelance'} />;
      case 'scope':
        return <ScopeForm data={scope} onChange={updateScope} hideClientInfo={workspaceMode === 'freelance'} />;
      case 'timeline':
        return (
          <TimelineForm
            data={timeline}
            onChange={updateTimeline}
            onMilestoneChange={handleTimelineMilestoneChange}
            onAddMilestone={addTimelineMilestone}
            onRemoveMilestone={removeTimelineMilestone}
            hideClientInfo={workspaceMode === 'freelance'}
          />
        );
      case 'leadsheet':
        return (
          <LeadSheetForm
            data={leadSheet}
            onChange={updateLeadSheet}
            onLeadChange={handleLeadChange}
            onAddLead={addLead}
            onRemoveLead={removeLead}
          />
        );
      case 'qrcard':
        return <QRCardForm data={qrCard} onChange={updateQRCard} />;
      case 'shippinglabel':
        return <ShippingLabelForm data={invoice} onChange={updateInvoice} />;
      case 'templates':
        return <InvoiceTemplateForm data={invoice} onChange={updateInvoice} />;
      default:
        return null;
    }
  };

  const renderPreview = () => {
    switch (docType) {
      case 'invoice':
        return <InvoicePreview ref={previewRef} company={company} data={invoice} />;
      case 'agreement':
        return <AgreementPreview ref={previewRef} company={company} data={agreement} />;
      case 'scope':
        return <ScopePreview ref={previewRef} company={company} data={scope} />;
      case 'timeline':
        return <TimelinePreview ref={previewRef} company={company} data={timeline} />;
      case 'leadsheet':
        return <LeadSheetPreview ref={previewRef} company={company} data={leadSheet} />;
      case 'qrcard':
        return <QRCardPreview ref={previewRef} company={company} data={qrCard} />;
      case 'shippinglabel':
        return <ShippingLabelPreview ref={previewRef} company={company} data={invoice} />;
      case 'templates':
        return <InvoicePreview ref={previewRef} company={company} data={invoice} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col min-w-0">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <img src="/paperscart-logo.png" alt="PapersCart" className="h-8 w-auto max-w-[150px] object-contain sm:h-9 sm:max-w-[170px]" />
                <div className="mt-1 hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                  <UserRound size={13} />
                  <span className="max-w-[320px] truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Desktop: the permanent menu. Document actions (email, share)
                live on the preview toolbar instead, next to Download PDF. */}
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={() => setIsAccountOpen(true)}
                title="Account"
                className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-700 touch-ignore"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <UserRound size={15} />
                  </span>
                )}
                Account
              </button>
              <button
                type="button"
                onClick={() => setIsBusinessSettingsOpen(true)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-700 touch-ignore"
              >
                Business settings
              </button>
              <button
                type="button"
                onClick={onShowGuide}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-700 touch-ignore"
              >
                Guide
              </button>
              <div className="relative" ref={historyMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsHistoryMenuOpen((open) => !open)}
                  aria-expanded={isHistoryMenuOpen}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors touch-ignore ${
                    isHistoryMenuOpen
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'
                  }`}
                >
                  <HistoryIcon size={15} className="shrink-0" />
                  History
                </button>
                {isHistoryMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-[min(92vw,640px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                      <p className="text-sm font-black text-slate-900">History — {currentDocumentTitle}</p>
                      <button
                        type="button"
                        onClick={() => setIsHistoryMenuOpen(false)}
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close history"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                      <DocumentHistory
                        embedded
                        docType={docType}
                        company={company}
                        invoice={invoice}
                        agreement={agreement}
                        scope={scope}
                        timeline={timeline}
                        leadSheet={leadSheet}
                        qrCard={qrCard}
                        onLoad={(nextCompany, nextData) => {
                          handleLoadFromHistory(nextCompany, nextData);
                          setIsHistoryMenuOpen(false);
                        }}
                        refreshToken={historyRefreshToken}
                      />
                    </div>
                  </div>
                )}
              </div>
              {onSwitchWorkspace && (
                <button
                  type="button"
                  onClick={onSwitchWorkspace}
                  title="Switch workspace"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-700 touch-ignore"
                >
                  <LayoutGrid size={15} /> Switch
                </button>
              )}
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 touch-ignore"
              >
                <LogOut size={18} className="shrink-0" />
                Sign out
              </button>
            </div>

            {/* Phone: the same menu, collapsed behind the hamburger. */}
            <div className="relative lg:hidden" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Menu"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 transition-colors hover:bg-slate-50 touch-ignore"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              {isMobileMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-[min(88vw,320px)] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAccountOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 border-b border-slate-100 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <UserRound size={17} className="shrink-0 text-slate-400" />
                    )}
                    <span className="min-w-0 truncate">Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBusinessSettingsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Building2 size={17} className="shrink-0 text-slate-400" />
                    Business settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onShowGuide?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <BookOpen size={17} className="shrink-0 text-slate-400" />
                    Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsHistoryMenuOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <HistoryIcon size={17} className="shrink-0 text-slate-400" />
                    History
                  </button>
                  {onSwitchWorkspace && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSwitchWorkspace();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <LayoutGrid size={17} className="shrink-0 text-slate-400" />
                      Switch workspace
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <LogOut size={17} className="shrink-0 text-slate-400" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* On phones the history dropdown is anchored to the header rather
              than the hamburger, so it can use the full width. */}
          {isHistoryMenuOpen && (
            <div className="relative lg:hidden" ref={historyMobileMenuRef}>
              <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                  <p className="text-sm font-black text-slate-900">History — {currentDocumentTitle}</p>
                  <button
                    type="button"
                    onClick={() => setIsHistoryMenuOpen(false)}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close history"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <DocumentHistory
                    embedded
                    docType={docType}
                    company={company}
                    invoice={invoice}
                    agreement={agreement}
                    scope={scope}
                    timeline={timeline}
                    leadSheet={leadSheet}
                    qrCard={qrCard}
                    onLoad={(nextCompany, nextData) => {
                      handleLoadFromHistory(nextCompany, nextData);
                      setIsHistoryMenuOpen(false);
                    }}
                    refreshToken={historyRefreshToken}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow p-3 sm:p-4 md:p-6 min-w-0">
        <div className="max-w-[1500px] mx-auto space-y-4 sm:space-y-5">
          <BusinessProfileStatusCard
            company={company}
            isLocked={isCompanyProfileLocked}
            profileSyncStatus={profileSyncStatus}
            updatedAt={companyProfileUpdatedAt}
            onOpen={() => setIsBusinessSettingsOpen(true)}
          />

          {isAccountOpen && (
            <AccountSettingsModal user={user} onClose={() => setIsAccountOpen(false)} />
          )}

          {isAiPaperworkOpen && (
            <AiPaperworkModal
              context={buildAiPaperworkContext()}
              initialAnswers={{
                deliverables: (Array.isArray(invoice.items) ? invoice.items : [])
                  .map((item) => cleanWorkspaceText(item?.description))
                  .filter(Boolean)
                  .join('\n'),
                paymentTerms: cleanWorkspaceText(invoice.paymentTermsNote),
              }}
              onApply={handleApplyAiPaperwork}
              onClose={() => setIsAiPaperworkOpen(false)}
            />
          )}

          {isSendPaperworkOpen && (
            <SendPaperworkModal
              defaultRecipient={
                cleanWorkspaceText(
                  freelanceClients.find((client) => client.id === company.activeFreelanceClientId)?.email
                ) ||
                cleanWorkspaceText(invoice.clientEmail) ||
                cleanWorkspaceText(agreement.clientEmail) ||
                cleanWorkspaceText(timeline.clientEmail)
              }
              isSending={emailState.status === 'loading'}
              statusMessage={emailState.message}
              statusType={emailState.status}
              onSend={async ({ documents, recipient }) => {
                await handleEmailPaperwork({ documents, recipient });
              }}
              onClose={() => setIsSendPaperworkOpen(false)}
            />
          )}

          {isBusinessSettingsOpen && (
            <BusinessSettingsModal onClose={() => setIsBusinessSettingsOpen(false)}>
              <CompanyProfileForm
                company={company}
                isLocked={isCompanyProfileLocked}
                profileSyncError={profileSyncError}
                profileSyncStatus={profileSyncStatus}
                storageLabel={profileStorageLabel}
                updatedAt={companyProfileUpdatedAt}
                onChange={updateCompany}
                onLock={lockCompanyProfile}
                onUnlock={unlockCompanyProfile}
                onReset={resetCompanyProfile}
              />
            </BusinessSettingsModal>
          )}

          <WorkspaceModePanel
            mode={workspaceMode}
            onModeChange={handleWorkspaceModeChange}
            isAccountModeLocked
            clients={freelanceClients}
            activeClientId={company.activeFreelanceClientId}
            onSaveClient={handleSaveFreelanceClient}
            onUpdateClient={handleUpdateFreelanceClient}
            onUseClient={applyFreelanceClientToDocuments}
            onRemoveClient={handleRemoveFreelanceClient}
            products={businessProducts}
            activeProductId={company.activeBusinessProductId}
            invoice={invoice}
            businessSubMode={businessSubMode}
            onBusinessSubModeChange={handleBusinessSubModeChange}
            onSaveProduct={handleSaveBusinessProduct}
            onRemoveProduct={handleRemoveBusinessProduct}
            onAddProductToInvoice={handleAddProductToInvoice}
            onUpdateProductInventory={handleUpdateProductInventory}
            onInvoiceChange={updateInvoice}
            onUseBusinessCustomer={handleUseBusinessCustomer}
            onPrepareEmail={handlePrepareEmail}
            onSendWhatsApp={handleSendWhatsApp}
          />

          <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Current document</p>
                <h2 className="mt-0.5 text-lg font-black text-slate-950">{currentDocumentTitle}</h2>
                <p className="sr-only">{currentDocumentDescription}</p>
              </div>
              {workspaceMode === 'freelance' && (
                <button
                  type="button"
                  onClick={() => setIsAiPaperworkOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-black text-emerald-800 transition-colors hover:bg-emerald-100 touch-ignore"
                >
                  <Sparkles size={16} className="shrink-0" />
                  Draft with AI
                </button>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(420px,0.82fr)_minmax(720px,1.18fr)] lg:gap-8">
            <div className="space-y-4 sm:space-y-6 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                  {docType === 'invoice' && 'Invoice details'}
                  {docType === 'agreement' && 'Agreement details'}
                  {docType === 'scope' && 'Scope of work details'}
                  {docType === 'timeline' && 'Timeline details'}
                  {docType === 'leadsheet' && 'Lead sheet details'}
                  {docType === 'qrcard' && 'QR Card details'}
                  {docType === 'shippinglabel' && 'Shipping label details'}
                  {docType === 'templates' && 'Invoice template settings'}
                </h2>
                {documentDraftSavedAt && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800">
                    Draft saved locally {formatWorkspaceDate(documentDraftSavedAt)}
                  </span>
                )}
              </div>
              {docType !== 'qrcard' && (
                <PdfThemePicker
                  value={company.pdfTheme}
                  onChange={(pdfTheme) => updateCompany({ pdfTheme })}
                />
              )}
              <div ref={formContentRef}>{renderForm()}</div>
            </div>

            <div className="lg:sticky lg:top-40 h-fit min-w-0">
              <div className="mb-3 w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm">
                {/* Document picker keeps its own row so the labels stay
                    readable; the actions sit under it, above the PDF. */}
                <div className="grid w-full min-w-0 gap-2 xl:grid-cols-[minmax(120px,0.4fr)_minmax(0,1.6fr)] xl:items-center">
                  <div className="min-w-0 px-1">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Preview</p>
                    <p className="truncate text-sm font-bold text-slate-700">{currentDocumentTitle}</p>
                  </div>
                  <DocumentTypeSelector
                    current={docType}
                    onChange={setDocType}
                    availableTypes={availableDocumentTypes}
                    density="compact"
                    className="min-w-0"
                  />
                </div>

                {/* Same two-column frame as the row above, so the actions line
                    up in columns directly under the document cards. */}
                <div className="mt-2 grid w-full min-w-0 gap-2 border-t border-slate-100 pt-2 xl:grid-cols-[minmax(120px,0.4fr)_minmax(0,1.6fr)] xl:items-center">
                  <div className="hidden xl:block" aria-hidden="true" />
                  <div
                    // Stacked on phones so "Download PDF" is not squeezed into a
                    // ~120px column; aligned with the cards above from sm up.
                    className={`grid w-full min-w-0 grid-cols-1 gap-1.5 p-1 ${
                      workspaceMode === 'freelance' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                    }`}
                  >
                    {workspaceMode === 'freelance' && (
                      <button
                        type="button"
                        onClick={() => setIsSendPaperworkOpen(true)}
                        disabled={emailState.status === 'loading'}
                        title="Email paperwork"
                        className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 touch-ignore"
                      >
                        <Mail size={18} className="shrink-0" />
                        <span className="truncate">{emailState.status === 'loading' ? 'Sending' : 'Email paperwork'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSharePDF}
                      disabled={shareState.status === 'loading'}
                      title="Share PDF"
                      className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 touch-ignore"
                    >
                      <Share2 size={18} className="shrink-0" />
                      <span>{shareState.status === 'loading' ? 'Preparing' : 'Share'}</span>
                    </button>
                    <button
                      onClick={handleDownloadFile}
                      title={docType === 'qrcard' ? 'Download Image' : 'Download PDF'}
                      className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-700 touch-ignore"
                    >
                      <Download size={18} className="shrink-0" />
                      <span>{docType === 'qrcard' ? 'Download Image' : 'Download PDF'}</span>
                    </button>
                  </div>
                </div>

                {(emailState.message || shareState.message) && (
                  <div className="mt-2 space-y-2 px-1">
                    {emailState.message && (
                      <p className={`rounded-lg px-3 py-2 text-xs sm:text-sm ${emailState.status === 'error' ? 'bg-amber-50 text-amber-800' : emailState.status === 'done' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
                        {emailState.message}
                      </p>
                    )}
                    {shareState.message && (
                      <p className={`rounded-lg px-3 py-2 text-xs sm:text-sm ${shareState.status === 'error' || shareState.status === 'unsupported' ? 'bg-amber-50 text-amber-800' : shareState.status === 'done' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
                        {shareState.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div ref={previewViewportRef} className="overflow-auto overflow-x-auto -mx-3 sm:mx-0 max-h-[70vh] sm:max-h-none">
                <div
                  className="relative mx-auto"
                  style={
                    previewLayout.width && previewLayout.height
                      ? { height: `${previewLayout.height}px`, width: `${previewLayout.width}px` }
                      : undefined
                  }
                >
                  <div
                    ref={previewNaturalRef}
                    className="absolute left-0 top-0 inline-block origin-top-left p-1 transition-transform"
                    style={{ transform: `scale(${previewLayout.scale})` }}
                  >
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {workspaceMode === 'freelance' && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0"
          style={{ left: '-10000px', width: '210mm' }}
        >
          <InvoicePreview ref={emailInvoiceRef} company={company} data={invoice} />
          <AgreementPreview ref={emailAgreementRef} company={company} data={agreement} />
          <ScopePreview ref={emailScopeRef} company={company} data={scope} />
          <TimelinePreview ref={emailTimelineRef} company={company} data={timeline} />
        </div>
      )}
    </div>
  );
}

function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
}

function AccountDashboardGate({ children, onSignOut, user }) {
  const { company, updateCompany } = useBusinessData();
  const rawWorkspaceMode = normalizeWorkspaceMode(company.workspaceMode);
  const workspaceMode = rawWorkspaceMode ? normalizeDeployableWorkspaceMode(rawWorkspaceMode) : '';
  const metadataWorkspaceMode = normalizeDeployableWorkspaceMode(user?.user_metadata?.workspaceMode);

  useEffect(() => {
    if (workspaceMode && rawWorkspaceMode === workspaceMode) return;
    updateCompany({ workspaceMode: metadataWorkspaceMode });
  }, [metadataWorkspaceMode, rawWorkspaceMode, updateCompany, workspaceMode]);

  const handleCompleteSetup = (nextMode) => {
    const safeMode = normalizeWorkspaceMode(nextMode);
    if (!safeMode) return;
    updateCompany({
      workspaceMode: safeMode,
      businessSubMode: safeMode === 'business' ? company.businessSubMode || 'shop' : company.businessSubMode,
    });
  };

  if (!workspaceMode && metadataWorkspaceMode) {
    return <LoadingScreen message="Opening your selected dashboard..." />;
  }

  if (!workspaceMode) {
    return (
      <AccountSetupPage
        email={user?.email}
        initialMode={metadataWorkspaceMode}
        onComplete={handleCompleteSetup}
        onSignOut={onSignOut}
      />
    );
  }

  if (workspaceMode === 'agency') {
    return <AgencyComingSoonPage email={user?.email} onSignOut={onSignOut} />;
  }

  if (workspaceMode === 'business') {
    return <BusinessDashboardPage>{children}</BusinessDashboardPage>;
  }

  return <FreelanceDashboardPage>{children}</FreelanceDashboardPage>;
}

function DirectDashboardGate({ mode }) {
  const storageNamespace = `direct-${mode}`;
  const user = useMemo(
    () => ({
      id: storageNamespace,
      email: `${mode}@local.dev`,
      user_metadata: { workspaceMode: mode },
    }),
    [mode, storageNamespace]
  );
  const initialProfileState = useMemo(() => {
    const storedProfile = readStoredCompanyProfile(storageNamespace);
    return {
      ...storedProfile,
      company: {
        ...storedProfile.company,
        workspaceMode: mode,
        businessSubMode: mode === 'business' ? storedProfile.company.businessSubMode || 'shop' : storedProfile.company.businessSubMode,
      },
      updatedAt: storedProfile.updatedAt || new Date().toISOString(),
    };
  }, [mode, storageNamespace]);
  const leaveDirectAccess = useCallback(() => {
    window.location.href = '/';
  }, []);
  const signOutDirectAccess = useCallback(() => {
    clearDocumentDraftsAfterLogout(storageNamespace);
    window.location.href = '/';
  }, [storageNamespace]);

  return (
    <BusinessDataProvider
      key={user.id}
      initialCompanyProfileState={initialProfileState}
      storageNamespace={storageNamespace}
    >
      <AccountDashboardGate user={user} onSignOut={signOutDirectAccess}>
        <DocumentWorkspace
          onShowGuide={leaveDirectAccess}
          onSignOut={signOutDirectAccess}
          profileSyncError=""
          profileSyncStatus="local"
          profileStorageLabel="locally"
          user={user}
        />
      </AccountDashboardGate>
    </BusinessDataProvider>
  );
}

function applyMetadataWorkspaceMode(profileState, metadataWorkspaceMode) {
  const profileWorkspaceMode = normalizeWorkspaceMode(profileState?.company?.workspaceMode);
  if (profileWorkspaceMode || !metadataWorkspaceMode) return profileState;

  return {
    ...profileState,
    company: {
      ...profileState.company,
      workspaceMode: metadataWorkspaceMode,
    },
    updatedAt: profileState.updatedAt || new Date().toISOString(),
  };
}

function getProfileUpdatedAtTime(profileState) {
  const timestamp = Date.parse(profileState?.updatedAt || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function SupabaseProfileHydrator({ profileState }) {
  const { companyProfileUpdatedAt, hydrateCompanyProfileState } = useBusinessData();
  const appliedProfileKeyRef = useRef('');

  useEffect(() => {
    if (!profileState) return;

    const profileKey = profileState.updatedAt || JSON.stringify(profileState.company || {});
    if (profileKey === appliedProfileKeyRef.current) return;

    const currentUpdatedAt = Date.parse(companyProfileUpdatedAt || '');
    const currentTime = Number.isFinite(currentUpdatedAt) ? currentUpdatedAt : 0;
    const nextTime = getProfileUpdatedAtTime(profileState);
    if (currentTime && nextTime && nextTime <= currentTime) {
      appliedProfileKeyRef.current = profileKey;
      return;
    }

    appliedProfileKeyRef.current = profileKey;
    hydrateCompanyProfileState(profileState);
  }, [companyProfileUpdatedAt, hydrateCompanyProfileState, profileState]);

  return null;
}

function WorkspaceGate({ onShowGuide, onSwitchWorkspace }) {
  const { session, signOut, user } = useSupabaseAuth();
  const metadataWorkspaceMode = normalizeWorkspaceMode(user?.user_metadata?.workspaceMode);
  const initialProfileState = useMemo(
    () => (user?.id ? applyMetadataWorkspaceMode(getLocalCompanyProfileFallback(user.id), metadataWorkspaceMode) : null),
    [metadataWorkspaceMode, user?.id]
  );
  const [remoteProfileState, setRemoteProfileState] = useState(null);
  const [profileLoadError, setProfileLoadError] = useState('');
  const [profileSyncStatus, setProfileSyncStatus] = useState('local');
  const [profileSyncError, setProfileSyncError] = useState('');

  useEffect(() => {
    if (!user?.id) return undefined;

    let cancelled = false;
    setRemoteProfileState(null);
    setProfileLoadError('');
    setProfileSyncError('');
    setProfileSyncStatus('loading');

    loadSupabaseCompanyProfile(user.id)
      .then((profileState) => {
        if (cancelled) return;
        setRemoteProfileState(applyMetadataWorkspaceMode(profileState, metadataWorkspaceMode));
        setProfileSyncStatus('saved');
      })
      .catch((error) => {
        if (cancelled) return;
        setProfileLoadError(error.message || 'Could not load your cloud profile.');
        setProfileSyncStatus('local');
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.user_metadata?.workspaceMode]);

  const handleProfileChange = useCallback(
    async (profileState) => {
      if (!user?.id) return;

      setProfileSyncStatus('saving');
      setProfileSyncError('');

      try {
        await saveSupabaseCompanyProfile(user.id, profileState);
        setProfileSyncStatus('saved');
      } catch (error) {
        setProfileSyncStatus('error');
        setProfileSyncError(error.message || 'Could not sync profile.');
      }
    },
    [user?.id]
  );

  const handleSignOut = useCallback(async () => {
    const storageNamespace = user?.id;
    await signOut();
    clearDocumentDraftsAfterLogout(storageNamespace);
  }, [signOut, user?.id]);

  return (
    <BusinessDataProvider
      key={user.id}
      initialCompanyProfileState={initialProfileState}
      onCompanyProfileChange={handleProfileChange}
      skipInitialProfileSync
      storageNamespace={user.id}
    >
      <SupabaseProfileHydrator profileState={remoteProfileState} />
      {profileLoadError && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Cloud profile load failed, so this session is using the local fallback. {profileLoadError}
        </div>
      )}
      <AccountDashboardGate user={user} onSignOut={handleSignOut}>
        <DocumentWorkspace
          onShowGuide={onShowGuide}
          onSwitchWorkspace={onSwitchWorkspace}
          onSignOut={handleSignOut}
          emailAccessToken={session?.access_token || ''}
          profileSyncError={profileSyncError}
          profileSyncStatus={profileSyncStatus}
          user={user}
        />
      </AccountDashboardGate>
    </BusinessDataProvider>
  );
}

function AppContent() {
  const { loading, session, signOut, user } = useSupabaseAuth();
  // Login-first entry: an unauthenticated visitor lands straight on the login
  // screen. ?choose=1 (the Switch link) jumps to the master chooser.
  const [view, setView] = useState(() => (wantsChooser() ? 'hub' : 'auth'));
  const directDashboardMode = getDirectDashboardMode();
  const welcomeEmailAttemptRef = useRef(new Set());

  const handleSignOut = useCallback(async () => {
    const storageNamespace = user?.id;
    await signOut();
    clearDocumentDraftsAfterLogout(storageNamespace);
    setView('auth');
  }, [signOut, user?.id]);

  const signedIn = Boolean(session);

  // After login/signup, always land on the chooser so the user picks tools vs
  // contracts. Drop back to auth if the session is lost while in the app.
  useEffect(() => {
    if (loading) return;
    if (session && view === 'auth') setView('hub');
    if (!session && (view === 'workspace' || view === 'hub')) setView('auth');
  }, [loading, session, view]);

  useEffect(() => {
    if (!session?.access_token || !user?.id || !user?.email || !isWelcomeEmailApiConfigured()) return;
    if (typeof window === 'undefined') return;

    const storageKey = `paperscart-welcome-email-sent-v1:${user.id}`;
    if (window.localStorage.getItem(storageKey) || welcomeEmailAttemptRef.current.has(user.id)) return;

    welcomeEmailAttemptRef.current.add(user.id);
    const name = user.user_metadata?.name || user.user_metadata?.full_name || '';

    sendWelcomeEmail({ name }, { accessToken: session.access_token })
      .then(() => {
        window.localStorage.setItem(storageKey, new Date().toISOString());
      })
      .catch((error) => {
        console.warn('Welcome email send failed:', error);
      });
  }, [
    session?.access_token,
    user?.email,
    user?.id,
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
  ]);

  if (directDashboardMode) {
    return <DirectDashboardGate mode={directDashboardMode} />;
  }

  if (loading) {
    return <LoadingScreen message="Checking your session..." />;
  }

  if (view === 'landing') {
    return (
      <LandingPage
        isSignedIn={Boolean(session)}
        onSignOut={handleSignOut}
        onStart={() => setView(signedIn ? 'hub' : 'auth')}
        user={user}
      />
    );
  }

  // Everything past the marketing landing is gated: collapse to the login page
  // until there is a session.
  if (!signedIn) {
    return <SupabaseAuthScreen onBack={() => setView('landing')} />;
  }

  // Signed in: the master chooser is home base. 'auth' lands here right after
  // login; 'hub' is an explicit return via the Switch control.
  if (view === 'hub' || view === 'auth') {
    return (
      <HubChooserPage
        email={user?.email}
        userId={user?.id}
        onChooseTools={() => {
          if (typeof window !== 'undefined' && wantsChooser()) {
            window.history.replaceState({}, '', '/studio');
          }
          setView('workspace');
        }}
        onChooseContracts={() => window.location.assign('/self-commitment')}
        onSignOut={handleSignOut}
      />
    );
  }

  return <WorkspaceGate onShowGuide={() => setView('landing')} onSwitchWorkspace={() => setView('hub')} />;
}

function App() {
  return (
    <SupabaseAuthProvider>
      <AppContent />
    </SupabaseAuthProvider>
  );
}

export default App;
