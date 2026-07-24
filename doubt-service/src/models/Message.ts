import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  senderId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "Doubt", required: true },
    senderId: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true }
    },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
