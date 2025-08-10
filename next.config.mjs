import createNextIntlPlugin from "next-intl/plugin";
// import nextra from "nextra"; // Temporarily disabled
import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */

const withNextIntl = createNextIntlPlugin();

// const withNextra = nextra(); // Temporarily disabled

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: true, // Disable PWA completely to fix InvariantError
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  eslint: {
    // Disable ESLint during build to avoid config issues
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.lorem.space",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default withPWA(withNextIntl(nextConfig)); // Removed withNextra temporarily
