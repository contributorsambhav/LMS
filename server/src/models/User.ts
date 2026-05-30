import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "SuperAdmin" | "InstituteAdmin" | "Faculty" | "Student";
  instituteId: Schema.Types.ObjectId | null;
  status: "Pending" | "Approved" | "Suspended";
  affiliationStatus: "Unaffiliated" | "Pending" | "Approved";
  phoneNumber?: string;
  address?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      required: true, 
      enum: ["SuperAdmin", "InstituteAdmin", "Faculty", "Student"] 
    },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", default: null },
    status: { 
      type: String, 
      enum: ["Pending", "Approved", "Suspended"], 
      default: "Pending" 
    },
    affiliationStatus: { 
      type: String, 
      enum: ["Unaffiliated", "Pending", "Approved"], 
      default: "Unaffiliated" 
    },
    phoneNumber: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
