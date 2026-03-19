import './globals.css';

export const metadata = {
  title: 'GREENSTONE — The Professional Emerald Marketplace',
  description: 'Curated, verified emeralds ready to trade. The B2B marketplace where exceptional emeralds meet trusted commerce.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
