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
  billingPlan: string;
  zoomAccountId?: string;
  zoomClientId?: string;
  zoomClientSecret?: string;
  walletBalance: number;
  negativeDaysCount: number;
  overageDaysCount: number;
  storageUsage?: {
    videoBytes: number;
    documentBytes: number;
  };
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
      default: "Basic"
    },
    zoomAccountId: { type: String, trim: true },
    zoomClientId: { type: String, trim: true },
    zoomClientSecret: { type: String, trim: true },
    walletBalance: { type: Number, default: 0 },
    negativeDaysCount: { type: Number, default: 0 },
    overageDaysCount: { type: Number, default: 0 },
    storageUsage: {
      videoBytes: { type: Number, default: 0 },
      documentBytes: { type: Number, default: 0 },
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Institute = model<IInstitute>("Institute", InstituteSchema);
