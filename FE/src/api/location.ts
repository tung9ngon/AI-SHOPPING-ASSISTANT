import axios from 'axios';

// ===== Dữ liệu địa giới + gợi ý địa chỉ cho form sổ địa chỉ =====
// - Tỉnh/thành & quận/huyện: provinces.open-api.vn (nguồn mở, không cần key).
// - Gợi ý địa chỉ + định vị ngược (bấm lên bản đồ): Photon (photon.komoot.io)
//   — geocoder mở chạy trên dữ liệu OpenStreetMap, miễn phí, KHÔNG cần key;
//   bbox giới hạn kết quả trong lãnh thổ Việt Nam.
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
  description: string; // nhãn đầy đủ hiện trong dropdown, vd "49 Phố Nguyễn Thái Học, Ba Đình, Hà Nội"
  street: string; // phần tên/số nhà + đường — điền vào ô "Địa chỉ cụ thể" (quận/tỉnh đã có ở 2 select)
  lat: number;
  lon: number;
}

interface PhotonFeature {
  properties: {
    osm_type?: string;
    osm_id?: number;
    name?: string;
    housenumber?: string;
    street?: string;
    district?: string;
    city?: string;
    state?: string;
  };
  geometry?: { coordinates?: [number, number] };
}

// Dedupe giữ thứ tự: city và state hay cùng là "Thành phố Hồ Chí Minh".
const uniq = (arr: (string | undefined)[]) =>
  arr.filter((v, i): v is string => !!v && arr.indexOf(v) === i);

function toPrediction(f: PhotonFeature, fallbackId: number): AddressPrediction | null {
  const p = f.properties;
  const [lon, lat] = f.geometry?.coordinates ?? [];
  if (lon == null || lat == null) return null;
  const road =
    p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street;
  const parts = uniq([p.name, road, p.district, p.city, p.state]);
  if (parts.length === 0) return null;
  return {
    place_id: `${p.osm_type ?? ''}${p.osm_id ?? fallbackId}`,
    description: parts.join(', '),
    street: uniq([p.name, road]).join(', ') || parts[0],
    lat,
    lon,
  };
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
      const res = await axios.get<{ features?: PhotonFeature[] }>(
        `${PHOTON_API}/api/`,
        { params: { q: input.trim(), limit: 8, bbox: VN_BBOX } },
      );
      // Lấy 8 rồi lọc còn 5: Photon hay trả vài kết quả trùng nhãn nhau.
      const seen = new Set<string>();
      const out: AddressPrediction[] = [];
      for (const f of res.data.features ?? []) {
        const pred = toPrediction(f, out.length);
        if (!pred || seen.has(pred.description)) continue;
        seen.add(pred.description);
        out.push(pred);
        if (out.length >= 5) break;
      }
      return out;
    } catch {
      return [];
    }
  },

  // Định vị ngược: bấm lên bản đồ -> địa chỉ gần nhất. null khi không có/lỗi.
  async reverse(lat: number, lon: number): Promise<AddressPrediction | null> {
    try {
      const res = await axios.get<{ features?: PhotonFeature[] }>(
        `${PHOTON_API}/reverse`,
        { params: { lat, lon } },
      );
      const f = res.data.features?.[0];
      return f ? toPrediction(f, 0) : null;
    } catch {
      return null;
    }
  },
};
