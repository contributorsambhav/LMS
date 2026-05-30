import { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  courseId: Schema.Types.ObjectId;
  facultyId?: Schema.Types.ObjectId | null;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  liveLink: string; // Zoom link (mandatory)
  recordedVideo?: string; // Recorded Video link (optional)
  attachments: string[]; // Uploaded pdf file paths
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    liveLink: { type: String, required: true, trim: true },
    recordedVideo: { type: String, trim: true },
    attachments: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Session = model<ISession>("Session", SessionSchema);
