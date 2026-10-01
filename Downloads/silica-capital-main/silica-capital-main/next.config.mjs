/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // `next build` and `next dev` both write to .next by default, so building
  // while the dev server is running deletes the chunks that server is still
  // serving — the page then hangs on a ChunkLoadError until dev is restarted.
  // `npm run build:check` sets this to a scratch directory so a build can be
  // verified without disturbing a live dev server. Plain `npm run build` still
  // uses .next, which is what Vercel and `npm start` expect.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
