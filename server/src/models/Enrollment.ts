import { Schema, model, Document } from "mongoose";

export interface IEnrollment extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  role: "Faculty" | "Student";
  status: "Pending" | "Approved" | "Rejected";
  joinedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    role: { type: String, required: true, enum: ["Faculty", "Student"] },
    status: { type: String, required: true, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    joinedAt: { type: Date, default: Date.now }
  }
);

// Unique compound index so a user cannot enroll in the same course multiple times
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", EnrollmentSchema);
