import { Schema, model, Document } from "mongoose";

export interface IAssignment extends Document {
  courseId: Schema.Types.ObjectId;
  title: string;
  description: string;
  deadline: Date;
  totalMarks: number;
  attachmentUrl?: string; // Optional PDF or Image for assignment instructions
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    attachmentUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>("Assignment", AssignmentSchema);
