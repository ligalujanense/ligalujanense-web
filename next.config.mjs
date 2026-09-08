/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Necesario para el escudo de AFA (SVG propio, sin contenido externo/dinamico).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      // Default es 1MB, insuficiente para logos exportados de Canva o PDFs escaneados.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
