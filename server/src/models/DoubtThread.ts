import { Schema, model, Document } from "mongoose";

export interface IDoubtThread extends Document {
  courseId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;
  facultyId?: Schema.Types.ObjectId;
  status: "open" | "resolved";
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoubtThreadSchema = new Schema<IDoubtThread>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    subject: { type: String, required: true },
  },
  { timestamps: true }
);

export const DoubtThread = model<IDoubtThread>("DoubtThread", DoubtThreadSchema);
