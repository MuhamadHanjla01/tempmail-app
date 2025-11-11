
const API_URL = "https://www.1secmail.com/api/v1/";

export interface Account {
  address: string;
  token: string; // Not used by 1secmail, but kept for interface compatibility
  id: string; // Not used by 1secmail, but kept for interface compatibility
}

export interface Message {
  id: number;
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

export async function createAccount(): Promise<Account> {
  const response = await fetch(`${API_URL}?action=genRandomMailbox&count=1`);
  if (!response.ok) {
    throw new Error("Failed to generate email address from 1secmail.");
  }
  const data = await response.json();
  const address = data[0];
  
  return {
    address: address,
    // 1secmail doesn't use tokens or account IDs, but we'll fill these for compatibility
    token: "not-needed", 
    id: "not-needed",
  };
}

export async function getMessages(address: string): Promise<Message[]> {
  if (!address) return [];
  const [login, domain] = address.split("@");
  const response = await fetch(
    `${API_URL}?action=getMessages&login=${login}&domain=${domain}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  const data = await response.json();
  return data.map((msg: any) => ({
    id: msg.id,
    from: { address: msg.from, name: msg.from.split('@')[0] },
    to: [{ address: address, name: login }],
    subject: msg.subject,
    date: msg.date,
    intro: msg.subject, // 1secmail doesn't provide an intro/snippet
  }));
}

export async function getMessage(address: string, id: number): Promise<MessageDetails> {
  const [login, domain] = address.split("@");
  const response = await fetch(
    `${API_URL}?action=readMessage&login=${login}&domain=${domain}&id=${id}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch message details");
  }
  const data = await response.json();
  return {
    id: data.id,
    from: { address: data.from, name: data.from.split('@')[0] },
    to: [{ address: address, name: login }],
    subject: data.subject,
    date: data.date,
    attachments: data.attachments || [],
    body: data.htmlBody || data.textBody,
    textBody: data.textBody,
    htmlBody: data.htmlBody,
    intro: data.subject,
  };
}
