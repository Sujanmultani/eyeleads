import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import AuditLog from './models/AuditLog.js';
import dns from 'dns';

// Override local network DNS resolvers with public Google/Cloudflare DNS to bypass local SRV lookup failures
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const clearDb = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Clear products
    console.log('Wiping products collection...');
    const productPurge = await Product.deleteMany({});
    console.log(`Successfully deleted ${productPurge.deletedCount} products.`);

    // 2. Clear orders
    console.log('Wiping orders collection...');
    const orderPurge = await Order.deleteMany({});
    console.log(`Successfully deleted ${orderPurge.deletedCount} orders.`);

    // 3. Clear audit logs
    console.log('Wiping audit logs collection...');
    const auditPurge = await AuditLog.deleteMany({});
    console.log(`Successfully deleted ${auditPurge.deletedCount} audit logs.`);

    // 4. Clear non-admin users (preserve syst@elcadmin.sup)
    console.log('Wiping non-admin users...');
    const userPurge = await User.deleteMany({ email: { $ne: 'syst@elcadmin.sup' } });
    console.log(`Successfully deleted ${userPurge.deletedCount} non-admin users.`);

    console.log('\n--- Live MongoDB Wiped Clean Successfully! ---');
    console.log('Preserved Admin Account: syst@elcadmin.sup');
    console.log('--------------------------------------------\n');

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (err) {
    console.error('Error during database wipe:', err.message);
    process.exit(1);
  }
};

clearDb();
