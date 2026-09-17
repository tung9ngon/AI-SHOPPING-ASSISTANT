import axios from 'axios';

// ===== Dữ liệu địa giới + gợi ý địa chỉ cho form sổ địa chỉ =====
// - Tỉnh/thành & quận/huyện: provinces.open-api.vn (nguồn mở, không cần key).
// - Gợi ý địa chỉ chi tiết: Goong.io Place AutoComplete — cần VITE_GOONG_API_KEY
//   trong FE/.env; thiếu key thì form tự ẩn phần gợi ý, vẫn nhập tay được.
// Gọi bằng axios trần (không qua instance api/) vì đây là dịch vụ ngoài,
// không được dính baseURL '/api' lẫn cookie đăng nhập của backend.

const PROVINCE_API = 'https://provinces.open-api.vn/api/v1';
const GOONG_API = 'https://rsapi.goong.io';

export const GOONG_KEY: string | undefined = import.meta.env.VITE_GOONG_API_KEY;

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface GoongPrediction {
  place_id: string;
  description: string;
}

// Danh sách tỉnh đổi ~không bao giờ trong một phiên -> cache module-level,
// mở modal nhiều lần không bắn lại request.
let provincesCache: Province[] | null = null;

export const locationApi = {
  async provinces(): Promise<Province[]> {
    if (provincesCache) return provincesCache;
    const res = await axios.get<Province[]>(`${PROVINCE_API}/p/`);
    provincesCache = res.data.map((p) => ({ code: p.code, name: p.name }));
    return provincesCache;
  },

  async districts(provinceCode: number): Promise<District[]> {
    const res = await axios.get<{ districts: District[] }>(
      `${PROVINCE_API}/p/${provinceCode}`,
      { params: { depth: 2 } },
    );
    return (res.data.districts ?? []).map((d) => ({ code: d.code, name: d.name }));
  },

  // Gợi ý địa chỉ từ Goong; trả mảng rỗng khi thiếu key hoặc lỗi mạng —
  // autocomplete chỉ là tiện ích cộng thêm, không được chặn việc nhập tay.
  async suggest(input: string): Promise<GoongPrediction[]> {
    if (!GOONG_KEY || input.trim().length < 3) return [];
    try {
      const res = await axios.get<{ predictions?: GoongPrediction[] }>(
        `${GOONG_API}/Place/AutoComplete`,
        { params: { api_key: GOONG_KEY, input: input.trim(), limit: 5 } },
      );
      return (res.data.predictions ?? []).map((p) => ({
        place_id: p.place_id,
        description: p.description,
      }));
    } catch {
      return [];
    }
  },
};
