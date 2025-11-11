"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialMinutes: number, onExpire: () => void) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;

    if (totalSeconds <= 0) {
      setIsRunning(false);
      onExpireRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTotalSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [totalSeconds, isRunning]);

  const resetTimer = useCallback(() => {
    setTotalSeconds(initialMinutes * 60);
    if (!isRunning) {
        setIsRunning(true);
    }
  }, [initialMinutes, isRunning]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    timeLeft: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    resetTimer,
    isRunning
  };
};
