'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useLang, LangSwitcher } from '@/lib/lang';

const BADGE_STYLES = {
  COLLECTOR: 'bg-gradient-to-r from-[#C8A951] to-[#E2CB7D] text-[#1A1A1A] border-[#C8A951]',
  PREMIUM: 'bg-gradient-to-r from-[#064E3B] to-[#047857] text-[#FEFCF3] border-[#047857]',
  SELECT: 'bg-gradient-to-r from-[#10B981] to-[#34D399] text-[#064E3B] border-[#10B981]',
  COMMERCIAL: 'bg-[#6B6B6B] text-[#FEFCF3] border-[#6B6B6B]',
  VALUE: 'bg-[#E5E5E5] text-[#6B6B6B] border-[#D4D4D4]',
};

function AnimatedNumber({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let c = 0; const step = target / 60;
    const t = setInterval(() => { c += step; if (c >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(c)); }, 16);
    return () => clearInterval(t);
  }, [started, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix || ''}</span>;
}

function StoneCard({ stone }) {
  const [h, setH] = useState(false);
  const badge = stone.badge || 'COMMERCIAL';
  const sc = badge === 'COLLECTOR' ? '#C8A951' : '#34D399';
  const photo = stone.emerald_media?.sort((a,b) => a.sort_order - b.sort_order)?.find(m => m.type === 'photo');
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="flex-shrink-0 w-[280px] bg-white rounded-md overflow-hidden cursor-pointer"
      style={{ boxShadow: h ? '0 20px 60px rgba(6,78,59,0.15)' : '0 2px 12px rgba(0,0,0,0.06)', transform: h ? 'translateY(-8px)' : 'translateY(0)', transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)' }}>
      <div className="h-[260px] relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0A2E1F 0%, #0D3B27 40%, #064E3B 100%)' }}>
        {photo ? <img src={photo.url} alt="" className="w-full h-full object-cover" /> : (
          <><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }} />
          <svg viewBox="0 0 200 200" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px]">
            <polygon points="100,15 170,60 170,140 100,185 30,140 30,60" fill="none" stroke={sc} strokeWidth="1.5" opacity="0.6"/>
            <polygon points="100,40 150,70 150,130 100,160 50,130 50,70" fill="#34D399" opacity="0.3"/>
          </svg></>
        )}
        <span className={`absolute top-3.5 left-3.5 px-3 py-1 text-[10px] font-bold tracking-widest rounded border ${BADGE_STYLES[badge]}`}>{badge}</span>
      </div>
      <div className="p-[18px_20px_20px]">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-display text-base font-semibold text-charcoal leading-tight">{stone.commercial_name || stone.internal_code}</h3>
            <p className="font-body text-xs text-warm-gray mt-1">{stone.origin} · {stone.shape}</p>
          </div>
          <span className="font-mono text-[11px] text-emerald-mid bg-emerald-light/10 px-2 py-0.5 rounded">{stone.weight_ct} ct</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-black/5">
          <span className="font-mono text-lg font-bold text-charcoal">${stone.precio_publicado?.toLocaleString()}</span>
          <Link href="/register" className="bg-emerald-deep text-ivory font-body text-[11px] font-semibold tracking-wider px-4 py-2 rounded hover:bg-emerald-deep/90 transition-colors">MAKE OFFER</Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLang();
  const [scrollY, setScrollY] = useState(0);
  const [stones, setStones] = useState([]);
  const [count, setCount] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener('scroll', h, { passive: true }); return () => window.removeEventListener('scroll', h); }, []);
  useEffect(() => {
    const s = createClient();
    s.from('emeralds').select('*, emerald_media(url, type, sort_order)', { count: 'exact' }).eq('status', 'publicada').order('score_tecnico', { ascending: false }).limit(6)
      .then(({ data, count: c }) => { setStones(data || []); setCount(c || 0); });
  }, []);
  const solid = scrollY > 80;

  return (
    <div className="font-body text-charcoal bg-ivory min-h-screen overflow-x-hidden">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all ${solid ? 'py-3.5 bg-[rgba(10,20,15,0.95)] backdrop-blur-xl border-b border-[#C8A951]/10' : 'py-5 bg-transparent'}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 0L14 7H6L10 0Z" fill="#C8A951" opacity="0.8"/><path d="M6 7H14L10 20L6 7Z" fill="#C8A951"/></svg>
          <span className="font-elegant text-[22px] font-semibold tracking-[0.15em] text-ivory">GREENSTONE</span>
        </Link>
        <div className="hidden md:flex items-center gap-9">
          <a href="#catalog" className="text-xs font-medium tracking-[0.1em] text-white/60 hover:text-[#C8A951] transition-colors">{t.catalog}</a>
          <a href="#how" className="text-xs font-medium tracking-[0.1em] text-white/60 hover:text-[#C8A951] transition-colors">{t.howItWorks}</a>
          <a href="#suppliers" className="text-xs font-medium tracking-[0.1em] text-white/60 hover:text-[#C8A951] transition-colors">{t.forSuppliers}</a>
          <a href="#trust" className="text-xs font-medium tracking-[0.1em] text-white/60 hover:text-[#C8A951] transition-colors">{t.about}</a>
          <LangSwitcher />
          <div className="w-px h-5 bg-white/15 mx-1" />
          <Link href="/login" className="text-xs font-medium tracking-[0.1em] text-[#C8A951] hover:text-[#E2CB7D] transition-colors">{t.signIn}</Link>
          <Link href="/register" className="gs-btn-primary !py-2.5 !px-5 !text-[11px]">{t.requestAccess}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #070F0B 0%, #0A1F14 30%, #0D2E1E 50%, #0A1F14 70%, #070F0B 100%)' }}>
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)' }} />
        <div className="text-center max-w-[800px] px-6 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-7 animate-fade-in">
            <div className="w-10 h-px bg-[#C8A951]" /><span className="text-[11px] font-semibold tracking-[0.25em] text-[#C8A951] uppercase">{t.overline}</span><div className="w-10 h-px bg-[#C8A951]" />
          </div>
          <h1 className="font-display text-[clamp(42px,6vw,72px)] font-normal text-ivory leading-[1.1] mb-6 animate-fade-in">{t.heroTitle1} <em className="italic bg-gradient-to-r from-[#34D399] to-[#C8A951] bg-clip-text text-transparent">{t.heroTitle2}</em><br />{t.heroTitle3}</h1>
          <p className="font-elegant text-[clamp(18px,2.2vw,24px)] font-light text-white/45 leading-relaxed max-w-[560px] mx-auto mb-11 animate-fade-in">{t.heroSub1}<br />{t.heroSub2}</p>
          <div className="flex gap-4 justify-center animate-fade-in">
            <Link href="/register" className="gs-btn-primary border border-[#C8A951]/30">{t.exploreCatalog}</Link>
            <Link href="/register" className="gs-btn-outline !border-white/20 !text-ivory hover:!bg-white/5">{t.requestAccess}</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-12 bg-charcoal flex justify-center gap-20 flex-wrap">
        {[{ n: Math.max(count,500), s: '+', l: t.verifiedStones },{ n: 120, s: '+', l: t.activeBuyers },{ n: 15, s: '', l: t.countries },{ n: 98, s: '%', l: t.clientSatisfaction }].map((x,i) => (
          <div key={i} className="text-center min-w-[140px]">
            <div className="font-display text-[42px] font-normal text-ivory leading-none mb-2"><AnimatedNumber target={x.n} suffix={x.s} /></div>
            <div className="text-[11px] font-medium tracking-[0.15em] text-white/35 uppercase">{x.l}</div>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-12 bg-ivory">
        <div className="text-center max-w-[600px] mx-auto mb-[72px]">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-emerald-mid uppercase">{t.howItWorks}</span>
          <h2 className="font-display text-[clamp(30px,4vw,38px)] font-normal text-charcoal mt-4 leading-tight">{t.howTitle1}<br /><em className="italic text-emerald-deep">{t.howTitle2}</em></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1000px] mx-auto">
          {[{ s:'01',t:t.step1Title,d:t.step1Desc,i:'⬆' },
            { s:'02',t:t.step2Title,d:t.step2Desc,i:'◈' },
            { s:'03',t:t.step3Title,d:t.step3Desc,i:'⤝' }].map((x,i) => (
            <div key={i} className="text-center px-3">
              <div className="font-mono text-xs font-semibold text-[#C8A951] tracking-[0.1em] mb-5">{x.s}</div>
              <div className="w-20 h-20 rounded-full border border-black/5 bg-emerald-deep/[0.03] flex items-center justify-center mx-auto mb-6 text-[28px]">{x.i}</div>
              <h3 className="font-display text-xl font-medium text-charcoal mb-3">{x.t}</h3>
              <p className="text-sm leading-relaxed text-warm-gray">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED STONES */}
      <section id="catalog" className="py-24 pl-12 bg-pearl">
        <div className="flex justify-between items-end mb-12 pr-12">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-emerald-mid uppercase">{t.featuredCollection}</span>
            <h2 className="font-display text-[clamp(30px,4vw,38px)] font-normal text-charcoal mt-3">{t.featuredTitle1} <em className="italic text-emerald-deep">{t.featuredTitle2}</em></h2>
          </div>
          <Link href="/register" className="gs-btn-outline !border-emerald-deep !text-emerald-deep hover:!bg-emerald-deep hover:!text-ivory hidden md:inline-block">{t.viewAll}</Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-5 pr-12">
          {stones.length > 0 ? stones.map(s => <StoneCard key={s.id} stone={s} />) :
            [1,2,3,4,5,6].map(i => <div key={i} className="flex-shrink-0 w-[280px] h-[380px] bg-white rounded-md animate-pulse" />)}
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="py-24 px-12 bg-ivory">
        <div className="text-center max-w-[550px] mx-auto mb-16">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-emerald-mid uppercase">WHY GREENSTONE</span>
          <h2 className="font-display text-[clamp(30px,4vw,38px)] font-normal text-charcoal mt-4">Built on <em className="italic text-emerald-deep">Trust</em></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1100px] mx-auto">
          {[{ i:'✓',t:'Every Stone Verified',d:'Our team inspects and scores every emerald before it reaches the catalog.' },
            { i:'◎',t:'Transparent Pricing',d:'Published prices with structured negotiation. No hidden fees, no surprises.' },
            { i:'⬡',t:'Origin Traceability',d:'Full provenance documentation from mine to marketplace.' },
            { i:'☆',t:'Expert Support',d:'Dedicated commercial advisors with deep gemological knowledge.' }].map((x,j) => (
            <div key={j} className="p-9 bg-white rounded-md border border-black/5 text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-deep/10 transition-all">
              <div className="w-[52px] h-[52px] rounded-full bg-emerald-deep/[0.04] flex items-center justify-center mx-auto mb-5 text-[22px] text-emerald-deep">{x.i}</div>
              <h3 className="font-display text-[17px] font-medium text-charcoal mb-2.5">{x.t}</h3>
              <p className="text-[13px] leading-relaxed text-warm-gray">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPLIERS CTA */}
      <section id="suppliers" className="py-24 px-12 relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #070F0B 0%, #0D2E1E 50%, #070F0B 100%)' }}>
        <div className="max-w-[650px] mx-auto text-center relative z-10">
          <svg width="28" height="28" viewBox="0 0 20 20" fill="none" className="mx-auto"><path d="M10 0L14 7H6L10 0Z" fill="#C8A951" opacity="0.8"/><path d="M6 7H14L10 20L6 7Z" fill="#C8A951"/></svg>
          <h2 className="font-display text-[38px] font-normal text-ivory mt-6 mb-5 leading-tight">Take Your Inventory to<br /><em className="italic text-[#E2CB7D]">New Markets</em></h2>
          <p className="font-elegant text-xl font-light text-white/40 leading-relaxed mb-10">Join a growing network of verified suppliers reaching professional buyers across Latin America, the United States, and Europe.</p>
          <Link href="/register" className="gs-btn-primary border border-[#C8A951]/40">Register as Supplier</Link>
        </div>
      </section>

      {/* BADGES */}
      <section className="py-24 px-12 bg-ivory">
        <div className="text-center max-w-[550px] mx-auto mb-14">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-emerald-mid uppercase">CLASSIFICATION SYSTEM</span>
          <h2 className="font-display text-[clamp(30px,4vw,38px)] font-normal text-charcoal mt-4">Five Tiers of <em className="italic text-emerald-deep">Excellence</em></h2>
        </div>
        <div className="flex justify-center gap-4 flex-wrap max-w-[900px] mx-auto">
          {[{ b:'COLLECTOR',sc:'90-100',d:'Exceptional, rare, museum-quality',c:'text-[#C8A951]',br:'border-[#C8A951]/30' },
            { b:'PREMIUM',sc:'75-89',d:'High quality, fine jewelry grade',c:'text-emerald-deep',br:'border-emerald-mid/30' },
            { b:'SELECT',sc:'55-74',d:'Strong commercial appeal',c:'text-emerald-mid',br:'border-emerald-light/30' },
            { b:'COMMERCIAL',sc:'30-54',d:'Standard quality, great value',c:'text-warm-gray',br:'border-warm-gray/20' },
            { b:'VALUE',sc:'<30',d:'Volume and accessible jewelry',c:'text-gray-400',br:'border-gray-200' }].map((x,i) => (
            <div key={i} className={`flex-1 min-w-[160px] max-w-[170px] p-7 text-center rounded-md bg-white border ${x.br}`}>
              <span className={`inline-block px-3 py-1 text-[10px] font-bold tracking-widest rounded mb-3.5 border ${BADGE_STYLES[x.b]}`}>{x.b}</span>
              <div className={`font-mono text-sm font-semibold mb-2 ${x.c}`}>{x.sc}</div>
              <p className="text-xs text-warm-gray leading-snug">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-12 bg-charcoal border-t border-[#C8A951]/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-[1100px] mx-auto pb-12 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 0L14 7H6L10 0Z" fill="#C8A951" opacity="0.8"/><path d="M6 7H14L10 20L6 7Z" fill="#C8A951"/></svg>
              <span className="font-elegant text-xl font-semibold tracking-[0.15em] text-ivory">GREENSTONE</span>
            </div>
            <p className="font-elegant text-base font-light italic text-white/30 leading-relaxed">Where exceptional emeralds meet trusted trade.</p>
          </div>
          {[{ t:'PLATFORM',l:['Catalog','For Suppliers','For Buyers','Pricing'] },{ t:'COMPANY',l:['About','Contact','Careers','Press'] },{ t:'LEGAL',l:['Terms of Service','Privacy Policy','Cookie Policy'] }].map((c,i) => (
            <div key={i}><h4 className="text-[11px] font-semibold tracking-[0.15em] text-white/25 mb-5">{c.t}</h4>
              {c.l.map((l,j) => <a key={j} className="block text-[13px] text-white/40 hover:text-white/70 transition-colors mb-3 cursor-pointer">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center max-w-[1100px] mx-auto mt-6">
          <span className="text-xs text-white/15">© 2026 GREENSTONE. All rights reserved.</span>
          <span className="font-mono text-[10px] text-white/10 tracking-wider">MÉXICO · COLOMBIA · USA</span>
        </div>
      </footer>
    </div>
  );
}
