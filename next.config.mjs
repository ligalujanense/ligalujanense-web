/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Default es 1MB, insuficiente para logos exportados de Canva o PDFs escaneados.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
