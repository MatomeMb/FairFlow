import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useReveal } from "../hooks/useReveal";

function RevealSection({
  children,
  className = "",
  delayClass = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delayClass?: string;
  style?: React.CSSProperties;
}) {
  const { ref, isVisible } = useReveal<HTMLDivElement>(0.18);
  return (
    <div
      ref={ref}
      className={`ff-reveal ${isVisible ? "is-visible" : ""} ${delayClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll);
  }

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  };
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: "var(--ff-bg)",
        color: "var(--ff-ink)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Navigation */}
      <header
        className="sticky top-0 z-[120] transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(13,27,42,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(170,255,69,0.25)" : "none",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0" aria-label="Fairflow home">
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "var(--ff-accent)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ff-navy)",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              ff.
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium transition"
              style={{ color: "var(--ff-ink)" }}
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("why-fairflow")}
              className="text-sm font-medium transition"
              style={{ color: "var(--ff-ink)" }}
            >
              Why Fairflow
            </button>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="#merchant-cta"
              className="rounded-full px-5 py-2 text-sm font-semibold transition"
              style={{
                backgroundColor: "var(--ff-accent)",
                color: "var(--ff-navy)",
              }}
            >
              Start selling
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
            style={{ color: "var(--ff-ink)" }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div
            className="border-t px-4 py-4 md:hidden"
            style={{
              borderColor: "var(--ff-border)",
              backgroundColor: "var(--ff-bg)",
            }}
          >
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => scrollToSection("how-it-works")}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium"
                style={{ color: "var(--ff-ink)" }}
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("why-fairflow")}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium"
                style={{ color: "var(--ff-ink)" }}
              >
                Why Fairflow
              </button>
              <Link
                to="#merchant-cta"
                className="rounded-lg px-3 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: "var(--ff-accent)",
                  color: "var(--ff-navy)",
                }}
                onClick={() => setMobileOpen(false)}
              >
                Start selling
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section
          className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
          style={{
            paddingTop: "120px",
            paddingBottom: "80px",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(170,255,69,0.1) 0%, transparent 50%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <p
              className="ff-hero-1 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--ff-accent)",
                color: "var(--ff-accent)",
              }}
            >
              Circular Commerce Platform
            </p>

            <h1
              className="ff-hero-2 text-5xl leading-tight sm:text-6xl"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 900,
                color: "var(--ff-ink)",
              }}
            >
              Getting your goods{" "}
              <span style={{ color: "var(--ff-accent)" }}>online.</span>
            </h1>

            <p
              className="ff-hero-3 mt-6 mx-auto max-w-xl text-base leading-7 sm:text-lg"
              style={{ color: "var(--ff-ink-muted)" }}
            >
              Fairflow helps you to get your products online, sell them and stay connected with your customers.
            </p>

            <div className="ff-hero-4 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/merchant/register"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition"
                style={{
                  backgroundColor: "var(--ff-accent)",
                  color: "var(--ff-navy)",
                  width: "100%",
                }}
              >
                Start selling
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection("how-it-works")}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid var(--ff-ink)",
                  color: "var(--ff-ink)",
                  width: "100%",
                }}
              >
                See how it works
              </button>
            </div>

            <p className="ff-hero-5 mt-4 text-sm" style={{ color: "var(--ff-ink-muted)" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold underline transition"
                style={{ color: "var(--ff-accent)" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <RevealSection className="mb-12 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--ff-accent)" }}
            >
              How it works
            </p>
            <h2
              className="mt-4 text-4xl leading-tight sm:text-5xl"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 900,
              }}
            >
              Three simple steps.
            </h2>
          </RevealSection>

          <div className="grid gap-6 md:grid-cols-3">
            <RevealSection
              className="rounded-lg p-6"
              delayClass="ff-reveal-delay-1"
              style={{
                backgroundColor: "var(--ff-surface)",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4"
                style={{
                  backgroundColor: "var(--ff-accent)",
                  color: "var(--ff-navy)",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                1
              </div>
              <h3 className="text-lg font-semibold">List your products</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--ff-ink-muted)" }}>
                Add what you are selling. Set your price, add a photo, and you are live in minutes.
              </p>
            </RevealSection>

            <RevealSection
              className="rounded-lg p-6"
              delayClass="ff-reveal-delay-2"
              style={{
                backgroundColor: "var(--ff-surface)",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4"
                style={{
                  backgroundColor: "var(--ff-accent)",
                  color: "var(--ff-navy)",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                2
              </div>
              <h3 className="text-lg font-semibold">Customers buy from you</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--ff-ink-muted)" }}>
                They pay securely online. No cash, no chasing payments — it just comes to you.
              </p>
            </RevealSection>

            <RevealSection
              className="rounded-lg p-6"
              delayClass="ff-reveal-delay-3"
              style={{
                backgroundColor: "var(--ff-surface)",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4"
                style={{
                  backgroundColor: "var(--ff-accent)",
                  color: "var(--ff-navy)",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                3
              </div>
              <h3 className="text-lg font-semibold">Stay in touch</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--ff-ink-muted)" }}>
                Know when every order is placed and when it is delivered. Your customers always know what is happening.
              </p>
            </RevealSection>
          </div>

          {/* Social Proof Quote */}
          <RevealSection
            className="mt-12 rounded-lg p-6 border"
            style={{
              borderColor: "var(--ff-accent)",
            }}
          >
            <p
              className="text-lg leading-8 mb-4"
              style={{ color: "var(--ff-ink)" }}
            >
              "The platform turned order follow-up from scattered messages into one clear timeline. That gave our team back hours each week."
            </p>
            <p style={{ color: "var(--ff-ink-muted)" }}>
              — Pilot merchant, Fairflow network
            </p>
          </RevealSection>
        </section>

        {/* Why Fairflow Section */}
        <section
          id="why-fairflow"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="grid gap-12 md:grid-cols-2">
            <RevealSection>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--ff-accent)" }}
              >
                Why Fairflow
              </p>
              <h2
                className="text-4xl leading-tight sm:text-5xl mb-4"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 900,
                }}
              >
                Built for people who sell.
              </h2>
              <p className="text-base leading-7" style={{ color: "var(--ff-ink-muted)" }}>
                No complicated setup. No confusion. Just tools that work.
              </p>
            </RevealSection>

            <div className="grid gap-4">
              <RevealSection
                className="rounded-lg p-6"
                delayClass="ff-reveal-delay-1"
                style={{
                  backgroundColor: "var(--ff-surface)",
                }}
              >
                <Clock3 size={24} style={{ color: "var(--ff-accent)", marginBottom: "12px" }} />
                <h3 className="font-semibold text-lg mb-2">Fast order flow</h3>
                <p style={{ color: "var(--ff-ink-muted)" }} className="text-sm">
                  Your customer places an order — you know about it straight away.
                </p>
              </RevealSection>

              <RevealSection
                className="rounded-lg p-6"
                delayClass="ff-reveal-delay-2"
                style={{
                  backgroundColor: "var(--ff-surface)",
                }}
              >
                <Shield size={24} style={{ color: "var(--ff-accent)", marginBottom: "12px" }} />
                <h3 className="font-semibold text-lg mb-2">Safe and trusted</h3>
                <p style={{ color: "var(--ff-ink-muted)" }} className="text-sm">
                  Customer details are secure. Payments are handled properly. No shortcuts.
                </p>
              </RevealSection>

              <RevealSection
                className="rounded-lg p-6"
                delayClass="ff-reveal-delay-3"
                style={{
                  backgroundColor: "var(--ff-surface)",
                }}
              >
                <BarChart3 size={24} style={{ color: "var(--ff-accent)", marginBottom: "12px" }} />
                <h3 className="font-semibold text-lg mb-2">See what is working</h3>
                <p style={{ color: "var(--ff-ink-muted)" }} className="text-sm">
                  Simple numbers that show you how your business is doing — no jargon.
                </p>
              </RevealSection>

              <RevealSection
                className="rounded-lg p-6"
                delayClass="ff-reveal-delay-4"
                style={{
                  backgroundColor: "var(--ff-surface)",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor: "var(--ff-accent)",
                    color: "var(--ff-navy)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  💰
                </div>
                <h3 className="font-semibold text-lg mb-2">Keep money in your pocket</h3>
                <p style={{ color: "var(--ff-ink-muted)" }} className="text-sm">
                  Move your stock without waste. Every sale counts.
                </p>
              </RevealSection>
            </div>
          </div>

          {/* Trust Bar - Payments & Compliance */}
          <RevealSection className="mt-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: "var(--ff-ink-muted)" }}
            >
              Payments & Compliance
            </p>

            <div className="grid gap-3 md:grid-cols-4">
              {/* Paystack */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00c3f7] text-[10px] font-black text-white">
                  P
                </span>
                <span className="ml-2 text-xs font-semibold">PAYSTACK</span>
              </div>

              {/* VISA */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="text-xs font-black italic tracking-[0.02em] text-[#1434cb]">
                  VISA
                </span>
              </div>

              {/* Mastercard */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="relative inline-flex h-4 w-7 items-center">
                  <span className="absolute left-0 h-4 w-4 rounded-full bg-[#eb001b]" />
                  <span className="absolute right-0 h-4 w-4 rounded-full bg-[#f79e1b]" />
                </span>
                <span className="ml-2 text-xs font-semibold">MC</span>
              </div>

              {/* EFT */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#2f855a] text-[10px] font-black text-white">
                  R
                </span>
                <span className="ml-2 text-xs font-semibold">EFT</span>
              </div>

              {/* POPIA */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#1f7a3e] text-[10px] font-black text-[#1f7a3e]">
                  SA
                </span>
                <span className="ml-2 text-xs font-semibold">POPIA</span>
              </div>

              {/* KYC */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1f7a3e] text-[10px] font-black text-white">
                  ID
                </span>
                <span className="ml-2 text-xs font-semibold">KYC</span>
              </div>

              {/* AML */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#9b2c2c] text-[10px] font-black text-white">
                  A
                </span>
                <span className="ml-2 text-xs font-semibold">AML</span>
              </div>

              {/* Privacy */}
              <div
                className="flex items-center justify-center rounded-lg p-3 border"
                style={{
                  backgroundColor: "var(--ff-surface)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#2b6cb0] text-[10px] font-black text-[#2b6cb0]">
                  P
                </span>
                <span className="ml-2 text-xs font-semibold">PRIVACY</span>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* Final CTA Section */}
        <section
          id="merchant-cta"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <RevealSection
            className="rounded-3xl p-8 sm:p-12 text-center"
            style={{
              backgroundColor: "var(--ff-accent)",
              color: "var(--ff-navy)",
            }}
          >
            <h2
              className="text-4xl leading-tight sm:text-5xl mb-4"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 900,
              }}
            >
              Ready to start selling?
            </h2>
            <p className="text-base leading-7 mb-8 max-w-2xl mx-auto">
              It takes less than 5 minutes to set up your store.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/merchant/register"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition"
                style={{
                  backgroundColor: "var(--ff-navy)",
                  color: "var(--ff-ink)",
                }}
              >
                Register your merchant account
              </Link>
              <Link
                to="/merchant/login"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition"
                style={{
                  backgroundColor: "transparent",
                  border: `2px solid var(--ff-navy)`,
                  color: "var(--ff-navy)",
                }}
              >
                Merchant sign in
              </Link>
            </div>
          </RevealSection>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--ff-border)",
          backgroundColor: "var(--ff-bg)",
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: "var(--ff-accent)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ff-navy)",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  ff.
                </div>
                <span className="font-semibold">fairflow</span>
              </div>
              <p className="text-sm leading-6" style={{ color: "var(--ff-ink-muted)" }}>
                Professional commerce for merchants, teams, and trusted customer journeys. Contact:{" "}
                <a href="mailto:hello@fairflow.co.za" style={{ color: "var(--ff-accent)" }}>
                  hello@fairflow.co.za
                </a>
              </p>
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--ff-ink-muted)" }}
              >
                Links
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/privacy" style={{ color: "var(--ff-ink-muted)" }}>
                  Privacy
                </Link>
                <Link to="/terms" style={{ color: "var(--ff-ink-muted)" }}>
                  Terms
                </Link>
                <a href="mailto:hello@fairflow.co.za" style={{ color: "var(--ff-ink-muted)" }}>
                  Support
                </a>
              </div>
            </div>

            <div className="text-right">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--ff-ink-muted)" }}
              >
                Copyright
              </p>
              <p style={{ color: "var(--ff-ink-muted)" }} className="text-sm">
                © 2026 Fairflow. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
