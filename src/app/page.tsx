"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/splash-screen";
import MainApp from "@/components/main-app";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return <MainApp />;
}
