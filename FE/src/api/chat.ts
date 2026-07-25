import api from './client';
import type { ProductListItem } from './products';

export interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface ChatResponse {
  reply: string;
  products: ProductListItem[];
}

export const chatApi = {
  // POST /api/chat -> Gemini (BE proxy). history: chỉ text, role user|model.
  send: (message: string, history: ChatHistoryItem[]) =>
    api.post<ChatResponse>('/chat', { message, history }),
};
