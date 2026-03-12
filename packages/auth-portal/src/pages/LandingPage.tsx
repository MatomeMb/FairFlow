import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  HandCoins,
  Leaf,
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
      <header className="sticky top-0 z-50 border-b border-[var(--ff-border)] bg-[rgba(250,250,248,0.84)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0" aria-label="Fairflow home">
            <FairflowLogo markHeight={40} showWordmark />
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
              Become a merchant
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
                Become a merchant
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
            <p className="ff-hero-1 mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ff-border)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ff-ink-muted)]">
              <Leaf size={14} className="text-[var(--ff-accent)]" />
              Circular commerce platform
            </p>
            <h1
              className="ff-hero-2 text-4xl leading-[1.05] text-[var(--ff-ink)] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
            >
              Keep goods in motion,
              <br />
              keep value in communities.
            </h1>
            <p className="ff-hero-3 mt-6 max-w-xl text-base leading-7 text-[var(--ff-ink-muted)] sm:text-lg">
              Fairflow helps merchants sell with transparent fulfillment, real-time order tracking, and trust-forward checkout.
              Customers buy with confidence while local businesses move inventory faster.
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--ff-border)] bg-white/70 px-6 py-3 text-sm font-semibold text-[var(--ff-ink)] transition hover:bg-[var(--ff-surface)]"
              >
                See how it works
              </button>
            </div>
            <p className="ff-hero-5 mt-4 text-sm text-[var(--ff-ink-muted)]">
              Already have an account? <Link to="/login" className="font-semibold text-[var(--ff-accent)] underline">Sign in</Link>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="ff-hero-2 rounded-2xl border border-[var(--ff-border)] bg-white/75 p-5">
              <Clock3 size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">Fast order flow</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Automated check-ins and ETA updates from order to delivery.</p>
            </div>
            <div className="ff-hero-3 rounded-2xl border border-[var(--ff-border)] bg-white/75 p-5">
              <ShieldCheck size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">Trust by default</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Secure customer details, merchant verification, and clear status visibility.</p>
            </div>
            <div className="ff-hero-4 rounded-2xl border border-[var(--ff-border)] bg-white/75 p-5">
              <BarChart3 size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">Merchant insight</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Track conversion and fulfillment health with practical analytics.</p>
            </div>
            <div className="ff-hero-5 rounded-2xl border border-[var(--ff-border)] bg-white/75 p-5">
              <HandCoins size={18} className="mb-2 text-[var(--ff-accent)]" />
              <p className="text-sm font-semibold">Sustainable margin</p>
              <p className="mt-1 text-sm text-[var(--ff-ink-muted)]">Move stock efficiently and reduce waste across every order cycle.</p>
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <RevealSection>
            <h2
              className="text-3xl sm:text-4xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 550 }}
            >
              How Fairflow works
            </h2>
            <p className="mt-4 max-w-2xl text-[var(--ff-ink-muted)]">
              A clean pipeline from listing to confirmed delivery, designed for merchants and buyers who value clarity.
            </p>
          </RevealSection>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <RevealSection className="rounded-2xl border border-[var(--ff-border)] bg-white/70 p-6" delayClass="ff-reveal-delay-1">
              <p className="mb-2 inline-flex rounded-full bg-[var(--ff-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--ff-accent)]">1. Publish</p>
              <h3 className="text-lg font-semibold">Create product flows</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ff-ink-muted)]">List inventory with clear details and deliver a branded product page instantly.</p>
            </RevealSection>
            <RevealSection className="rounded-2xl border border-[var(--ff-border)] bg-white/70 p-6" delayClass="ff-reveal-delay-2">
              <p className="mb-2 inline-flex rounded-full bg-[var(--ff-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--ff-accent)]">2. Fulfill</p>
              <h3 className="text-lg font-semibold">Automate check-ins</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ff-ink-muted)]">Order status and customer updates stay synchronized with minimal manual work.</p>
            </RevealSection>
            <RevealSection className="rounded-2xl border border-[var(--ff-border)] bg-white/70 p-6" delayClass="ff-reveal-delay-3">
              <p className="mb-2 inline-flex rounded-full bg-[var(--ff-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--ff-accent)]">3. Grow</p>
              <h3 className="text-lg font-semibold">Improve every cycle</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ff-ink-muted)]">Use reporting trends to tune operations and improve customer confidence.</p>
            </RevealSection>
          </div>
        </section>

        <section id="why" className="border-y border-[var(--ff-border)] bg-white/50">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
            <RevealSection>
              <h2
                className="text-3xl sm:text-4xl"
                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 550 }}
              >
                Why teams choose Fairflow
              </h2>
              <p className="mt-4 text-[var(--ff-ink-muted)]">
                We combine practical operations tooling with a buyer experience that feels high-trust and easy to follow.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--ff-ink-muted)]">
                <li className="flex items-start gap-3"><ShieldCheck size={16} className="mt-0.5 text-[var(--ff-accent)]" /> Role-aware access and guardrails built for growing teams.</li>
                <li className="flex items-start gap-3"><Store size={16} className="mt-0.5 text-[var(--ff-accent)]" /> Merchant-first portal patterns for day-to-day execution.</li>
                <li className="flex items-start gap-3"><Leaf size={16} className="mt-0.5 text-[var(--ff-accent)]" /> Circular commerce positioning that aligns with modern buyers.</li>
              </ul>
            </RevealSection>

            <RevealSection className="rounded-3xl border border-[var(--ff-border)] bg-[linear-gradient(135deg,rgba(216,243,220,0.65),rgba(255,255,255,0.8))] p-7" delayClass="ff-reveal-delay-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ff-ink-muted)]">Operator note</p>
              <p className="mt-4 text-lg leading-8 text-[var(--ff-ink)]">
                "The platform turned order follow-up from scattered messages into one clear timeline. That gave our team back hours each week."
              </p>
              <p className="mt-5 text-sm font-semibold text-[var(--ff-ink-muted)]">Pilot merchant, Fairflow network</p>
            </RevealSection>
          </div>
        </section>

        <section id="merchants" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <RevealSection className="rounded-3xl border border-[var(--ff-border)] bg-[var(--ff-navy)] p-8 text-[var(--ff-cream)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ff-accent-light)]">Merchant spotlight</p>
            <h2 className="mt-3 text-3xl sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 520 }}>
              A practical portal for sustainable growth.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[rgba(244,241,235,0.82)] sm:text-base">
              Run listings, monitor check-ins, and handle customer communication in one consistent workspace.
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
      </main>

      <footer id="contact" className="border-t border-[var(--ff-border)] bg-[rgba(250,250,248,0.9)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-[var(--ff-ink-muted)] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <FairflowLogo markHeight={30} showWordmark={false} style="derivative" />
            <span>fairflow</span>
          </div>
          <p>Build better commerce loops. Contact: hello@fairflow.local</p>
          <p>© {new Date().getFullYear()} Fairflow</p>
        </div>
      </footer>
    </div>
  );
}
