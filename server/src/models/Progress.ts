import { Schema, model, Document } from "mongoose";

export interface IProgress extends Document {
  userId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  lessonId: Schema.Types.ObjectId;
  completed: boolean;
  lastWatchedTimestamp: number; // in seconds
  watchPercentage: number; // 0 to 100
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    completed: { type: Boolean, default: false },
    lastWatchedTimestamp: { type: Number, default: 0 },
    watchPercentage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Unique compound index on userId + lessonId
ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const Progress = model<IProgress>("Progress", ProgressSchema);
