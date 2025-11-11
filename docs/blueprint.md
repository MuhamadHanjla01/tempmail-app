# **App Name**: Temp-Mail

## Core Features:

- Email Generation: Automatically generate a new temporary email address using the Mail.tm API when the app starts or when the user requests a new email.
- Inbox Refresh: Periodically fetch and display new emails from the Mail.tm API, updating the inbox every 10 seconds.
- Email Display: Display emails in a clean, mobile-friendly list with sender, subject, time, and preview, and allow users to view full email content.
- Timer Countdown: Implement a 10-minute countdown timer for the email account, providing an 'Extend' button to reset the timer and extend the email's lifetime. Toast notification on timer expiry.
- Dark/Light Mode Toggle: Allow users to switch between dark and light modes, saving their preference using localStorage and applying Tailwind CSS dark mode classes.
- Copy to Clipboard: Implement a 'Copy' button to allow users to easily copy the temporary email address to their clipboard.
- Splash Screen Animation: Display a splash screen with a loading bar animation before entering the main screen. It communicates 'AR TEMPMAIL - No Login, No Signup, Just Privacy.'

## Style Guidelines:

- Primary color: #4F46E5 (Indigo-500), a modern and privacy-oriented color.
- Background color: #F9FAFB (Gray-50), very light gray for light mode.
- Accent color: #6366F1 (Indigo-400), a slightly brighter shade for interactive elements. Complementary to Indigo-500 but more eye catching.
- Font: 'Space Grotesk', sans-serif, used for both headers and body, lends a modern, tech-oriented aesthetic.
- Material Symbols Outlined for icons throughout the app. Standard sizing and filled states when active.
- Mobile-first responsive design with rounded corners (rounded-lg), shadows, and appropriate spacing.
- Subtle fade and slide transitions for toast notifications. Smooth transitions between light and dark modes.