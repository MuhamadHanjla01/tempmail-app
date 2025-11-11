"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialMinutes: number, onExpire: () => void) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (totalSeconds <= 0) {
      onExpireRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTotalSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [totalSeconds]);

  const resetTimer = useCallback(() => {
    setTotalSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    timeLeft: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    resetTimer,
  };
};
