'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

export default function CompradorFavoritos() {
  const { profile, loading, supabase } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: b } = await supabase.from('buyers').select('id').eq('user_id', profile.id).single();
      if (b) {
        const { data } = await supabase.from('favorites')
          .select('*, emeralds(*, emerald_media(url, type, sort_order))')
          .eq('buyer_id', b.id)
          .order('created_at', { ascending: false });
        setFavorites(data || []);
      }
    };
    load();
  }, [profile]);

  const removeFav = async (favId) => {
    await supabase.from('favorites').delete().eq('id', favId);
    setFavorites(prev => prev.filter(f => f.id !== favId));
  };

  if (loading) return <div className="min-h-screen bg-ivory flex items-center justify-center">
    <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
  </div>;

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-6">Favorites</h1>
        {favorites.length === 0 ? (
          <div className="gs-card p-12 text-center">
            <div className="text-4xl mb-4">♡</div>
            <p className="font-body text-sm text-warm-gray">No favorites yet. Browse the catalog and save stones you like.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map(fav => {
              const stone = fav.emeralds;
              if (!stone) return null;
              const photo = stone.emerald_media?.find(m => m.type === 'photo');
              return (
                <div key={fav.id} className="gs-card overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-emerald-deep/80 to-emerald-deep flex items-center justify-center relative">
                    {photo ? <img src={photo.url} alt="" className="w-full h-full object-cover" /> :
                      <span className="text-3xl text-emerald-glow/30">◈</span>}
                    <button onClick={() => removeFav(fav.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-medium text-charcoal">{stone.commercial_name || stone.internal_code}</h3>
                    <p className="font-mono text-xs text-warm-gray mt-1">{stone.weight_ct} ct · {stone.origin}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                      <span className="font-mono text-lg font-bold text-charcoal">${stone.precio_publicado?.toLocaleString()}</span>
                      {stone.badge && <span className="font-body text-[10px] font-bold tracking-wider text-emerald-deep">{stone.badge}</span>}
                    </div>
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
