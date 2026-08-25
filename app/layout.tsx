import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liga Lujanense de Fútbol",
  description: "Sitio oficial de la Liga Lujanense de Fútbol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-crema text-neutral-900">{children}</body>
    </html>
  );
}
