import { Schema, model, Document } from "mongoose";

export interface ICourse extends Document {
  name: string;
  description: string;
  instituteId: Schema.Types.ObjectId;
  facultyCode: string;
  studentCode: string;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true },
    facultyCode: { type: String, required: true, unique: true },
    studentCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export const Course = model<ICourse>("Course", CourseSchema);
