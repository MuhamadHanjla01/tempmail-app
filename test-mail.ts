import { createAccount, login, getMessages } from './src/lib/mail';

async function test() {
    console.log("Creating account...");
    const account = await createAccount();
    console.log("Account created:", account.address, account.password);
    
    console.log("Fetching messages (should be empty)...");
    const msgs1 = await getMessages(account.token);
    console.log("Msgs1:", msgs1.length);
    
    console.log("Logging in again...");
    const loggedIn = await login(account.address, account.password!);
    console.log("Logged in with new token:", loggedIn.token);
    
    const msgs2 = await getMessages(loggedIn.token);
    console.log("Msgs2:", msgs2.length);
}

test().catch(console.error);
