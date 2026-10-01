import type { Config } from 'drizzle-kit';

/**
 * The on-device database: `npm run db:generate` writes a migration into
 * `src/lib/db/migrations` from the difference between `src/lib/db/schema/` and the
 * last one, and the app applies them on launch.
 */
export default {
  schema: './src/lib/db/schema/*.ts',
  out: './src/lib/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
