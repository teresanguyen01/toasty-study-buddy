import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export default async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Check if MONGODB_URI is available
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://teresatamnguyen20:Congaicung3%24@toasty.vnxrp8z.mongodb.net/?retryWrites=true&w=majority&appName=toasty";
    if (!mongoUri) {
      console.error("MONGODB_URI is not defined in environment variables");
      throw new Error(
        "Database connection string not configured. Please set MONGODB_URI in your environment variables."
      );
    }

    cached.promise = mongoose.connect(mongoUri, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);

    // Provide a more helpful error message
    if (e instanceof Error && e.message.includes("ECONNREFUSED")) {
      throw new Error(
        "Cannot connect to database. Please check your MongoDB connection string and ensure the database is running."
      );
    }

    throw e;
  }

  return cached.conn;
}
