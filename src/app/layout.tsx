import type { Metadata } from "next";
import "./globals.css";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Ziel",
  description:
    "You don't have to choose between results and your prople. Our corporate leadership training solved the riddle. Learn more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <body>
        <main className="h-screen dark text-foreground bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}
