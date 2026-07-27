require('dotenv').config();
const mongoose = require('mongoose');
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_db';

const updatePlans = async () => {
  try {
    await mongoose.connect(dbURI);
    const PlanSchema = new mongoose.Schema({
      planCode: String,
      name: String,
      price: String,
      maxStorageGB: Number,
      maxStudents: Number,
      apiLimit: String,
      details: String,
    });
    const Plan = mongoose.model('Plan', PlanSchema);
    
    await Plan.updateOne({ planCode: 'Basic' }, { price: '₹5000/mo', maxStorageGB: 300, maxStudents: 100 });
    await Plan.updateOne({ planCode: 'Premium' }, { price: '₹9999/mo', maxStorageGB: 1000, maxStudents: 500 });
    await Plan.updateOne({ planCode: 'Enterprise' }, { price: '₹24999/mo', maxStorageGB: 5000, maxStudents: 2000 });
    await Plan.updateOne({ planCode: 'Custom' }, { maxStorageGB: 10000, maxStudents: 10000 });
    
    console.log('Plans updated successfully!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
};

updatePlans();
