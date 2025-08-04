import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";
import { MemStorage } from "./mockStorage";

// Mock storage for development
export { storage } from "./mockStorage";

// Real database for production
let db: any;
let pool: Pool | null = null;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for production");
  }
const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
  
  db = drizzle(pool, { schema });
} else {
  console.log('Development mode: Using in-memory database');
}
