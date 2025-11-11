const API_URL = "https://www.1secmail.com/api/v1/";

export interface Account {
  address: string;
  token?: string; // Not all functions will need or have a token
}

export interface Message {
  id: number;
  from: string;
  subject: string;
  date: string;
  intro?: string; // Synthesized from body
}

export interface MessageDetails {
  id: number;
  from: string;
  subject: string;
  date: string;
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
    throw new Error("Failed to generate new email address");
  }
  const data = await response.json();
  const email = data[0];
  const [login, domain] = email.split('@');
  return { address: email };
}

export async function getMessages(address: string): Promise<Message[]> {
  const [login, domain] = address.split('@');
  const response = await fetch(`${API_URL}?action=getMessages&login=${login}&domain=${domain}`);
  
  if (!response.ok) {
    if (response.status === 401) {
        throw new Error("Unauthorized: Invalid address.");
    }
    throw new Error("Failed to fetch messages");
  }

  const data = await response.json();
  return data.map((msg: any) => ({ ...msg, intro: msg.subject }));
}

export async function getMessage(address: string, id: number): Promise<MessageDetails> {
  const [login, domain] = address.split('@');
  const response = await fetch(`${API_URL}?action=readMessage&login=${login}&domain=${domain}&id=${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch message details");
  }
  const data = await response.json();

  // The new API gives html in `body` and text in `textBody`. The old one gave html in `html` and text in `text`.
  // The component expects `html` and `text`. Let's create them.
  return {
    ...data,
    html: [data.body],
    text: data.textBody
  };
}
