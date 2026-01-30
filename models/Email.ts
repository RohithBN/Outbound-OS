import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmail extends Document {
  goal_id: Types.ObjectId;
  prospect_id: Types.ObjectId;
  to: string;
  subject: string;
  body?: string;
  direction: "outbound" | "inbound";
  status: "sent" | "failed" | "received";
  created_at: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    goal_id: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
      index: true,
    },
    prospect_id: {
      type: Schema.Types.ObjectId,
      ref: "Prospect",
      required: true,
      index: true,
    },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String },
    direction: {
      type: String,
      enum: ["outbound", "inbound"],
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "received"],
      default: "sent",
    },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Email =
  mongoose.models.Email || mongoose.model<IEmail>("Email", EmailSchema);

export default Email;
