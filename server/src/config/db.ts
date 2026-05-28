import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is missing in server/.env!');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // Conditionally seed Super Admin only when explicitly enabled via env
    // Set AUTO_SEED_SUPERADMIN=true and provide SUPER_SEED_EMAIL and SUPER_SEED_PASSWORD
    if (process.env.AUTO_SEED_SUPERADMIN === 'true') {
      await seedSuperAdmin();
    } else {
      console.log('AUTO_SEED_SUPERADMIN not enabled; skipping Super Admin seeding.');
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedSuperAdmin = async () => {
  try {
    const superAdminExists = await User.findOne({ role: 'SuperAdmin' });

    if (!superAdminExists) {
      console.log('No SuperAdmin user found.');

      // Require explicit seed credentials for security
      const seedEmail = process.env.SUPER_SEED_EMAIL;
      const seedPassword = process.env.SUPER_SEED_PASSWORD;

      if (!seedEmail || !seedPassword) {
        console.log('SUPER_SEED_EMAIL or SUPER_SEED_PASSWORD not set. Skipping Super Admin seed.');
        return;
      }

      const hashedPassword = await bcrypt.hash(seedPassword, 12);

      const superAdmin = new User({
        name: process.env.SUPER_SEED_NAME || 'Super Admin',
        email: seedEmail,
        password: hashedPassword,
        role: 'SuperAdmin',
        status: 'Approved',
        instituteId: null
      });

      await superAdmin.save();
      console.log('Super Admin seeded successfully.');
      console.log(`Email: ${seedEmail}`);
      console.log('Note: super admin password is not logged for security reasons.');
    } else {
      console.log('SuperAdmin account exists. Skipping seeding.');
    }
  } catch (error) {
    console.error('Failed to seed Super Admin:', error);
  }
};
