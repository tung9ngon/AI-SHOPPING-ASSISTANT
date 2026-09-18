import axios from 'axios';

// ===== Dữ liệu địa giới + gợi ý địa chỉ cho form sổ địa chỉ =====
// - Tỉnh/thành & quận/huyện: provinces.open-api.vn (nguồn mở, không cần key).
// - Gợi ý địa chỉ chi tiết: Photon (photon.komoot.io) — geocoder mở chạy trên
//   dữ liệu OpenStreetMap, miễn phí, KHÔNG cần key; bbox giới hạn kết quả
//   trong lãnh thổ Việt Nam.
// Gọi bằng axios trần (không qua instance api/) vì đây là dịch vụ ngoài,
// không được dính baseURL '/api' lẫn cookie đăng nhập của backend.

const PROVINCE_API = 'https://provinces.open-api.vn/api/v1';
const PHOTON_API = 'https://photon.komoot.io';
const VN_BBOX = '102.1,8.2,109.5,23.4'; // minLon,minLat,maxLon,maxLat

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

export interface AddressPrediction {
  place_id: string;
  description: string;
}

interface PhotonProperties {
  osm_type?: string;
  osm_id?: number;
  name?: string;
  housenumber?: string;
  street?: string;
  district?: string;
  city?: string;
  state?: string;
}

// Ghép nhãn gợi ý "tên/số nhà + đường, phường/quận, thành phố" từ thuộc tính
// Photon; bỏ phần trùng (vd city và state cùng là "Thành phố Hồ Chí Minh").
function describe(p: PhotonProperties): string {
  const road =
    p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street;
  return [p.name, road, p.district, p.city, p.state]
    .filter((v, i, arr): v is string => !!v && arr.indexOf(v) === i)
    .join(', ');
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

  // Gợi ý địa chỉ từ Photon; trả mảng rỗng khi lỗi mạng — autocomplete chỉ là
  // tiện ích cộng thêm, không được chặn việc nhập tay.
  async suggest(input: string): Promise<AddressPrediction[]> {
    if (input.trim().length < 3) return [];
    try {
      const res = await axios.get<{ features?: { properties: PhotonProperties }[] }>(
        `${PHOTON_API}/api/`,
        { params: { q: input.trim(), limit: 8, bbox: VN_BBOX } },
      );
      // Lấy 8 rồi lọc còn 5: Photon hay trả vài kết quả trùng nhãn nhau.
      const seen = new Set<string>();
      const out: AddressPrediction[] = [];
      for (const f of res.data.features ?? []) {
        const description = describe(f.properties);
        if (!description || seen.has(description)) continue;
        seen.add(description);
        out.push({
          place_id: `${f.properties.osm_type ?? ''}${f.properties.osm_id ?? out.length}`,
          description,
        });
        if (out.length >= 5) break;
      }
      return out;
    } catch {
      return [];
    }
  },
};
