import { useCallback, useEffect, useState } from 'react';

const TICK_MS = 1000;

/**
 * Seconds until another code may be asked for.
 *
 * The server keeps the window and never says when it closes: inside it a
 * request answers 202 and sends nothing, because "too soon" would admit the
 * address has an account. So the app counts `resend_after` down itself and
 * holds the link until it reaches zero — a tap before then would look like a
 * resend and deliver nothing.
 *
 * Counted against a deadline rather than by decrementing, so a tick delayed
 * by a busy JS thread or a backgrounded app cannot stretch the wait.
 */
export function useResendCountdown(initialSeconds: number) {
  const [deadline, setDeadline] = useState(
    () => Date.now() + initialSeconds * 1000,
  );
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (now >= deadline) return;
    const timer = setTimeout(() => setNow(Date.now()), TICK_MS);
    return () => clearTimeout(timer);
  }, [now, deadline]);

  const restart = useCallback((seconds: number) => {
    const start = Date.now();
    setNow(start);
    setDeadline(start + seconds * 1000);
  }, []);

  return {
    secondsLeft: Math.max(0, Math.ceil((deadline - now) / 1000)),
    restart,
  };
}
