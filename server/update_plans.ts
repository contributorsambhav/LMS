import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const planSchema = new mongoose.Schema({
  planCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  apiLimit: { type: String, required: true },
  details: { type: String, required: true }
});

const Plan = mongoose.model("Plan", planSchema);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB");
  
  await Plan.updateOne({ planCode: 'Basic' }, { $set: { price: '₹299/mo' } });
  await Plan.updateOne({ planCode: 'Premium' }, { $set: { price: '₹599/mo' } });
  await Plan.updateOne({ planCode: 'Enterprise' }, { $set: { price: '₹1,450/mo' } });
  
  console.log("Plans updated");
  process.exit(0);
};

run();
