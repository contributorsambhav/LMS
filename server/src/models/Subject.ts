import { Schema, model, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  courseId: Schema.Types.ObjectId;
  instituteId: Schema.Types.ObjectId;
  assignedFacultyId: Schema.Types.ObjectId | null;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true },
    assignedFacultyId: { type: Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

export const Subject = model<ISubject>("Subject", SubjectSchema);
