'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

export default function CompradorOfertas() {
  const { profile, loading, supabase } = useAuth();
  const [offers, setOffers] = useState([]);
  const [buyer, setBuyer] = useState(null);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: b } = await supabase.from('buyers').select('id').eq('user_id', profile.id).single();
      setBuyer(b);
      if (b) {
        const { data } = await supabase.from('offers')
          .select('*, emeralds(commercial_name, internal_code, precio_publicado)')
          .eq('buyer_id', b.id)
          .order('created_at', { ascending: false });
        setOffers(data || []);
      }
    };
    load();
  }, [profile]);

  if (loading) return <div className="min-h-screen bg-ivory flex items-center justify-center">
    <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
  </div>;

  const statusColor = (s) => {
    if (s === 'aceptada') return 'bg-emerald-50 text-emerald-700';
    if (s === 'rechazada') return 'bg-red-50 text-red-600';
    if (s === 'contraoferta') return 'bg-yellow-50 text-yellow-700';
    if (s === 'pendiente') return 'bg-blue-50 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-6">My Offers</h1>
        <div className="space-y-3">
          {offers.map(o => (
            <div key={o.id} className="gs-card p-5 flex items-center justify-between">
              <div>
                <div className="font-body text-sm font-medium text-charcoal">{o.emeralds?.commercial_name || o.emeralds?.internal_code}</div>
                <div className="font-body text-xs text-warm-gray mt-1">{new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-mono text-xs text-warm-gray">Your Offer</div>
                  <div className="font-mono text-lg font-bold text-charcoal">${o.offered_price?.toLocaleString()}</div>
                </div>
                {o.counter_price && (
                  <div className="text-right">
                    <div className="font-mono text-xs text-warm-gray">Counter</div>
                    <div className="font-mono text-lg font-bold text-gold">${o.counter_price?.toLocaleString()}</div>
                  </div>
                )}
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${statusColor(o.status)}`}>
                  {o.status?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="gs-card p-12 text-center">
              <p className="font-body text-sm text-warm-gray">You haven't made any offers yet. Browse the catalog to find your next emerald.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
