import type { Metadata } from 'next';
import HomeClient from '@/components/home-client';

export const metadata: Metadata = {
  title: 'Temp Mail - Free Disposable Temporary Email Address | No Registration',
  description: 'Get a free, instant, disposable temporary email address. No registration required. Protect your privacy, avoid spam, phishing, and advertising mailings with TempMail.',
};

// SEO content that crawlers can read — hidden once app loads via client component
export default function Home() {
  return (
    <>
      <HomeClient />
      {/* SEO-only content: visible to crawlers in the initial HTML, 
          hidden by the client component after hydration via sr-only class */}
      <div id="seo-content" className="sr-only" aria-hidden="true">
        <h2>Free Disposable Temporary Email Address</h2>
        <p>
          TempMail provides free, instant, anonymous disposable temporary email addresses. 
          No registration or signup required. Protect your real inbox from spam, phishing, 
          and unwanted advertising mailings.
        </p>
        <h3>Why Use TempMail?</h3>
        <ul>
          <li>Instant email generation — no signup needed</li>
          <li>Protect your privacy and real email address</li>
          <li>Avoid spam, phishing, and advertising emails</li>
          <li>Auto-refreshing inbox checks for new messages every 5 seconds</li>
          <li>Emails auto-expire after 10 minutes for maximum security</li>
          <li>Works on desktop, tablet, and mobile devices</li>
          <li>Install as a Progressive Web App (PWA)</li>
          <li>Free to use with no limitations</li>
        </ul>
        <h3>How It Works</h3>
        <p>
          Simply visit TempMail to instantly receive a random disposable email address. 
          Use it anywhere you need a temporary email — for website signups, online forms, 
          or any service that requires email verification. Your temporary inbox automatically 
          refreshes to show incoming emails in real-time. After 10 minutes, the address 
          expires and all data is permanently deleted.
        </p>
        <h3>Use Cases for Temporary Email</h3>
        <ul>
          <li>Sign up for websites without revealing your real email</li>
          <li>Test email functionality during development</li>
          <li>Receive one-time verification codes</li>
          <li>Avoid marketing newsletters and spam</li>
          <li>Protect against data breaches and phishing attacks</li>
          <li>Download resources that require email registration</li>
        </ul>
        <h3>Features</h3>
        <p>
          TempMail is a free, open-source temporary email service built with modern 
          web technologies. It offers a clean, responsive interface with dark and light 
          theme support, favorite address management, one-click email copying, and PWA 
          installation for offline access.
        </p>
      </div>
    </>
  );
}
