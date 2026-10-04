const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is already in flight, reuse that promise
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("⚠️  MONGO_URI is not set. Operating in offline fallback mode.");
      return null;
    }

    const opts = {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log("MongoDB connected successfully!");
        return m;
      })
      .catch((error) => {
        cached.promise = null; // Clear promise so subsequent requests can retry
        console.warn("⚠️  MongoDB connection failed:", error.message);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
  }

  return cached.conn;
};

module.exports = connectDB;
