import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { Poppins } from "next/font/google";

// Configure Poppins font with Next.js optimization
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Ziel",
  description:
    "You don't have to choose between results and your prople. Our corporate leadership training solved the riddle. Learn more.",
};

/**
 * Root layout component for the entire application
 * Sets up global fonts, toast notifications, and base HTML structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.className}>
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <body>
        {/* Global toast notification system */}
        <Toaster position="top-right" />
        <main className="h-screen bg-white text-foreground bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}
