import { MongoClient } from "mongodb";
import { hashPassword } from "../lib/password.mjs";

const DEFAULT_ADMIN = {
  email: "hotmail@gmail.com",
  password: "12345678",
  name: "HOTMALE Admin",
};

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "hotmale";

async function main() {
  if (!uri) throw new Error("MONGODB_URI is required.");

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const users = client.db(dbName).collection("admin_users");
    await users.createIndex({ email: 1 }, { unique: true, name: "admin_users_email" });

    const existing = await users.findOne({});
    if (existing) {
      console.log(`Admin account already exists (${existing.email}); leaving it unchanged.`);
      return;
    }

    const now = new Date();
    await users.insertOne({
      ...DEFAULT_ADMIN,
      passwordHash: await hashPassword(DEFAULT_ADMIN.password),
      role: "admin",
      status: "active",
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`Created default admin: ${DEFAULT_ADMIN.email}`);
    console.log("Sign in and update the email and password under Account settings.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
