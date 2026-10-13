import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the small Next.js "N" button that appears in the corner during `npm run dev`.
  // (It never appears on the live site, but this keeps local demos clean too.)
  devIndicators: false,
};

export default nextConfig;
