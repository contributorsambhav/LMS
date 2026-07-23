import { Schema, model, Document } from "mongoose";

export interface ILesson extends Document {
  courseId: Schema.Types.ObjectId;
  title: string;
  description: string;
  videoUrl?: string;
  duration?: number; // duration in seconds/minutes
  orderNo: number;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    orderNo: { type: Number, required: true, default: 1 }
  },
  { timestamps: true }
);

// Add unique compound index for courseId and orderNo to prevent duplicate orders
LessonSchema.index({ courseId: 1, orderNo: 1 });

export const Lesson = model<ILesson>("Lesson", LessonSchema);
