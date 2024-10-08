import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
    prependData: `@import "function.scss"; @import "base.scss";`,
  },
  experimental: {
    scrollRestoration: false,
  },
  compiler: {
    styledComponents: true,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;