import { Schema, model, Document } from "mongoose";

export interface IQuestion {
  _id?: any;
  questionText: string;
  type: "MCQ" | "MultipleMCQ" | "Subjective";
  options?: string[];
  correctAnswer?: string; // For single MCQ or Subjective key
  correctAnswers?: string[]; // For MultipleMCQ
  points: number;
  negativePoints?: number; // Negative marking deduction
  attachmentUrl?: string; // Optional image/document link
}

export interface IQuiz extends Document {
  courseId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  testType: "Autograded" | "Handgraded";
  timeLimit?: number; // In minutes, optional
  deadline?: Date; // Deadline date for submission
  questions: IQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  hideAnswersUntilDeadline?: boolean;
  maxAttempts?: number;
  scoringPolicy?: "best" | "latest" | "average";
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  type: { type: String, enum: ["MCQ", "MultipleMCQ", "Subjective"], default: "MCQ", required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  correctAnswers: [{ type: String }],
  points: { type: Number, default: 1 },
  negativePoints: { type: Number, default: 0 },
  attachmentUrl: { type: String }
});

const QuizSchema = new Schema<IQuiz>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    testType: { type: String, enum: ["Autograded", "Handgraded"], default: "Autograded" },
    timeLimit: { type: Number, default: 0 }, // 0 or undefined means no limit
    deadline: { type: Date },
    questions: [QuestionSchema],
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    hideAnswersUntilDeadline: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: 1 },
    scoringPolicy: { type: String, enum: ["best", "latest", "average"], default: "latest" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>("Quiz", QuizSchema);

