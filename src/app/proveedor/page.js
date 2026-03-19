'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import Link from 'next/link';

const STATUS_LABELS = {
  borrador: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  pendiente_revision: { label: 'Under Review', color: 'bg-yellow-50 text-yellow-700' },
  aprobada: { label: 'Approved', color: 'bg-blue-50 text-blue-700' },
  publicada: { label: 'Published', color: 'bg-emerald-50 text-emerald-700' },
  reservada: { label: 'Reserved', color: 'bg-purple-50 text-purple-700' },
  vendida: { label: 'Sold', color: 'bg-gold/10 text-gold' },
  rechazada: { label: 'Rejected', color: 'bg-red-50 text-red-600' },
};

export default function SupplierDashboard() {
  const { profile, loading, supabase } = useAuth();
  const [stones, setStones] = useState([]);
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    if (!profile) return;

    const load = async () => {
      // Get supplier
      const { data: sup } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      setSupplier(sup);

      if (sup) {
        // Get stones
        const { data: emeralds } = await supabase
          .from('emeralds')
          .select('*, emerald_media(url, type, sort_order)')
          .eq('supplier_id', sup.id)
          .order('created_at', { ascending: false });
        setStones(emeralds || []);
      }
    };
    load();
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-charcoal">My Stones</h1>
            <p className="font-body text-sm text-warm-gray mt-1">
              {supplier?.company_name} · {stones.length} stones total
            </p>
          </div>
          <Link href="/proveedor/nueva" className="gs-btn-primary flex items-center gap-2">
            <span>＋</span> New Stone
          </Link>
        </div>

        {stones.length === 0 ? (
          <div className="gs-card p-12 text-center">
            <div className="text-4xl mb-4">◈</div>
            <h2 className="font-display text-xl text-charcoal mb-2">No stones yet</h2>
            <p className="font-body text-sm text-warm-gray mb-6">
              Start by uploading your first emerald to the platform.
            </p>
            <Link href="/proveedor/nueva" className="gs-btn-primary">
              Upload First Stone
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stones.map(stone => {
              const statusInfo = STATUS_LABELS[stone.status] || { label: stone.status, color: 'bg-gray-100' };
              const mainPhoto = stone.emerald_media?.find(m => m.type === 'photo');
              return (
                <div key={stone.id} className="gs-card overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-emerald-deep/80 to-emerald-deep flex items-center justify-center relative">
                    {mainPhoto ? (
                      <img src={mainPhoto.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-emerald-glow/30">◈</span>
                    )}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider font-body ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-display text-base font-medium text-charcoal">
                          {stone.commercial_name || stone.internal_code || 'Untitled'}
                        </h3>
                        <p className="font-mono text-[11px] text-warm-gray">
                          {stone.weight_ct} ct · {stone.origin} · {stone.shape}
                        </p>
                      </div>
                      {stone.badge && (
                        <span className={`gs-badge-${stone.badge.toLowerCase()}`}>{stone.badge}</span>
                      )}
                    </div>
                    {stone.status === 'publicada' && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                        <span className="font-mono text-sm text-warm-gray">
                          {stone.views_count || 0} views · {stone.offers_count || 0} offers
                        </span>
                      </div>
                    )}
                    {stone.status === 'rechazada' && stone.rejection_reason && (
                      <div className="mt-3 p-2.5 bg-red-50 rounded text-xs font-body text-red-600">
                        {stone.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
