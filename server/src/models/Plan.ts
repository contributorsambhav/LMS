import { Schema, model, Document } from "mongoose";

export interface IPlan extends Document {
  planCode: string; // e.g. 'Basic', 'Premium', 'Enterprise', 'Custom'
  name: string; // e.g. 'Basic Plan'
  price: string; // e.g. '$299/mo'
  apiLimit: string; // e.g. '50k req/mo'
  details: string; // e.g. 'Best for individual training hubs'
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    planCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    apiLimit: { type: String, required: true },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

export const Plan = model<IPlan>("Plan", PlanSchema);
