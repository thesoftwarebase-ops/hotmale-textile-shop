import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "hotmale";

async function createClient() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  return client;
}

async function ensureIndexes(db) {
  await Promise.all([
    db
      .collection("admin_users")
      .createIndex({ email: 1 }, { unique: true, name: "admin_users_email" }),
    db
      .collection("enquiries")
      .createIndex({ createdAt: -1 }, { name: "enquiries_created" }),
    db
      .collection("categories")
      .createIndex({ slug: 1 }, { unique: true, name: "categories_slug" }),
    db
      .collection("categories")
      .createIndex({ order: 1 }, { name: "categories_order" }),
    db
      .collection("collections")
      .createIndex({ slug: 1 }, { unique: true, name: "collections_slug" }),
    db
      .collection("collections")
      .createIndex({ order: 1 }, { name: "collections_order" }),
    db
      .collection("collections")
      .createIndex({ category: 1 }, { name: "collections_category" }),
    db
      .collection("products")
      .createIndex({ slug: 1 }, { unique: true, name: "products_slug" }),
    db
      .collection("products")
      .createIndex({ order: 1 }, { name: "products_order" }),
    db
      .collection("products")
      .createIndex(
        { collection: 1, status: 1 },
        { name: "products_collection_status" },
      ),
    db
      .collection("stores")
      .createIndex({ slug: 1 }, { unique: true, name: "stores_slug" }),
    db
      .collection("stores")
      .createIndex({ order: 1 }, { name: "stores_order" }),
  ]);
}

export async function getDb() {
  if (!globalThis.__hotmaleMongoClientPromise) {
    globalThis.__hotmaleMongoClientPromise = createClient().catch((error) => {
      globalThis.__hotmaleMongoClientPromise = null;
      throw error;
    });
  }
  const client = await globalThis.__hotmaleMongoClientPromise;
  const db = client.db(dbName);

  if (!globalThis.__hotmaleMongoIndexesPromise) {
    globalThis.__hotmaleMongoIndexesPromise = ensureIndexes(db).catch((error) => {
      globalThis.__hotmaleMongoIndexesPromise = null;
      throw error;
    });
  }
  await globalThis.__hotmaleMongoIndexesPromise;
  return db;
}
