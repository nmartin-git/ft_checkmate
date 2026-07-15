import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  // En dev, Next 16 bloque les requêtes cross-origin vers /_next/* (HMR, etc.)
  // depuis une autre origine que localhost. Ces motifs autorisent tout le
  // réseau local privé (chez toi 192.168.x.x, à 42 10.x.x.x, Docker 172.x.x.x)
  // ainsi que les tunnels ngrok, sans avoir à réécrire l'IP le jour de la soutenance.
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.ngrok.io",
  ],
};

export default withNextIntl(nextConfig);