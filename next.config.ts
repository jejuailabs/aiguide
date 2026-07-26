import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // firebase-admin 은 번들러가 감싸지 말고 런타임 require 에 맡긴다.
  // 감싸면 하위 의존성(jwks-rsa→jose)에서 ERR_REQUIRE_ESM 이 난다.
  serverExternalPackages: ["firebase-admin"],
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
