/** @type {import('next').NextConfig} */
const repoName = process.env.NEXT_PUBLIC_GITHUB_PAGES_PATH;
const useCustomDomain = true; // force true for haorantang.dev

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(repoName && !useCustomDomain
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}`,
      }
    : {}),
};

export default nextConfig;