/**
 * The signed-in person as the UI wants to greet them.
 *
 * Deliberately not the `Session` in `features/auth`: that holds credentials
 * and a `userId`, which is everything the API hands back today and nothing a
 * greeting can use. When the server grows a `/v1/me`, this is the shape its
 * wire type maps onto and `Session` stays credentials-only.
 */
export type Profile = {
  name: string;
  /** Remote URL or `null`, in which case the UI falls back to an initial. */
  avatarUrl: string | null;
};
