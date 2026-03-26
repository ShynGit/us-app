import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import SmoothScroll from '@/components/SmoothScroll';
import PageTransition from '@/components/PageTransition';
import Navigation from '@/components/Navigation';
import Cursor from '@/components/Cursor';
import YoutubeCore from '@/components/youtube/YoutubeCore';
import YoutubeWidget from '@/components/youtube/YoutubeWidget';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Us ♥',
  description: 'Our world, our music, our story.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        {/* Keep --range-pct in sync for styled range track fill */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('input', function(e) {
            var el = e.target;
            if (el.type !== 'range') return;
            var pct = ((el.value - el.min) / (el.max - el.min) * 100).toFixed(1) + '%';
            el.style.setProperty('--range-pct', pct);
          });
          document.addEventListener('change', function(e) {
            var el = e.target;
            if (el.type !== 'range') return;
            var pct = ((el.value - el.min) / (el.max - el.min) * 100).toFixed(1) + '%';
            el.style.setProperty('--range-pct', pct);
          });
        `}} />
        <ThemeProvider>
          <Cursor />
          <YoutubeCore />
          <YoutubeWidget />
          <SmoothScroll>
            <Navigation />
            <PageTransition>
              {children}
            </PageTransition>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
