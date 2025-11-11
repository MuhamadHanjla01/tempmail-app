
const API_URL = "https://api.mail.tm";

export interface Account {
  address: string;
  token: string;
  id: string;
}

export interface Message {
  id: string;
  from: { address: string; name: string };
  to: { address: string; name: string }[];
  subject: string;
  date: string;
  intro: string;
}

export interface MessageDetails extends Message {
  attachments: {
    filename: string;
    contentType: string;
    size: number;
  }[];
  body: string;
  textBody: string;
  htmlBody: string;
}

async function getDomain(): Promise<string> {
  const response = await fetch(`${API_URL}/domains`);
  if (!response.ok) {
    throw new Error("Failed to fetch domains from Mail.tm");
  }
  const data = await response.json();
  // Use the first available domain
  return data["hydra:member"][0].domain;
}

export async function createAccount(): Promise<Account> {
    const domain = await getDomain();
    const address = `${Math.random().toString(36).substring(7)}@${domain}`;
    const password = Math.random().toString(36).substring(7);

    const createResponse = await fetch(`${API_URL}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
    });

    if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(`Failed to create account: ${error.detail || createResponse.statusText}`);
    }
    const accountData = await createResponse.json();

    const tokenResponse = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
    });

     if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(`Failed to get token: ${error.detail || tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    return {
        address: address,
        token: tokenData.token,
        id: accountData.id,
    };
}


export async function getMessages(token: string): Promise<Message[]> {
  if (!token) return [];
  const response = await fetch(`${API_URL}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    // Gracefully handle no messages or other errors
    if (response.status === 401) {
        console.error("Unauthorized to fetch messages. Token might be invalid.");
        return [];
    }
    console.error("Failed to fetch messages");
    return [];
  }
  const data = await response.json();
  
  if (!data["hydra:member"]) return [];

  return data["hydra:member"].map((msg: any) => ({
    id: msg.id,
    from: msg.from,
    to: msg.to,
    subject: msg.subject,
    date: msg.createdAt,
    intro: msg.intro,
  }));
}

export async function getMessage(token: string, id: string): Promise<MessageDetails> {
  const response = await fetch(`${API_URL}/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch message details");
  }
  const data = await response.json();
  return {
    id: data.id,
    from: data.from,
    to: data.to,
    subject: data.subject,
    date: data.createdAt,
    attachments: data.attachments,
    body: data.html?.[0] || data.text || "",
    textBody: data.text || "",
    htmlBody: data.html?.[0] || "",
    intro: data.intro,
  };
}
