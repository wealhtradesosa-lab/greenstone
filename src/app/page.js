'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(165deg, #070F0B 0%, #0A1F14 30%, #0D2E1E 50%, #0A1F14 70%, #070F0B 100%)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M10 0L14 7H6L10 0Z" fill="#C8A951" opacity="0.8"/>
            <path d="M6 7H14L10 20L6 7Z" fill="#C8A951"/>
          </svg>
          <span className="font-elegant text-xl font-semibold tracking-[0.15em] text-ivory">GREENSTONE</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="font-body text-xs font-medium tracking-widest text-gold hover:text-gold-light transition-colors">
            SIGN IN
          </Link>
          <Link href="/register" className="gs-btn-primary !py-2.5 !px-5 !text-[11px]">
            REQUEST ACCESS
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-2xl animate-fade-in">
          {/* Overline */}
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="w-10 h-px bg-gold" />
            <span className="font-body text-[11px] font-semibold tracking-[0.25em] text-gold uppercase">
              The Professional Emerald Marketplace
            </span>
            <div className="w-10 h-px bg-gold" />
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-normal text-ivory leading-[1.1] mb-6">
            Where Exceptional{' '}
            <em className="italic bg-gradient-to-r from-emerald-glow to-gold bg-clip-text text-transparent">
              Emeralds
            </em>
            <br />Meet Trusted Trade
          </h1>

          <p className="font-elegant text-xl md:text-2xl font-light text-white/40 leading-relaxed max-w-lg mx-auto mb-10">
            Curated, verified, and ready to trade.<br />
            Every stone inspected. Every deal transparent.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="gs-btn-primary border border-gold/30">
              Get Started
            </Link>
            <Link href="/login" className="gs-btn-outline !border-white/20 !text-ivory hover:!bg-white/5">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer line */}
      <footer className="text-center py-6">
        <span className="font-mono text-[10px] text-white/15 tracking-wider">
          MÉXICO · COLOMBIA · USA
        </span>
      </footer>
    </div>
  );
}
