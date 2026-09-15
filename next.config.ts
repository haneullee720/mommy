import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 서버 액션 요청 본문 한도 (사진 첨부 대응)
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
