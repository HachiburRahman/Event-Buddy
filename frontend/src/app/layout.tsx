import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore: Allow side-effect global CSS import without type declarations
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Event Buddy",
  description: "Discover and book amazing events.",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) { 
  return (
    <html lang="en">
      <body className={`${inter.className} bg-light-violet`} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
