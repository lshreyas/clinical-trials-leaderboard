import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";
const repoName = "clinical-trials-leaderboard";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isPages ? `/${repoName}` : "",
  assetPrefix: isPages ? `/${repoName}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
