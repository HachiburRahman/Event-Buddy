import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore: Allow side-effect global CSS import without type declarations
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Event Buddy",
  description: "Discover and book amazing events.",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) { 
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen transition-colors duration-300`} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
