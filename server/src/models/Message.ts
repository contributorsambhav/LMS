import { Schema, model, Document } from "mongoose";

export interface IMessage extends Document {
  threadId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  text: string;
  readBy: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "DoubtThread", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Message = model<IMessage>("Message", MessageSchema);
