'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

export default function AdminOfertas() {
  const { profile, loading, supabase } = useAuth();
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState('pendiente');
  const [counterModal, setCounterModal] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');

  useEffect(() => {
    if (!profile) return;
    loadOffers();
  }, [profile, filter]);

  const loadOffers = async () => {
    let query = supabase
      .from('offers')
      .select('*, emeralds(internal_code, commercial_name, precio_base, precio_publicado, precio_minimo), buyers(company_name)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query.limit(50);
    setOffers(data || []);
  };

  const handleAccept = async (offer) => {
    await supabase.from('offers').update({ status: 'aceptada', responded_at: new Date().toISOString() }).eq('id', offer.id);
    await supabase.from('emeralds').update({ status: 'reservada' }).eq('id', offer.emerald_id);
    await supabase.from('orders').insert({
      offer_id: offer.id,
      emerald_id: offer.emerald_id,
      buyer_id: offer.buyer_id,
      supplier_id: offer.emeralds?.supplier_id,
      final_price: offer.offered_price,
      greenstone_margin: offer.offered_price - (offer.emeralds?.precio_base || 0),
      margin_percentage: offer.margin_resultante,
    });
    loadOffers();
  };

  const handleReject = async (offerId) => {
    await supabase.from('offers').update({ status: 'rechazada', responded_at: new Date().toISOString() }).eq('id', offerId);
    loadOffers();
  };

  const handleCounter = async () => {
    if (!counterModal || !counterPrice) return;
    await supabase.from('offers').update({
      status: 'contraoferta',
      counter_price: parseFloat(counterPrice),
      responded_at: new Date().toISOString(),
    }).eq('id', counterModal.id);
    setCounterModal(null);
    setCounterPrice('');
    loadOffers();
  };

  if (loading) {
    return <div className="min-h-screen bg-ivory flex items-center justify-center">
      <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl text-charcoal">Offers</h1>
          <div className="flex gap-2">
            {['pendiente', 'aceptada', 'rechazada', 'contraoferta', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`font-body text-xs font-medium px-3 py-1.5 rounded transition-all ${
                  filter === f ? 'bg-emerald-deep text-ivory' : 'bg-white text-warm-gray border border-black/10'
                }`}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {offers.map(offer => {
            const base = offer.emeralds?.precio_base || 0;
            const marginPct = base > 0 ? (((offer.offered_price - base) / base) * 100).toFixed(1) : '—';
            const minOk = offer.offered_price >= (offer.emeralds?.precio_minimo || 0);

            return (
              <div key={offer.id} className="gs-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-body text-sm font-medium text-charcoal">
                      {offer.emeralds?.commercial_name || offer.emeralds?.internal_code}
                    </div>
                    <div className="font-body text-xs text-warm-gray mt-1">
                      by <span className="font-medium">{offer.buyers?.company_name}</span>
                      {' '}· {new Date(offer.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-mono text-xs text-warm-gray">Offered</div>
                      <div className="font-mono text-lg font-bold text-charcoal">${offer.offered_price?.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-warm-gray">Listed</div>
                      <div className="font-mono text-sm text-warm-gray">${offer.emeralds?.precio_publicado?.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-warm-gray">Margin</div>
                      <div className={`font-mono text-sm font-semibold ${minOk ? 'text-emerald-mid' : 'text-red-500'}`}>{marginPct}%</div>
                    </div>

                    {offer.status === 'pendiente' && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleAccept(offer)} className="gs-btn-primary !py-1.5 !px-3 !text-[10px]">Accept</button>
                        <button onClick={() => { setCounterModal(offer); setCounterPrice(''); }} className="gs-btn-outline !py-1.5 !px-3 !text-[10px]">Counter</button>
                        <button onClick={() => handleReject(offer.id)} className="gs-btn-outline !py-1.5 !px-3 !text-[10px] !border-red-300 !text-red-500">Reject</button>
                      </div>
                    )}
                    {offer.status !== 'pendiente' && (
                      <span className={`font-body text-[10px] font-bold tracking-wider px-2 py-1 rounded ${
                        offer.status === 'aceptada' ? 'bg-emerald-50 text-emerald-700' :
                        offer.status === 'rechazada' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>{offer.status.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {offers.length === 0 && (
            <div className="gs-card p-12 text-center">
              <p className="font-body text-sm text-warm-gray">No offers found</p>
            </div>
          )}
        </div>
      </main>

      {counterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setCounterModal(null)}>
          <div className="bg-white rounded-lg w-full max-w-sm p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl text-charcoal mb-4">Counter Offer</h2>
            <div className="mb-4 p-3 bg-pearl rounded flex justify-between">
              <span className="font-body text-xs text-warm-gray">Their offer</span>
              <span className="font-mono font-bold">${counterModal.offered_price?.toLocaleString()}</span>
            </div>
            <div className="mb-5">
              <label className="gs-label">Your Counter Price (USD)</label>
              <input type="number" value={counterPrice} onChange={e => setCounterPrice(e.target.value)}
                className="gs-input font-mono" placeholder="0.00" autoFocus />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCounterModal(null)} className="gs-btn-outline flex-1">Cancel</button>
              <button onClick={handleCounter} disabled={!counterPrice} className="gs-btn-primary flex-1 disabled:opacity-40">Send Counter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
