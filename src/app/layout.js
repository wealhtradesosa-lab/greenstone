import './globals.css';
import { LangWrapper } from '@/components/layout/LangWrapper';

export const metadata = {
  title: 'GREENSTONE — The Professional Emerald Marketplace',
  description: 'Curated, verified emeralds ready to trade. The B2B marketplace where exceptional emeralds meet trusted commerce.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LangWrapper>{children}</LangWrapper>
      </body>
    </html>
  );
}
