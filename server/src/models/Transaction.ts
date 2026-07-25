import { Schema, model, Document } from "mongoose";

export interface ITransaction extends Document {
  instituteId: Schema.Types.ObjectId;
  amount: number;
  type: "Recharge" | "Daily Deduction" | "Penalty";
  description: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    instituteId: { type: Schema.Types.ObjectId, ref: "Institute", required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Recharge", "Daily Deduction", "Penalty"],
      required: true
    },
    description: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
