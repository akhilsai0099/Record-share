import { db } from "@/db"; // your drizzle instance
import { account, session, user, verification } from "@/db/schema"; // your drizzle schema
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite" // path to your drizzle schema
    schema: { account, session, user, verification },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
  },
});
