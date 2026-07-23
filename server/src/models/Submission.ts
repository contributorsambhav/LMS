import { Schema, model, Document } from "mongoose";

export interface ISubmission extends Document {
  studentId: Schema.Types.ObjectId;
  assignmentId: Schema.Types.ObjectId;
  filePath: string;
  fileName: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedBy?: Schema.Types.ObjectId;
  graded: boolean;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number },
    feedback: { type: String },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
    graded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Submission = model<ISubmission>("Submission", SubmissionSchema);
