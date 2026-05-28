export const API_BASE = 'https://api.mail.tm';

export interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  accountId: string;
  msgid: string;
  from: {
    address: string;
    name: string;
  };
  to: {
    address: string;
    name: string;
  }[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
  text?: string;
  html?: string[];
  attachments?: any[];
}

export class MailAPI {
  private static async request<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 204) return null as T;

    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      if (res.status === 404) throw new Error('Not Found');
      if (res.status === 429) throw new Error('Rate Limited');
      throw new Error(data['hydra:description'] || data.message || `Request failed with status ${res.status}`);
    }

    return data;
  }

  static async getDomains(): Promise<Domain[]> {
    const data = await this.request<{ 'hydra:member': Domain[] }>('/domains');
    return data['hydra:member'] || [];
  }

  static async createAccount(address: string, password: string): Promise<Account> {
    return this.request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify({ address, password }),
    });
  }

  static async getToken(address: string, password: string): Promise<{ id: string; token: string }> {
    return this.request<{ id: string; token: string }>('/token', {
      method: 'POST',
      body: JSON.stringify({ address, password }),
    });
  }

  static async getMe(token: string): Promise<Account> {
    return this.request<Account>('/me', {}, token);
  }

  static async getMessages(token: string): Promise<Message[]> {
    const data = await this.request<{ 'hydra:member': Message[] }>('/messages', {}, token);
    return data['hydra:member'] || [];
  }

  static async getMessage(id: string, token: string): Promise<Message> {
    return this.request<Message>(`/messages/${id}`, {}, token);
  }

  static async deleteMessage(id: string, token: string): Promise<void> {
    await this.request(`/messages/${id}`, { method: 'DELETE' }, token);
  }
}
