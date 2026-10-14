import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ligalujanense.com";

export const metadata: Metadata = {
  // Necesario para que las URLs de imagen de las vistas previas (WhatsApp,
  // Facebook, X) se resuelvan como absolutas.
  metadataBase: new URL(BASE),
  title: "Liga Lujanense de Fútbol",
  description: "Sitio oficial de la Liga Lujanense de Fútbol",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Liga Lujanense de Fútbol",
    title: "Liga Lujanense de Fútbol",
    description: "Sitio oficial de la Liga Lujanense de Fútbol",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased bg-crema text-neutral-900`}>
        {children}
      </body>
    </html>
  );
}
