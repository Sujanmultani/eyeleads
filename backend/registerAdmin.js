import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import dns from 'dns';

// Override local network DNS resolvers with public Google/Cloudflare DNS to bypass local SRV lookup failures
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const registerAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const email = 'syst@elcadmin.sup';
    const password = 'ELC/gap93572tap{close&@pp$€\\<my@£#^_\\at;w074';

    // Check if admin already exists
    let admin = await User.findOne({ email: email });

    if (admin) {
      console.log('Admin user already exists. Updating password and role to admin...');
      admin.password = password; // pre-save hook will hash it automatically
      admin.role = 'admin';
      admin.isAdmin = true;
      await admin.save();
      console.log('Admin password/role successfully updated!');
    } else {
      console.log('Admin user does not exist. Creating new Admin user...');
      admin = await User.create({
        name: 'Super Admin',
        email: email,
        password: password,
        role: 'admin',
        isAdmin: true
      });
      console.log('Admin user successfully created!');
    }

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (err) {
    console.error('Error during admin registration:', err.message);
    process.exit(1);
  }
};

registerAdmin();
