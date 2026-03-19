'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const STATUS_LABELS = {
  borrador: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  pendiente_revision: { label: 'Under Review', color: 'bg-yellow-50 text-yellow-700' },
  aprobada: { label: 'Approved', color: 'bg-blue-50 text-blue-700' },
  publicada: { label: 'Published', color: 'bg-emerald-50 text-emerald-700' },
  reservada: { label: 'Reserved', color: 'bg-purple-50 text-purple-700' },
  vendida: { label: 'Sold', color: 'bg-amber-50 text-amber-700' },
  rechazada: { label: 'Rejected', color: 'bg-red-50 text-red-600' },
};

const BADGE_DEFAULTS = {
  COLLECTOR: 30, PREMIUM: 24, SELECT: 18, COMMERCIAL: 15, VALUE: 12
};

export default function AdminEsmeraldas() {
  const { profile, loading, supabase } = useAuth();
  const [stones, setStones] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [margin, setMargin] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    loadStones();
  }, [profile, filter]);

  const loadStones = async () => {
    let query = supabase
      .from('emeralds')
      .select('*, suppliers(company_name), emerald_media(url, type, sort_order)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query.limit(100);
    setStones(data || []);
  };

  const approveAndPublish = async (stone) => {
    const m = parseFloat(margin) || BADGE_DEFAULTS[stone.badge] || 20;
    const published = Math.round(stone.precio_base * (1 + m / 100) * 100) / 100;
    const min = parseFloat(minPrice) || Math.round(stone.precio_base * 1.10 * 100) / 100;

    setSaving(true);
    await supabase.from('emeralds').update({
      status: 'publicada',
      margen_porcentaje: m,
      precio_publicado: published,
      precio_minimo: min,
      published_at: new Date().toISOString(),
    }).eq('id', stone.id);

    setSelected(null);
    setMargin('');
    setMinPrice('');
    setSaving(false);
    loadStones();
  };

  const rejectStone = async (stoneId, reason) => {
    await supabase.from('emeralds').update({
      status: 'rechazada',
      rejection_reason: reason || 'Does not meet quality standards',
    }).eq('id', stoneId);
    setSelected(null);
    loadStones();
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl text-charcoal">Emeralds</h1>
          <div className="flex gap-2">
            {['all', 'pendiente_revision', 'publicada', 'borrador', 'rechazada'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`font-body text-xs font-medium px-3 py-1.5 rounded transition-all ${
                  filter === f ? 'bg-emerald-deep text-ivory' : 'bg-white text-warm-gray border border-black/10 hover:border-emerald-deep/30'
                }`}>
                {f === 'all' ? 'All' : (STATUS_LABELS[f]?.label || f)}
              </button>
            ))}
          </div>
        </div>

        <div className="gs-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Stone</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Supplier</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Weight</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Badge</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Base Price</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Published</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Status</th>
                <th className="text-right px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stones.map(stone => {
                const st = STATUS_LABELS[stone.status] || { label: stone.status, color: 'bg-gray-100' };
                return (
                  <tr key={stone.id} className="border-b border-black/[0.03] hover:bg-pearl/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-body text-sm font-medium text-charcoal">{stone.commercial_name || stone.internal_code}</div>
                      <div className="font-mono text-[10px] text-warm-gray">{stone.origin} · {stone.shape}</div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-warm-gray">{stone.suppliers?.company_name}</td>
                    <td className="px-4 py-3 font-mono text-sm text-charcoal">{stone.weight_ct} ct</td>
                    <td className="px-4 py-3">
                      {stone.badge && <span className="font-body text-[10px] font-bold tracking-wider">{stone.badge}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-warm-gray">${stone.precio_base?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-charcoal">${stone.precio_publicado?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {stone.status === 'pendiente_revision' && (
                        <button onClick={() => { setSelected(stone); setMargin(BADGE_DEFAULTS[stone.badge]?.toString() || '20'); }}
                          className="gs-btn-primary !py-1.5 !px-3 !text-[10px]">
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {stones.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-sm text-warm-gray">No emeralds found</p>
            </div>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg w-full max-w-lg p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl text-charcoal mb-1">Review Emerald</h2>
            <p className="font-body text-sm text-warm-gray mb-5">
              {selected.commercial_name || selected.internal_code} · {selected.weight_ct} ct · {selected.origin}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-pearl rounded">
              <div>
                <span className="gs-label">Base Price</span>
                <div className="font-mono text-lg font-bold text-charcoal">${selected.precio_base?.toLocaleString()}</div>
              </div>
              <div>
                <span className="gs-label">Score / Badge</span>
                <div className="font-mono text-lg font-bold text-charcoal">{selected.score_tecnico || '—'} / {selected.badge || '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="gs-label">Margin %</label>
                <input type="number" value={margin} onChange={e => setMargin(e.target.value)}
                  className="gs-input font-mono" placeholder="20" />
              </div>
              <div>
                <label className="gs-label">Published Price</label>
                <div className="gs-input bg-pearl font-mono font-bold">
                  ${margin && selected.precio_base ? Math.round(selected.precio_base * (1 + parseFloat(margin) / 100)).toLocaleString() : '—'}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="gs-label">Minimum Acceptable Price</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                className="gs-input font-mono" placeholder={selected.precio_base ? Math.round(selected.precio_base * 1.10).toString() : ''} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => rejectStone(selected.id)} className="gs-btn-outline flex-1 !border-red-300 !text-red-600 hover:!bg-red-50">
                Reject
              </button>
              <button onClick={() => approveAndPublish(selected)} disabled={saving}
                className="gs-btn-primary flex-1">
                {saving ? 'Publishing...' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
