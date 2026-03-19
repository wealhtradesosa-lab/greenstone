'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Link from 'next/link';

const BADGE_STYLES = {
  COLLECTOR: 'gs-badge-collector',
  PREMIUM: 'gs-badge-premium',
  SELECT: 'gs-badge-select',
  COMMERCIAL: 'gs-badge bg-gray-200 text-gray-600',
  VALUE: 'gs-badge bg-gray-100 text-gray-400',
};

export default function CatalogoPage() {
  const { profile, loading, supabase } = useAuth();
  const [stones, setStones] = useState([]);
  const [loadingStones, setLoadingStones] = useState(true);
  const [buyer, setBuyer] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  // Offer modal
  const [offerModal, setOfferModal] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    minWeight: '',
    maxWeight: '',
    minPrice: '',
    maxPrice: '',
    origins: [],
    badges: [],
    shapes: [],
  });

  useEffect(() => {
    if (!profile) return;

    const load = async () => {
      // Get buyer info
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      setBuyer(buyerData);

      // Get favorites
      if (buyerData) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('emerald_id')
          .eq('buyer_id', buyerData.id);
        setFavorites(new Set((favs || []).map(f => f.emerald_id)));
      }

      // Load published emeralds
      await loadStones();
    };
    load();
  }, [profile]);

  const loadStones = async () => {
    setLoadingStones(true);
    let query = supabase
      .from('emeralds')
      .select('*, emerald_media(url, type, sort_order), suppliers(company_name)')
      .eq('status', 'publicada');

    if (filters.minWeight) query = query.gte('weight_ct', parseFloat(filters.minWeight));
    if (filters.maxWeight) query = query.lte('weight_ct', parseFloat(filters.maxWeight));
    if (filters.minPrice) query = query.gte('precio_publicado', parseFloat(filters.minPrice));
    if (filters.maxPrice) query = query.lte('precio_publicado', parseFloat(filters.maxPrice));
    if (filters.origins.length > 0) query = query.in('origin', filters.origins);
    if (filters.badges.length > 0) query = query.in('badge', filters.badges);

    switch (sortBy) {
      case 'price_asc': query = query.order('precio_publicado', { ascending: true }); break;
      case 'price_desc': query = query.order('precio_publicado', { ascending: false }); break;
      case 'weight_desc': query = query.order('weight_ct', { ascending: false }); break;
      case 'score': query = query.order('score_total', { ascending: false }); break;
      default: query = query.order('published_at', { ascending: false });
    }

    const { data } = await query.limit(50);
    setStones(data || []);
    setLoadingStones(false);
  };

  useEffect(() => { if (profile) loadStones(); }, [sortBy, filters]);

  const toggleFavorite = async (emeraldId) => {
    if (!buyer) return;
    const isFav = favorites.has(emeraldId);

    if (isFav) {
      await supabase.from('favorites').delete().eq('buyer_id', buyer.id).eq('emerald_id', emeraldId);
      setFavorites(prev => { const next = new Set(prev); next.delete(emeraldId); return next; });
    } else {
      await supabase.from('favorites').insert({ buyer_id: buyer.id, emerald_id: emeraldId });
      setFavorites(prev => new Set(prev).add(emeraldId));
    }
  };

  const submitOffer = async () => {
    if (!buyer || !offerModal || !offerPrice) return;
    setSubmittingOffer(true);

    await supabase.from('offers').insert({
      emerald_id: offerModal.id,
      buyer_id: buyer.id,
      offered_price: parseFloat(offerPrice),
      buyer_note: offerNote || null,
    });

    // Increment offer count
    await supabase.from('emeralds').update({
      offers_count: (offerModal.offers_count || 0) + 1,
    }).eq('id', offerModal.id);

    setOfferModal(null);
    setOfferPrice('');
    setOfferNote('');
    setSubmittingOffer(false);
  };

  const toggleFilter = (key, value) => {
    setFilters(prev => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* ══ SIDEBAR FILTERS ══ */}
        <aside className={`w-64 shrink-0 hidden lg:block ${filtersOpen ? '' : 'lg:hidden'}`}>
          <div className="gs-card p-5 sticky top-20">
            <h3 className="font-display text-base text-charcoal mb-5">Filters</h3>

            {/* Weight */}
            <div className="mb-5">
              <label className="gs-label">Weight (ct)</label>
              <div className="flex gap-2">
                <input type="number" step="0.1" placeholder="Min" value={filters.minWeight}
                  onChange={e => setFilters(f => ({ ...f, minWeight: e.target.value }))}
                  className="gs-input !py-2 !text-xs font-mono" />
                <input type="number" step="0.1" placeholder="Max" value={filters.maxWeight}
                  onChange={e => setFilters(f => ({ ...f, maxWeight: e.target.value }))}
                  className="gs-input !py-2 !text-xs font-mono" />
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <label className="gs-label">Price (USD)</label>
              <div className="flex gap-2">
                <input type="number" step="100" placeholder="Min" value={filters.minPrice}
                  onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                  className="gs-input !py-2 !text-xs font-mono" />
                <input type="number" step="100" placeholder="Max" value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="gs-input !py-2 !text-xs font-mono" />
              </div>
            </div>

            {/* Badge */}
            <div className="mb-5">
              <label className="gs-label">Badge</label>
              <div className="flex flex-wrap gap-1.5">
                {['COLLECTOR', 'PREMIUM', 'SELECT', 'COMMERCIAL', 'VALUE'].map(b => (
                  <button key={b} onClick={() => toggleFilter('badges', b)}
                    className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded border transition-all ${
                      filters.badges.includes(b) ? 'bg-emerald-deep text-ivory border-emerald-deep' : 'bg-white text-warm-gray border-black/10 hover:border-emerald-deep/30'
                    }`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Origin */}
            <div className="mb-5">
              <label className="gs-label">Origin</label>
              <div className="space-y-1.5">
                {['Colombia', 'Zambia', 'Brazil', 'Ethiopia'].map(o => (
                  <label key={o} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filters.origins.includes(o)}
                      onChange={() => toggleFilter('origins', o)}
                      className="w-3.5 h-3.5 rounded border-black/20 text-emerald-deep focus:ring-emerald-deep/20" />
                    <span className="font-body text-sm text-charcoal">{o}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear */}
            <button onClick={() => setFilters({ minWeight: '', maxWeight: '', minPrice: '', maxPrice: '', origins: [], badges: [], shapes: [] })}
              className="font-body text-xs text-emerald-mid hover:text-emerald-deep transition-colors">
              Clear all filters
            </button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl text-charcoal">Catalog</h1>
              <p className="font-body text-sm text-warm-gray mt-1">{stones.length} stones available</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="gs-input !w-auto !py-2 !text-xs">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="weight_desc">Weight: Heaviest</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>

          {/* Stone Grid */}
          {loadingStones ? (
            <div className="flex items-center justify-center py-20">
              <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
            </div>
          ) : stones.length === 0 ? (
            <div className="gs-card p-12 text-center">
              <div className="text-4xl mb-4">◈</div>
              <h2 className="font-display text-xl text-charcoal mb-2">No stones found</h2>
              <p className="font-body text-sm text-warm-gray">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {stones.map(stone => {
                const mainPhoto = stone.emerald_media
                  ?.sort((a, b) => a.sort_order - b.sort_order)
                  ?.find(m => m.type === 'photo');
                const isFav = favorites.has(stone.id);

                return (
                  <div key={stone.id} className="gs-card overflow-hidden hover:shadow-lg transition-all group">
                    {/* Image */}
                    <div className="h-56 bg-gradient-to-br from-emerald-deep/80 to-emerald-deep relative overflow-hidden">
                      {mainPhoto ? (
                        <img src={mainPhoto.url} alt={stone.commercial_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 200 200" width="100" height="100" className="opacity-30">
                            <polygon points="100,15 170,60 170,140 100,185 30,140 30,60" fill="none" stroke="#34D399" strokeWidth="1.5"/>
                            <polygon points="100,40 150,70 150,130 100,160 50,130 50,70" fill="#34D399" opacity="0.3"/>
                          </svg>
                        </div>
                      )}

                      {/* Badge */}
                      {stone.badge && (
                        <span className={`absolute top-3 left-3 ${BADGE_STYLES[stone.badge]}`}>{stone.badge}</span>
                      )}

                      {/* Favorite */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(stone.id); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill={isFav ? '#C8A951' : 'none'} stroke={isFav ? '#C8A951' : '#FEFCF3'} strokeWidth="1.5">
                          <path d="M7 12.5S1 8.5 1 4.5C1 2.5 2.5 1 4.5 1C5.8 1 6.7 1.7 7 2.5C7.3 1.7 8.2 1 9.5 1C11.5 1 13 2.5 13 4.5C13 8.5 7 12.5 7 12.5Z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-display text-base font-medium text-charcoal leading-tight">
                          {stone.commercial_name || stone.internal_code}
                        </h3>
                        <span className="font-mono text-[11px] text-emerald-mid bg-emerald-light/10 px-2 py-0.5 rounded ml-2 shrink-0">
                          {stone.weight_ct} ct
                        </span>
                      </div>
                      <p className="font-body text-xs text-warm-gray mb-3">
                        {stone.origin} · {stone.shape}
                        {stone.color_description && ` · ${stone.color_description}`}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-black/5">
                        <span className="font-mono text-lg font-bold text-charcoal">
                          ${stone.precio_publicado?.toLocaleString()}
                        </span>
                        <button
                          onClick={() => { setOfferModal(stone); setOfferPrice(''); setOfferNote(''); }}
                          className="gs-btn-primary !py-2 !px-4 !text-[10px]"
                        >
                          MAKE OFFER
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ══ OFFER MODAL ══ */}
      {offerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setOfferModal(null)}>
          <div className="bg-white rounded-lg w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl text-charcoal mb-1">Make an Offer</h2>
            <p className="font-body text-sm text-warm-gray mb-5">
              {offerModal.commercial_name || offerModal.internal_code} · {offerModal.weight_ct} ct
            </p>

            <div className="bg-pearl rounded p-3 mb-5 flex items-center justify-between">
              <span className="font-body text-xs text-warm-gray">Listed Price</span>
              <span className="font-mono text-lg font-bold text-charcoal">${offerModal.precio_publicado?.toLocaleString()}</span>
            </div>

            <div className="mb-4">
              <label className="gs-label">Your Offer (USD) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-warm-gray">$</span>
                <input type="number" step="0.01" value={offerPrice} onChange={e => setOfferPrice(e.target.value)}
                  className="gs-input font-mono !pl-8" placeholder="0.00" autoFocus />
              </div>
            </div>

            <div className="mb-5">
              <label className="gs-label">Note (optional)</label>
              <textarea value={offerNote} onChange={e => setOfferNote(e.target.value)}
                className="gs-input !h-20 resize-none" placeholder="Any additional comments..." />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOfferModal(null)} className="gs-btn-outline flex-1">Cancel</button>
              <button onClick={submitOffer} disabled={!offerPrice || submittingOffer}
                className="gs-btn-primary flex-1 disabled:opacity-40">
                {submittingOffer ? 'Sending...' : 'Submit Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
