import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  HandCoins,
  Leaf,
  Link2,
  Menu,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { FairflowLogo } from "../components/FairflowLogo";
import { useReveal } from "../hooks/useReveal";

function RevealSection({
  children,
  className = "",
  delayClass = "",
}: {
  children: React.ReactNode;
  className?: string;
  delayClass?: string;
}) {
  const { ref, isVisible } = useReveal<HTMLDivElement>(0.18);
  return (
    <div
      ref={ref}
      className={`ff-reveal ${isVisible ? "is-visible" : ""} ${delayClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "How it works", id: "how" },
    { label: "Why Fairflow", id: "why" },
    { label: "For merchants", id: "merchants" },
    { label: "Contact", id: "contact" },
  ];

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };

  return (
    <div
      className="ff-grain min-h-screen overflow-x-hidden"
      style={{
        background:
          "radial-gradient(circle at 12% 8%, var(--ff-accent-light) 0%, rgba(216,243,220,0) 36%), radial-gradient(circle at 88% 12%, rgba(183,121,31,0.12) 0%, rgba(183,121,31,0) 30%), linear-gradient(180deg, var(--ff-bg) 0%, var(--ff-surface) 100%)",
        color: "var(--ff-ink)",
      }}
    >
      <header className="sticky top-0 z-[120] border-b border-[var(--ff-border)] bg-[rgba(13,27,42,0.92)] backdrop-blur-[2px]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 rounded-xl border border-[var(--ff-border)] bg-[#1A2D42] px-2.5 py-1.5" aria-label="Fairflow home">
            <FairflowLogo markHeight={38} showWordmark variant="light" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-[var(--ff-ink-muted)] transition hover:text-[var(--ff-ink)]"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-full border border-[var(--ff-border)] px-4 py-2 text-sm font-semibold text-[var(--ff-ink)] transition hover:bg-[var(--ff-surface)]"
            >
              Sign in
            </Link>
            <Link
              to="/merchant/register"
              className="rounded-full bg-[var(--ff-accent)] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Start selling
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-[var(--ff-border)] p-2 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[var(--ff-border)] bg-[var(--ff-bg)] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--ff-ink-muted)] hover:bg-[var(--ff-surface)] hover:text-[var(--ff-ink)]"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/login"
                className="rounded-lg border border-[var(--ff-border)] px-3 py-2 text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/merchant/register"
                className="rounded-lg bg-[var(--ff-accent)] px-3 py-2 text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Start selling
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-8 lg:pt-20">
          <div aria-hidden className="pointer-events-none absolute -right-10 top-4 hidden opacity-10 lg:block">
            <FairflowLogo markHeight={220} showWordmark={false} style="derivative" />
          </div>

          <div>
            <p className="ff-hero-1 mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ff-ink-muted)]">
              <Leaf size={14} className="text-[var(--ff-accent)]" />
              Circular commerce platform
            </p>
            <h1
              className="ff-hero-2 text-4xl leading-[1.08] text-[var(--ff-ink)] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
            >
              Sell anywhere with a single link. No storefront needed.
            </h1>
            <p className="ff-hero-3 mt-6 max-w-xl text-sm leading-7 text-[var(--ff-ink-muted)] sm:text-base">
              Wherever your customers are — WhatsApp, Instagram, email, SMS — your store is already there. Go live in
              seconds, get paid instantly.
            </p>
            <div className="ff-hero-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/merchant/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ff-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
              >
                Start selling
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection("how")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ff-border)] bg-[#1A2D42] px-6 py-3 text-sm font-semibold text-[var(--ff-ink)] transition hover:bg-[var(--ff-surface)]"
              >
                See how it works
              </button>
            </div>
            <p className="ff-hero-5 mt-4 text-sm text-[var(--ff-ink-muted)]">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[var(--ff-accent)] underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="ff-hero-2 rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-5">
              <Clock3 size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">Fast order flow</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Your customer places an order — you know about it straight away.</p>
            </div>
            <div className="ff-hero-3 rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-5">
              <ShieldCheck size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">Safe and trusted</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Customer details are secure. Payments are handled properly. No shortcuts.</p>
            </div>
            <div className="ff-hero-4 rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-5">
              <BarChart3 size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">See what is working</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Simple numbers that show you how your business is doing — no jargon.</p>
            </div>
            <div className="ff-hero-5 rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-5">
              <HandCoins size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">Keep money in your pocket</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Move your stock without waste. Every sale counts.</p>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <RevealSection>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ff-ink)]">HOW IT WORKS</h2>
          </RevealSection>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <RevealSection className="rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-6" delayClass="ff-reveal-delay-1">
              <Store size={22} className="mb-4 text-[var(--ff-accent)]" aria-hidden />
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ff-ink-muted)]">Step 1</p>
              <h3 className="text-lg font-semibold text-[var(--ff-ink)]">List your product in seconds</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ff-ink-muted)]">
                Fill in your product details and go live instantly. No website, no developer, no hassle.
              </p>
            </RevealSection>
            <RevealSection className="rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-6" delayClass="ff-reveal-delay-2">
              <Link2 size={22} className="mb-4 text-[var(--ff-accent)]" aria-hidden />
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ff-ink-muted)]">Step 2</p>
              <h3 className="text-lg font-semibold text-[var(--ff-ink)]">Your link works everywhere</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ff-ink-muted)]">
                One link. WhatsApp, Instagram, email, SMS — wherever your customers are, your store is already there.
              </p>
            </RevealSection>
            <RevealSection className="rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-6" delayClass="ff-reveal-delay-3">
              <HandCoins size={22} className="mb-4 text-[var(--ff-accent)]" aria-hidden />
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ff-ink-muted)]">Step 3</p>
              <h3 className="text-lg font-semibold text-[var(--ff-ink)]">Get paid on a reliable schedule</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ff-ink-muted)]">
                Customers checkout securely. Funds are held safely and released to you every week — no chasing payments.
              </p>
            </RevealSection>
          </div>
        </section>

        <section id="why" className="border-y border-[rgba(255,255,255,0.07)]">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
            <RevealSection>
              <h2
                className="text-3xl sm:text-4xl"
                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 550 }}
              >
                Built for people who sell.
              </h2>
              <p className="mt-4 text-[var(--ff-ink-muted)]">
                No complicated setup. No confusion. Just tools that work.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--ff-ink-muted)]">
                <li className="flex items-start gap-3">
                  <ShieldCheck size={16} className="mt-0.5 text-[var(--ff-accent)]" />
                  Your customers always know their order is safe.
                </li>
                <li className="flex items-start gap-3">
                  <Store size={16} className="mt-0.5 text-[var(--ff-accent)]" />
                  Everything you need to run your store in one place.
                </li>
                <li className="flex items-start gap-3">
                  <Leaf size={16} className="mt-0.5 text-[var(--ff-accent)]" />
                  Sell more, waste less, keep more of what you earn.
                </li>
              </ul>
            </RevealSection>

            <RevealSection className="rounded-3xl border border-[var(--ff-border)] bg-[rgba(170,255,69,0.08)] border border-[rgba(170,255,69,0.25)] p-7" delayClass="ff-reveal-delay-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ff-ink-muted)]">Merchant note</p>
              <p className="mt-4 text-lg leading-8 text-[var(--ff-ink)]">
                "The platform turned order follow-up from scattered messages into one clear timeline. That gave our team back hours each week."
              </p>
              <p className="mt-5 text-sm font-semibold text-[var(--ff-ink-muted)]">Pilot merchant, Fairflow network</p>
            </RevealSection>
          </div>
        </section>

        <section id="merchants" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <RevealSection className="rounded-3xl border border-[var(--ff-border)] bg-[var(--ff-navy)] p-8 text-[var(--ff-cream)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ff-accent-light)]">Get started</p>
            <h2 className="mt-3 text-3xl sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 520 }}>
              Ready to start selling?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[rgba(244,241,235,0.82)] sm:text-base">
              It takes less than 5 minutes to set up your store.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/merchant/register"
                className="inline-flex items-center justify-center rounded-full bg-[var(--ff-accent-light)] px-5 py-3 text-sm font-semibold text-[var(--ff-navy)] transition hover:brightness-95"
              >
                Register your merchant account
              </Link>
              <Link
                to="/merchant/login"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(244,241,235,0.38)] px-5 py-3 text-sm font-semibold text-[var(--ff-cream)] transition hover:bg-[rgba(244,241,235,0.1)]"
              >
                Merchant sign in
              </Link>
            </div>
          </RevealSection>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <RevealSection className="rounded-2xl border border-[var(--ff-border)] bg-[#1A2D42] p-8 sm:p-10">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ff-ink)]">PRICING</h2>
            <p
              className="mt-6 text-2xl font-semibold leading-tight text-[var(--ff-accent)] sm:text-3xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
            >
              Free for merchants. Always.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ff-ink-muted)] sm:text-base">
              A 3% service fee is added to the customer&apos;s total at checkout — you receive your full selling price,
              every time.
            </p>
          </RevealSection>
        </section>
      </main>

      <footer id="contact" className="border-t border-[var(--ff-border)] bg-[#0D1B2A]">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 text-sm text-[var(--ff-ink-muted)] md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-3 text-[var(--ff-ink)]">
                <FairflowLogo markHeight={30} showWordmark variant="light" />
              </div>
              <p>Wherever your customers are — WhatsApp, Instagram, email, SMS — your store is already there.</p>
              <p className="mt-3">Contact: hello@fairflow.co.za</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ff-ink)]">Payments</p>
              <p>Powered by trusted payment infrastructure partners.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-semibold text-[var(--ff-ink)]">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00c3f7] text-[10px] font-black text-white">P</span>
                  PAYSTACK
                </div>
                <div className="flex items-center justify-center rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-black italic tracking-[0.02em] text-[#1434cb]">
                  VISA
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-semibold text-[var(--ff-ink)]">
                  <span className="relative inline-flex h-4 w-7 items-center">
                    <span className="absolute left-0 h-4 w-4 rounded-full bg-[#eb001b]" />
                    <span className="absolute right-0 h-4 w-4 rounded-full bg-[#f79e1b]" />
                  </span>
                  MASTERCARD
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-semibold text-white">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#2f855a] text-[10px] font-black text-white">R</span>
                  EFT
                </div>
              </div>
              <p className="mt-2">Supported methods: card payments, EFT, and wallet-compatible checkout flows.</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ff-ink)]">Compliance</p>
              <p>Built with POPIA-aware data handling and audit-friendly merchant workflows.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-semibold text-[var(--ff-ink)]">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#1f7a3e] text-[10px] font-black text-[#1f7a3e]">SA</span>
                  POPIA
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-semibold text-[var(--ff-ink)]">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1f7a3e] text-[10px] font-black text-white">ID</span>
                  KYC
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-semibold text-[var(--ff-ink)]">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#9b2c2c] text-[10px] font-black text-white">A</span>
                  AML
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--ff-border)] bg-[#1A2D42] px-3 py-2 text-xs font-semibold text-[var(--ff-ink)]">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#2b6cb0] text-[10px] font-black text-[#2b6cb0]">P</span>
                  PRIVACY
                </div>
              </div>
              <p className="mt-2">KYC and payout controls are integrated for responsible marketplace operations.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-[var(--ff-border)] pt-4 text-xs text-[var(--ff-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Fairflow. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-[var(--ff-ink)] transition">Privacy</Link>
              <a href="mailto:hello@fairflow.co.za" className="hover:text-[var(--ff-ink)] transition">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
