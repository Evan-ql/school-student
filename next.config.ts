import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["bcryptjs", "@prisma/adapter-pg", "pg", "dotenv", "prisma"],
};

export default nextConfig;
