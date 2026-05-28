import { Schema, model, Document } from "mongoose";

export interface IInstitute extends Document {
  name: string;
  legalName: string;
  brandName: string;
  phoneNumber: string;
  address: string;
  email: string;
  adminId: Schema.Types.ObjectId;
  status: "Pending" | "Active" | "Suspended";
  billingPlan: "Basic" | "Premium" | "Enterprise" | "Custom";
  createdAt: Date;
}

const InstituteSchema = new Schema<IInstitute>(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, required: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Pending", "Active", "Suspended"],
      default: "Pending"
    },
    billingPlan: {
      type: String,
      enum: ["Basic", "Premium", "Enterprise", "Custom"],
      default: "Basic"
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Institute = model<IInstitute>("Institute", InstituteSchema);
