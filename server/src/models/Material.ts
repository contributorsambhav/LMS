import { Schema, model, Document } from "mongoose";

export interface IMaterial extends Document {
  courseId: Schema.Types.ObjectId;
  sessionId?: Schema.Types.ObjectId;
  title: string;
  originalName: string;
  filePath: string;
  uploadedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    title: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Material = model<IMaterial>("Material", MaterialSchema);
