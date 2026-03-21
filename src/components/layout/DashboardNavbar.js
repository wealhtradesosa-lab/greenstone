'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LangSwitcher } from '@/lib/lang';

const NAV_ITEMS = {
  super_admin: [
    { label: 'Dashboard', href: '/admin', icon: '◫' },
    { label: 'Emeralds', href: '/admin/esmeraldas', icon: '◈' },
    { label: 'Offers', href: '/admin/ofertas', icon: '⤝' },
    { label: 'Orders', href: '/admin/ordenes', icon: '☐' },
    { label: 'Suppliers', href: '/admin/proveedores', icon: '⬆' },
    { label: 'Buyers', href: '/admin/compradores', icon: '☆' },
  ],
  admin_comercial: [
    { label: 'Dashboard', href: '/admin', icon: '◫' },
    { label: 'Emeralds', href: '/admin/esmeraldas', icon: '◈' },
    { label: 'Offers', href: '/admin/ofertas', icon: '⤝' },
    { label: 'Orders', href: '/admin/ordenes', icon: '☐' },
    { label: 'Buyers', href: '/admin/compradores', icon: '☆' },
  ],
  proveedor: [
    { label: 'My Stones', href: '/proveedor', icon: '◈' },
    { label: 'New Stone', href: '/proveedor/nueva', icon: '＋' },
    { label: 'Orders', href: '/proveedor/ordenes', icon: '☐' },
  ],
  comprador: [
    { label: 'Catalog', href: '/catalogo', icon: '◈' },
    { label: 'My Offers', href: '/comprador/ofertas', icon: '⤝' },
    { label: 'My Orders', href: '/comprador/ordenes', icon: '☐' },
    { label: 'Favorites', href: '/comprador/favoritos', icon: '♡' },
  ],
};

export default function DashboardNavbar({ profile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const items = NAV_ITEMS[profile?.role] || NAV_ITEMS.comprador;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const roleLabel = {
    super_admin: 'Super Admin',
    admin_comercial: 'Admin',
    proveedor: 'Supplier',
    comprador: 'Buyer',
  };

  return (
    <nav className="bg-charcoal border-b border-white/[0.06] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 0L14 7H6L10 0Z" fill="#C8A951" opacity="0.8"/>
            <path d="M6 7H14L10 20L6 7Z" fill="#C8A951"/>
          </svg>
          <span className="font-elegant text-lg font-semibold tracking-[0.12em] text-ivory">GREENSTONE</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded font-body text-xs font-medium tracking-wider text-white/50 hover:text-ivory hover:bg-white/[0.05] transition-all"
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <LangSwitcher />

          {/* Notifications bell */}
          <button className="relative text-white/40 hover:text-ivory transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>

          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-white/50 hover:text-ivory transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-deep flex items-center justify-center">
                <span className="font-body text-[10px] font-bold text-ivory">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="font-body text-xs text-ivory leading-tight">{profile?.full_name || 'User'}</div>
                <div className="font-mono text-[10px] text-gold/60">{roleLabel[profile?.role] || 'User'}</div>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-charcoal border border-white/10 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-white/[0.06]">
                  <div className="font-body text-xs text-ivory">{profile?.full_name}</div>
                  <div className="font-mono text-[10px] text-white/30">{profile?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 font-body text-xs text-red-400 hover:bg-white/[0.05] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
