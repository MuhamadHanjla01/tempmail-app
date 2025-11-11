"use client";

import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 28); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center p-4">
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-primary">
          TEMP-MAIL
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          No Login, No Signup, Just Privacy.
        </p>
        <Progress value={progress} className="w-64 md:w-96 mx-auto bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
