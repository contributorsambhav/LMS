import { Schema, model, Document } from "mongoose";

export interface IAnswer {
  questionId: Schema.Types.ObjectId;
  answerText?: string;
  selectedOptions?: string[];
  marksAwarded?: number;
}

export interface IQuizAttempt extends Document {
  userId: Schema.Types.ObjectId;
  quizId: Schema.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  graded: boolean;
  gradedBy?: Schema.Types.ObjectId;
  feedback?: string;
  status: "in_progress" | "submitted";
  startedAt: Date;
  submittedAt?: Date;
  attemptNumber: number;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  answerText: { type: String, default: "" },
  selectedOptions: [{ type: String }],
  marksAwarded: { type: Number }
});

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    answers: [AnswerSchema],
    score: { type: Number, default: 0 },
    graded: { type: Boolean, default: false },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
    feedback: { type: String },
    status: { type: String, enum: ["in_progress", "submitted"], default: "in_progress" },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    attemptNumber: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const QuizAttempt = model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);
