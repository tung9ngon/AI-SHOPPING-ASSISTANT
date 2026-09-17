/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Key Goong.io cho gợi ý địa chỉ (form sổ địa chỉ); không có thì bỏ qua gợi ý
  readonly VITE_GOONG_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
