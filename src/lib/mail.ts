
const API_URL = "https://api.mail.gw";
const DOMAIN = "web.info"; // mail.gw provides a list of domains, we'll use one

export interface Account {
  address: string;
  token: string;
  id: string;
}

export interface Message {
  id: string; // Changed from number to string
  from: { address: string, name: string };
  to: { address: string, name: string }[];
  subject: string;
  date: string; // The API provides it as a string
  intro: string; 
}

export interface MessageDetails extends Message {
  attachments: {
    filename: string;
    contentType: string;
    size: number;
  }[];
  body: string; // Not provided by new API in list view
  textBody: string;
  htmlBody: string;
}


function generateRandomString(length: number) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function createAccount(): Promise<Account> {
    const address = `${generateRandomString(10)}@${DOMAIN}`;
    const password = generateRandomString(12);

    const createResponse = await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
    });

    if (!createResponse.ok) {
        throw new Error("Failed to create email account on mail.gw");
    }
    const accountData = await createResponse.json();

    const tokenResponse = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
    });

    if (!tokenResponse.ok) {
        throw new Error("Failed to get auth token from mail.gw");
    }

    const tokenData = await tokenResponse.json();
    
    return {
        id: accountData.id,
        address: address,
        token: tokenData.token,
    };
}

export async function getMessages(token: string): Promise<Message[]> {
  const response = await fetch(`${API_URL}/messages`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
        throw new Error("Unauthorized: Invalid token.");
    }
    throw new Error("Failed to fetch messages");
  }

  const data = await response.json();
  // The new API uses 'hydra:member'
  if (!data['hydra:member']) return [];
  
  return data['hydra:member'].map((msg: any) => ({
    id: msg.id,
    from: msg.from,
    to: msg.to,
    subject: msg.subject,
    date: msg.createdAt, // Switched to createdAt
    intro: msg.intro,
  }));
}

export async function getMessage(token: string, id: string): Promise<MessageDetails> {
  const response = await fetch(`${API_URL}/messages/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch message details");
  }
  const data = await response.json();
  
  return {
    ...data,
    id: data.id,
    from: data.from,
    subject: data.subject,
    date: data.createdAt,
    attachments: data.attachments || [],
    body: data.html?.[0] || data.text || "",
    textBody: data.text || "",
    htmlBody: data.html?.[0] || "",
  };
}
