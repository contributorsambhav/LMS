import mongoose, { Schema, Document } from "mongoose";

export interface IDoubt extends Document {
  courseId: mongoose.Types.ObjectId;
  studentId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  facultyId?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  subject: string;
  status: "open" | "resolved";
  resolvedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoubtSchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, required: true },
    studentId: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true }
    },
    facultyId: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String },
      email: { type: String },
      role: { type: String }
    },
    assignedTo: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String },
      email: { type: String },
      role: { type: String }
    },
    subject: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    resolvedByName: { type: String }
  },
  { timestamps: true }
);

export const Doubt = mongoose.model<IDoubt>("Doubt", DoubtSchema);
