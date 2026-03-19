'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

function KPICard({ label, value, icon, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-deep/5 text-emerald-deep border-emerald-deep/10',
    gold: 'bg-gold/5 text-gold border-gold/10',
    blue: 'bg-blue-500/5 text-blue-600 border-blue-500/10',
    purple: 'bg-purple-500/5 text-purple-600 border-purple-500/10',
  };
  return (
    <div className={`gs-card p-5 border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-mono text-[10px] tracking-wider uppercase opacity-50">{label}</span>
      </div>
      <div className="font-display text-3xl font-medium text-charcoal">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile, loading, supabase } = useAuth();
  const [stats, setStats] = useState({ stones: 0, pending: 0, offers: 0, orders: 0 });
  const [pendingStones, setPendingStones] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);

  useEffect(() => {
    if (!profile) return;

    const loadDashboard = async () => {
      // KPIs
      const [stonesRes, pendingRes, offersRes, ordersRes] = await Promise.all([
        supabase.from('emeralds').select('id', { count: 'exact', head: true }).eq('status', 'publicada'),
        supabase.from('emeralds').select('id', { count: 'exact', head: true }).eq('status', 'pendiente_revision'),
        supabase.from('offers').select('id', { count: 'exact', head: true }).eq('status', 'pendiente'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).not('status', 'in', '("completada","cancelada")'),
      ]);

      setStats({
        stones: stonesRes.count || 0,
        pending: pendingRes.count || 0,
        offers: offersRes.count || 0,
        orders: ordersRes.count || 0,
      });

      // Pending stones
      const { data: stones } = await supabase
        .from('emeralds')
        .select('id, internal_code, commercial_name, weight_ct, origin, created_at, suppliers(company_name)')
        .eq('status', 'pendiente_revision')
        .order('created_at', { ascending: false })
        .limit(5);
      setPendingStones(stones || []);

      // Recent offers
      const { data: offers } = await supabase
        .from('offers')
        .select('id, offered_price, status, created_at, emeralds(commercial_name, precio_publicado), buyers(company_name)')
        .eq('status', 'pendiente')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOffers(offers || []);
    };

    loadDashboard();
  }, [profile]);

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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>
          <p className="font-body text-sm text-warm-gray mt-1">
            Welcome back, {profile?.full_name?.split(' ')[0]}. Here&apos;s your overview.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard icon="◈" label="Active Stones" value={stats.stones} color="emerald" />
          <KPICard icon="⏳" label="Pending Review" value={stats.pending} color="gold" />
          <KPICard icon="⤝" label="Open Offers" value={stats.offers} color="blue" />
          <KPICard icon="☐" label="Active Orders" value={stats.orders} color="purple" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Review */}
          <div className="gs-card p-6">
            <h2 className="font-display text-lg text-charcoal mb-4">Pending Review</h2>
            {pendingStones.length === 0 ? (
              <p className="font-body text-sm text-warm-gray">No stones pending review</p>
            ) : (
              <div className="space-y-3">
                {pendingStones.map(stone => (
                  <div key={stone.id} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
                    <div>
                      <div className="font-body text-sm font-medium text-charcoal">
                        {stone.commercial_name || stone.internal_code}
                      </div>
                      <div className="font-mono text-[11px] text-warm-gray mt-0.5">
                        {stone.weight_ct} ct · {stone.origin} · by {stone.suppliers?.company_name}
                      </div>
                    </div>
                    <button className="gs-btn-primary !py-1.5 !px-3 !text-[10px]">Review</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Offers */}
          <div className="gs-card p-6">
            <h2 className="font-display text-lg text-charcoal mb-4">Pending Offers</h2>
            {recentOffers.length === 0 ? (
              <p className="font-body text-sm text-warm-gray">No pending offers</p>
            ) : (
              <div className="space-y-3">
                {recentOffers.map(offer => (
                  <div key={offer.id} className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
                    <div>
                      <div className="font-body text-sm font-medium text-charcoal">
                        {offer.emeralds?.commercial_name}
                      </div>
                      <div className="font-mono text-[11px] text-warm-gray mt-0.5">
                        Offered: <span className="text-emerald-mid font-semibold">${offer.offered_price?.toLocaleString()}</span>
                        {' '}· Listed: ${offer.emeralds?.precio_publicado?.toLocaleString()}
                        {' '}· {offer.buyers?.company_name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="gs-btn-primary !py-1.5 !px-3 !text-[10px]">Accept</button>
                      <button className="gs-btn-outline !py-1.5 !px-3 !text-[10px]">Counter</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
