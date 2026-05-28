import { Document, Schema, model } from "mongoose";

export interface IVerification extends Document {
  instituteId: Schema.Types.ObjectId;
  adminId: Schema.Types.ObjectId;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: Schema.Types.ObjectId | null;
  approvedAt?: Date | null;
  createdAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Verification = model<IVerification>("Verification", VerificationSchema);
