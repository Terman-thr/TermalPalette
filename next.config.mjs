/** @type {import('next').NextConfig} */
const repoName = process.env.NEXT_PUBLIC_GITHUB_PAGES_PATH;

const basePath = repoName ? `/${repoName}` : undefined;

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
