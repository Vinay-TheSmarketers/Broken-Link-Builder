import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: 'vBB — Automated Broken Link Building',
  description: 'Discover broken links, rebuild lost content, and automate personalized outreach with vBB by Smarketers.',
  openGraph: {
    title: 'vBB — Automated Broken Link Building',
    description: 'Turn dead links into live opportunities with the Smarketers off-page suite.',
    type: 'website',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'vBB — Turn dead links into live opportunities' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'vBB — Automated Broken Link Building',
    description: 'Turn dead links into live opportunities with the Smarketers off-page suite.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
