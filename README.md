# TempMail - Your Private Temporary Email Service

This is a fully functional temporary email application built with Next.js, React, and Tailwind CSS. It provides users with a private, disposable email inbox that expires after a set time. The app is designed to be fast, responsive, and easy to use.

## Features

- **Instant Email Generation**: Create a new temporary email address with a single click.
- **Real-time Inbox**: Emails appear in the inbox instantly without needing to refresh.
- **Responsive Design**: A seamless experience across desktop, tablet, and mobile devices.
- **PWA Support**: Install the application on your mobile or desktop device for a native-app-like experience.
- **Theming**: Switch between light and dark modes.
- **Favorites**: Save and quickly switch between your favorite temporary addresses.
- **Admin Dashboard**: A built-in dashboard to monitor application usage and customize themes.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI**: [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Hooks & Context API

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- `npm` or `yarn`

### Installation

1.  **Clone the repository** (or download the source code):
    ```sh
    git clone https://github.com/your-username/tempmail-app.git
    cd tempmail-app
    ```

2.  **Install dependencies**:
    ```sh
    npm install
    ```

3.  **Run the development server**:
    ```sh
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deployment

This application is configured for easy deployment with **Firebase App Hosting**.

1.  **Install the Firebase CLI**:
    If you don't have it already, install the Firebase CLI globally:
    ```sh
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**:
    ```sh
    firebase login
    ```

3.  **Initialize Firebase** (if you haven't already):
    In your project directory, connect it to your Firebase project.
    ```sh
    firebase init hosting
    ```
    - Select an existing Firebase project or create a new one.
    - When asked for your public directory, enter `.next`.

4.  **Deploy to Firebase App Hosting**:
    ```sh
    firebase deploy --only hosting
    ```
    Firebase will build your Next.js application and deploy it. After deployment, you'll receive a public URL where your application is live.

## Monetization with Google AdSense

You can integrate Google AdSense to display ads and monetize the application.

### Step 1: Get Your AdSense Code

1.  Sign up for or log in to your [Google AdSense](https://www.google.com/adsense/start/) account.
2.  Navigate to the **Ads** section and click **"By ad unit"**.
3.  Create a new ad unit (e.g., "Display ads"). Configure its size and style.
4.  After creating the ad unit, AdSense will provide you with a code snippet. It will look something like this:

    ```html
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
         crossorigin="anonymous"></script>
    <!-- Your Ad Unit Name -->
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="YYYYYYYYYY"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
    ```

### Step 2: Add AdSense Script to Your App

You need to add the main AdSense script to the `<head>` of your application. In a Next.js App Router project, the best place for this is the root layout file.

1.  Open `src/app/layout.tsx`.
2.  Add the AdSense `<script>` tag inside the `<head>` element. Make sure to replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual AdSense publisher ID.

    ```tsx
    import type { Metadata } from 'next';
    import { ThemeProvider } from '@/components/theme-provider';
    import { Toaster } from '@/components/ui/toaster';
    import './globals.css';
    import { Inter } from 'next/font/google';
    import Script from 'next/script'; // Import the Script component

    const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

    export const metadata: Metadata = {
      title: 'Temp-Mail',
      description: 'No Login, No Signup, Just Privacy.',
      manifest: '/manifest.json',
    };

    export default function RootLayout({
      children,
    }: Readonly<{
      children: React.ReactNode;
    }>) {
      return (
        <html lang="en" suppressHydrationWarning>
          <head>
            {/* Add AdSense Script Here */}
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          </head>
          <body className={`${inter.variable} font-sans antialiased`}>
            <ThemeProvider storageKey="tempmail-theme" defaultTheme="dark">
              {children}
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      );
    }
    ```
    > **Note**: Using the `next/script` component with the `afterInteractive` strategy is the recommended way to add third-party scripts in Next.js.

### Step 3: Place Ad Units in Your Components

To display ads, you need to create a component for your ad units and place it where you want ads to appear (e.g., in the header, sidebar, or between emails).

1.  **Create an Ad Component**:
    Create a new file, for example `src/components/adsense-ad.tsx`:

    ```tsx
    'use client';

    import { useEffect } from 'react';

    declare global {
      interface Window {
        adsbygoogle?: any[];
      }
    }

    type AdSenseAdProps = {
      adSlot: string;
      adFormat?: string;
      style?: React.CSSProperties;
      className?: string;
    };

    const AdSenseAd = ({ adSlot, adFormat = 'auto', style = { display: 'block' }, className = '' }: AdSenseAdProps) => {
      useEffect(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
          console.error(err);
        }
      }, []);

      return (
        <div className={className}>
            <ins
            className="adsbygoogle"
            style={style}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your Publisher ID
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
            ></ins>
        </div>
      );
    };

    export default AdSenseAd;
    ```
    > **Important**: Remember to replace `ca-pub-XXXXXXXXXXXXXXXX` with your own publisher ID in this component.

2.  **Use the Ad Component**:
    Now, you can import and use this `AdSenseAd` component anywhere in your application. For example, to add an ad below the header in `src/components/main-app.tsx`:

    ```tsx
    // ... other imports
    import AdSenseAd from '@/components/adsense-ad'; // Import the new component

    export default function MainApp() {
      // ... component logic

      return (
        <>
          <div className="flex flex-col h-screen bg-background text-foreground font-sans">
            <AppHeader
              // ... props
            />
            {/* AdSense Ad Unit */}
            <AdSenseAd adSlot="YYYYYYYYYY" className="w-full text-center p-2 bg-gray-100 dark:bg-gray-800"/>

            <main className="flex-1 flex overflow-hidden">
             {/* ... rest of the main content */}
            </main>
          </div>
        </>
      );
    }
    ```
    > Replace `YYYYYYYYYY` with the ad slot ID from the ad unit you created in AdSense.
    > Make sure to place ads in a way that complies with AdSense policies and doesn't disrupt the user experience.
