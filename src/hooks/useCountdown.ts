import { useState, useEffect } from "react";

export const useCountdown = (expiresAt: Date) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = expiresAt.getTime() - Date.now();
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now();
      setTimeLeft(Math.max(0, diff));
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = timeLeft <= 0;
  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent = timeLeft > 0 && timeLeft < 1800000; // < 30 min

  const formatted = `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

  return { timeLeft, isExpired, isUrgent, formatted, hours, minutes, seconds };
};
