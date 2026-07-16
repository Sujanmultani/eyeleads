import mongoose from 'mongoose';
import dns from 'dns';

// Override local network DNS resolvers with public Google/Cloudflare DNS to bypass local SRV lookup failures
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    // FIXED: MONGO_URI vs MONGODB_URI mismatch
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eyeleads';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    process.env.DB_CONNECTED = 'true';
  } catch (error) {
    console.error(`\n[Database Fatal Error] MongoDB Connection Failed: ${error.message}`);
    console.warn("Warning: Server is starting up without a successful database connection.");
  }
};

export default connectDB;
