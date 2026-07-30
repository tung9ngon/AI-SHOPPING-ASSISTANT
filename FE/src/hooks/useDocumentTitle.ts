import { useEffect } from 'react';

const SITE_NAME = 'NexTech';
const DEFAULT_TITLE = 'NexTech — Đồ điện tử thông minh';

/**
 * Đặt document.title theo trang hiện tại (SEO + dễ phân biệt khi mở nhiều tab).
 * Truyền `title` = null/'' để giữ tiêu đề mặc định (vd khi dữ liệu đang tải).
 * Tự khôi phục tiêu đề mặc định khi component unmount.
 */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}

export default useDocumentTitle;
