import { useCallback, useEffect, useState } from 'react';

import type { CodeSentResponse } from '@/features/auth/types';

const TICK_MS = 1000;

/**
 * A wait as a phone's timer shows one, "m:ss". A code lives fifteen minutes
 * by default, so a count in bare seconds would read "900".
 */
export function formatWait(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export type SentParams = { expiresIn?: string; resendAfter?: string };

/**
 * A send's timings as route params, for the screen that sent the code to
 * hand to the one that takes it. Params are strings, hence the round trip.
 */
export function toSentParams(sent: CodeSentResponse): Required<SentParams> {
  return {
    expiresIn: String(sent.expires_in),
    resendAfter: String(sent.resend_after),
  };
}

/** Null when the params carry no send, or one that will not parse. */
export function fromSentParams({
  expiresIn,
  resendAfter,
}: SentParams): CodeSentResponse | null {
  const expires = Number(expiresIn);
  const resend = Number(resendAfter);
  if (!expiresIn || !resendAfter) return null;
  if (!Number.isFinite(expires) || !Number.isFinite(resend)) return null;
  return { expires_in: expires, resend_after: resend };
}

type Deadlines = { expires: number; resend: number };

function toDeadlines(sent: CodeSentResponse | null): Deadlines | null {
  if (sent === null) return null;
  const start = Date.now();
  return {
    expires: start + sent.expires_in * 1000,
    resend: start + sent.resend_after * 1000,
  };
}

const secondsUntil = (deadline: number, now: number) =>
  Math.max(0, Math.ceil((deadline - now) / 1000));

/**
 * The two clocks a code screen runs, both from the 202 that sent the code:
 * how long the code still works, and how long until another may be asked for.
 *
 * The server never says either again. Inside the resend window a request
 * answers 202 and sends nothing, because "too soon" would admit the address
 * has an account — so the app holds its resend link until its own count
 * reaches zero, or a tap would look like a resend and deliver nothing. The
 * two are equal today (no new code while one is live) but arrive as separate
 * fields, and are kept apart so the server can change that alone.
 *
 * `expiresIn` is null while there is no send to time: a screen reached by a
 * response that does not carry one, such as log in's "confirm your email".
 *
 * Counted against deadlines rather than by decrementing, so a tick delayed by
 * a busy JS thread or a backgrounded app cannot stretch either.
 */
export function useCodeClock(sent: CodeSentResponse | null) {
  const [deadlines, setDeadlines] = useState(() => toDeadlines(sent));
  const [now, setNow] = useState(Date.now);

  const last = deadlines ? Math.max(deadlines.expires, deadlines.resend) : 0;

  useEffect(() => {
    if (now >= last) return;
    const timer = setTimeout(() => setNow(Date.now()), TICK_MS);
    return () => clearTimeout(timer);
  }, [now, last]);

  const restart = useCallback((next: CodeSentResponse) => {
    setNow(Date.now());
    setDeadlines(toDeadlines(next));
  }, []);

  return {
    expiresIn: deadlines ? secondsUntil(deadlines.expires, now) : null,
    resendIn: deadlines ? secondsUntil(deadlines.resend, now) : 0,
    restart,
  };
}
