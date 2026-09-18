import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 데모 스냅샷(data/db.json)을 서버 함수 번들에 포함시킨다.
  // 런타임에서는 CM_DATA_DIR(쓰기 가능 경로)로 복사한 뒤 사용한다.
  outputFileTracingIncludes: {
    "/**": ["./data/db.json"],
  },
  experimental: {
    // 서버 액션 요청 본문 한도 (사진 첨부 대응)
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
