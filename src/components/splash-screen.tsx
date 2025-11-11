"use client";

import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Mail } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary">
          TempMail
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Your private temporary inbox.
        </p>
        <Progress value={progress} className="w-64 md:w-96 mx-auto" />
      </div>
    </div>
  );
}
