import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

let db;

export const connectDB = async () => {
  try {
    const client = postgres(process.env.DATABASE_URL, {
      max: 1
    });

    db = drizzle(client);

    // test connection
    await client`SELECT 1`;

    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
};

export { db };
