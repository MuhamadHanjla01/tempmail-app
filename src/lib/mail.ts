
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
  seen: boolean;
}

export interface Attachment {
    id: string;
    filename: string;
    contentType: string;
    disposition: string;
    transferEncoding: string;
    related: boolean;
    size: number;
    downloadUrl: string;
}

export interface MessageDetails extends Message {
  attachments: Attachment[];
  body: string;
  textBody: string;
  htmlBody: string;
}

async function getDomain(): Promise<string> {
  const response = await fetch(`${API_URL}/domains?page=1`);
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
        let errorDetail = createResponse.statusText;
        try {
            const error = await createResponse.json();
            errorDetail = error.detail || error.message || errorDetail;
        } catch (e) {
            // response is not JSON, use statusText
        }
        throw new Error(`Failed to create account: ${errorDetail || 'Unknown error'}`);
    }
    const accountData = await createResponse.json();

    const tokenResponse = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
    });

     if (!tokenResponse.ok) {
        let errorDetail = tokenResponse.statusText;
        try {
          const error = await tokenResponse.json();
          errorDetail = error.detail || error.message || errorDetail;
        } catch (e) {
          // response is not JSON, use statusText
        }
        throw new Error(`Failed to get token: ${errorDetail || 'Unknown error'}`);
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
    cache: 'no-store'
  });
  if (!response.ok) {
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
    seen: msg.seen
  }));
}

export async function getMessage(token: string, id: string): Promise<MessageDetails> {
  // Mark message as seen
  await fetch(`${API_URL}/messages/${id}`, {
    method: 'PATCH',
    headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/merge-patch+json'
    },
    body: JSON.stringify({ seen: true })
  });
  
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
    seen: data.seen,
  };
}
