import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get the database instance, initializing it only when first needed.
 * This lazy initialization ensures DATABASE_URL is available at runtime.
 */
export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is not set. See .env.example for setup instructions.'
      );
    }
    const client = postgres(databaseUrl);
    db = drizzle(client, { schema });
  }
  return db;
}
