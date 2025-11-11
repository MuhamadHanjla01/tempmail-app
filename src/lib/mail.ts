const API_URL = "https://api.mail.tm";

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
  token: string;
  password?: string;
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
}

export interface MessageDetails extends Message {
  html: string[];
  text: string;
}

const generateRandomString = (length: number): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

async function getDomains(): Promise<Domain[]> {
  const response = await fetch(`${API_URL}/domains`);
  if (!response.ok) {
    throw new Error("Failed to fetch domains");
  }
  const data = await response.json();
  return data["hydra:member"];
}

export async function createAccount(): Promise<Account> {
  const domains = await getDomains();
  const activeDomains = domains.filter((d) => d.isActive);
  if (activeDomains.length === 0) {
    throw new Error("No active domains available");
  }
  const domain = activeDomains[Math.floor(Math.random() * activeDomains.length)].domain;
  
  const username = generateRandomString(10);
  const password = generateRandomString(12);
  const address = `${username}@${domain}`;

  const response = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create account");
  }

  const accountData = await response.json();

  // Now, get the token
  const tokenResponse = await fetch(`${API_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      password,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get token");
  }

  const tokenData = await tokenResponse.json();

  return { ...accountData, token: tokenData.token, password };
}

export async function getMessages(token: string): Promise<Message[]> {
  const response = await fetch(`${API_URL}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
        // This can happen if the token is invalid or expired
        throw new Error("Unauthorized: Invalid token.");
    }
    throw new Error("Failed to fetch messages");
  }

  const data = await response.json();
  return data["hydra:member"];
}

export async function getMessage(token: string, id: string): Promise<MessageDetails> {
  const response = await fetch(`${API_URL}/messages/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch message details");
  }

  return response.json();
}
