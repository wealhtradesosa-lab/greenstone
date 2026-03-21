'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    catalog: 'CATALOG',
    howItWorks: 'HOW IT WORKS',
    forSuppliers: 'FOR SUPPLIERS',
    about: 'ABOUT',
    signIn: 'SIGN IN',
    requestAccess: 'REQUEST ACCESS',
    
    // Hero
    overline: 'The Professional Emerald Marketplace',
    heroTitle1: 'Where Exceptional',
    heroTitle2: 'Emeralds',
    heroTitle3: 'Meet Trusted Trade',
    heroSub1: 'Curated, verified, and ready to trade.',
    heroSub2: 'Every stone inspected. Every deal transparent.',
    exploreCatalog: 'Explore the Catalog',
    
    // Stats
    verifiedStones: 'Verified Stones',
    activeBuyers: 'Active Buyers',
    countries: 'Countries',
    clientSatisfaction: 'Client Satisfaction',
    
    // How it works
    howTitle1: 'From Source to Showcase,',
    howTitle2: 'With Confidence',
    step1Title: 'Suppliers Upload',
    step1Desc: 'Verified suppliers submit their inventory with professional photography, certificates, and detailed gemological data.',
    step2Title: 'We Inspect & Classify',
    step2Desc: 'Our team reviews every stone, assigns a commercial score, and classifies it with our proprietary badge system.',
    step3Title: 'Buyers Trade Directly',
    step3Desc: 'Professional buyers browse curated inventory, make offers, and negotiate transparently through the platform.',
    
    // Featured
    featuredCollection: 'FEATURED COLLECTION',
    featuredTitle1: 'Exceptional Stones,',
    featuredTitle2: 'Ready to Trade',
    viewAll: 'View All →',
    makeOffer: 'MAKE OFFER',
    
    // Trust
    whyGreenstone: 'WHY GREENSTONE',
    builtOn: 'Built on',
    trust: 'Trust',
    trust1Title: 'Every Stone Verified',
    trust1Desc: 'Our team inspects and scores every emerald before it reaches the catalog.',
    trust2Title: 'Transparent Pricing',
    trust2Desc: 'Published prices with structured negotiation. No hidden fees, no surprises.',
    trust3Title: 'Origin Traceability',
    trust3Desc: 'Full provenance documentation from mine to marketplace.',
    trust4Title: 'Expert Support',
    trust4Desc: 'Dedicated commercial advisors with deep gemological knowledge.',
    
    // Suppliers CTA
    takeInventory: 'Take Your Inventory to',
    newMarkets: 'New Markets',
    suppliersCta: 'Join a growing network of verified suppliers reaching professional buyers across Latin America, the United States, and Europe.',
    registerSupplier: 'Register as Supplier',
    
    // Badges
    classificationSystem: 'CLASSIFICATION SYSTEM',
    fiveTiers: 'Five Tiers of',
    excellence: 'Excellence',
    collectorDesc: 'Exceptional, rare, museum-quality',
    premiumDesc: 'High quality, fine jewelry grade',
    selectDesc: 'Strong commercial appeal',
    commercialDesc: 'Standard quality, great value',
    valueDesc: 'Volume and accessible jewelry',
    
    // Footer
    platform: 'PLATFORM',
    company: 'COMPANY',
    legal: 'LEGAL',
    forBuyers: 'For Buyers',
    pricing: 'Pricing',
    contact: 'Contact',
    careers: 'Careers',
    press: 'Press',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    tagline: 'Where exceptional emeralds meet trusted trade.',
    allRights: '© 2026 GREENSTONE. All rights reserved.',

    // Availability
    immediateAvailability: 'Immediate Availability',
    madeToOrder: 'Made to Order · 30 days',

    // Dashboard
    dashboard: 'Dashboard',
    emeralds: 'Emeralds',
    offers: 'Offers',
    orders: 'Orders',
    suppliers: 'Suppliers',
    buyers: 'Buyers',
    myStones: 'My Stones',
    newStone: 'New Stone',
    favorites: 'Favorites',
    myOffers: 'My Offers',
    myOrders: 'My Orders',
    signOut: 'Sign Out',
    
    // Forms
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    companyName: 'Company Name',
    country: 'Country',
    city: 'City',
    phone: 'Phone',
    submitApplication: 'Submit Application',
    
    // Supplier form
    basicData: 'Basic Data',
    characteristics: 'Characteristics',
    mediaAndPrice: 'Media & Price',
    commercialName: 'Commercial Name',
    weight: 'Weight (ct)',
    shape: 'Shape',
    origin: 'Origin',
    treatment: 'Treatment',
    colorGrade: 'Color Grade',
    photos: 'Photos',
    basePrice: 'Base Price (USD)',
    basePriceNote: 'This is your price. GREENSTONE will add a margin before publishing to buyers.',
    saveDraft: 'Save Draft',
    submitForReview: 'Submit for Review',
    availability: 'Availability',
    next: 'Next',
    back: '← Back',
  },
  es: {
    // Nav
    catalog: 'CATÁLOGO',
    howItWorks: 'CÓMO FUNCIONA',
    forSuppliers: 'PROVEEDORES',
    about: 'NOSOTROS',
    signIn: 'INGRESAR',
    requestAccess: 'SOLICITAR ACCESO',
    
    // Hero
    overline: 'El Marketplace Profesional de Esmeraldas',
    heroTitle1: 'Donde Esmeraldas',
    heroTitle2: 'Excepcionales',
    heroTitle3: 'Encuentran Comercio Confiable',
    heroSub1: 'Curadas, verificadas y listas para comerciar.',
    heroSub2: 'Cada piedra inspeccionada. Cada trato transparente.',
    exploreCatalog: 'Explorar Catálogo',
    
    // Stats
    verifiedStones: 'Piedras Verificadas',
    activeBuyers: 'Compradores Activos',
    countries: 'Países',
    clientSatisfaction: 'Satisfacción del Cliente',
    
    // How it works
    howTitle1: 'De la Fuente a la Vitrina,',
    howTitle2: 'Con Confianza',
    step1Title: 'Proveedores Cargan',
    step1Desc: 'Proveedores verificados envían su inventario con fotografía profesional, certificados y datos gemológicos detallados.',
    step2Title: 'Inspeccionamos y Clasificamos',
    step2Desc: 'Nuestro equipo revisa cada piedra, asigna un score comercial y la clasifica con nuestro sistema propietario de badges.',
    step3Title: 'Compradores Negocian',
    step3Desc: 'Compradores profesionales navegan inventario curado, hacen ofertas y negocian de forma transparente en la plataforma.',
    
    // Featured
    featuredCollection: 'COLECCIÓN DESTACADA',
    featuredTitle1: 'Piedras Excepcionales,',
    featuredTitle2: 'Listas para Comerciar',
    viewAll: 'Ver Todas →',
    makeOffer: 'HACER OFERTA',
    
    // Trust
    whyGreenstone: 'POR QUÉ GREENSTONE',
    builtOn: 'Construido sobre',
    trust: 'Confianza',
    trust1Title: 'Cada Piedra Verificada',
    trust1Desc: 'Nuestro equipo inspecciona y califica cada esmeralda antes de que llegue al catálogo.',
    trust2Title: 'Precios Transparentes',
    trust2Desc: 'Precios publicados con negociación estructurada. Sin costos ocultos, sin sorpresas.',
    trust3Title: 'Trazabilidad de Origen',
    trust3Desc: 'Documentación completa de procedencia desde la mina hasta el marketplace.',
    trust4Title: 'Soporte Experto',
    trust4Desc: 'Asesores comerciales dedicados con profundo conocimiento gemológico.',
    
    // Suppliers CTA
    takeInventory: 'Lleve su Inventario a',
    newMarkets: 'Nuevos Mercados',
    suppliersCta: 'Únase a una red creciente de proveedores verificados que llegan a compradores profesionales en Latinoamérica, Estados Unidos y Europa.',
    registerSupplier: 'Registrarse como Proveedor',
    
    // Badges
    classificationSystem: 'SISTEMA DE CLASIFICACIÓN',
    fiveTiers: 'Cinco Niveles de',
    excellence: 'Excelencia',
    collectorDesc: 'Excepcional, rara, calidad de museo',
    premiumDesc: 'Alta calidad, joyería fina',
    selectDesc: 'Fuerte atractivo comercial',
    commercialDesc: 'Calidad estándar, gran valor',
    valueDesc: 'Volumen y joyería accesible',
    
    // Footer
    platform: 'PLATAFORMA',
    company: 'EMPRESA',
    legal: 'LEGAL',
    forBuyers: 'Para Compradores',
    pricing: 'Precios',
    contact: 'Contacto',
    careers: 'Carreras',
    press: 'Prensa',
    terms: 'Términos de Servicio',
    privacy: 'Política de Privacidad',
    cookies: 'Política de Cookies',
    tagline: 'Donde esmeraldas excepcionales encuentran comercio confiable.',
    allRights: '© 2026 GREENSTONE. Todos los derechos reservados.',

    // Availability
    immediateAvailability: 'Disponibilidad Inmediata',
    madeToOrder: 'Bajo Pedido · 30 días',

    // Dashboard
    dashboard: 'Panel',
    emeralds: 'Esmeraldas',
    offers: 'Ofertas',
    orders: 'Órdenes',
    suppliers: 'Proveedores',
    buyers: 'Compradores',
    myStones: 'Mis Piedras',
    newStone: 'Nueva Piedra',
    favorites: 'Favoritos',
    myOffers: 'Mis Ofertas',
    myOrders: 'Mis Órdenes',
    signOut: 'Cerrar Sesión',
    
    // Forms
    fullName: 'Nombre Completo',
    email: 'Correo',
    password: 'Contraseña',
    companyName: 'Nombre de Empresa',
    country: 'País',
    city: 'Ciudad',
    phone: 'Teléfono',
    submitApplication: 'Enviar Solicitud',
    
    // Supplier form
    basicData: 'Datos Básicos',
    characteristics: 'Características',
    mediaAndPrice: 'Media y Precio',
    commercialName: 'Nombre Comercial',
    weight: 'Peso (ct)',
    shape: 'Forma',
    origin: 'Origen',
    treatment: 'Tratamiento',
    colorGrade: 'Grado de Color',
    photos: 'Fotos',
    basePrice: 'Precio Base (USD)',
    basePriceNote: 'Este es tu precio. GREENSTONE agregará un margen antes de publicar a compradores.',
    saveDraft: 'Guardar Borrador',
    submitForReview: 'Enviar a Revisión',
    availability: 'Disponibilidad',
    next: 'Siguiente',
    back: '← Atrás',
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('gs-lang');
    if (saved && (saved === 'en' || saved === 'es')) setLang(saved);
  }, []);

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('gs-lang', newLang);
  };

  return (
    <LangContext.Provider value={{ lang, switchLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function LangSwitcher({ className = '' }) {
  const { lang, switchLang } = useLang();
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => switchLang('en')}
        className={`text-[11px] font-medium px-2 py-1 rounded transition-all ${
          lang === 'en' ? 'bg-white/10 text-ivory' : 'text-white/30 hover:text-white/60'
        }`}
      >EN</button>
      <span className="text-white/15 text-[10px]">|</span>
      <button
        onClick={() => switchLang('es')}
        className={`text-[11px] font-medium px-2 py-1 rounded transition-all ${
          lang === 'es' ? 'bg-white/10 text-ivory' : 'text-white/30 hover:text-white/60'
        }`}
      >ES</button>
    </div>
  );
}
