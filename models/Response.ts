import mongoose, { Schema, Document, Types } from "mongoose";
import { Intent, Sentiment } from "./enums";

export interface IResponse extends Document {
  message_id: Types.ObjectId;
  prospect_id: Types.ObjectId;
  goal_id: Types.ObjectId;
  raw_content: string;
  intent: Intent;
  sentiment: Sentiment;
  ai_analysis: {
    key_points?: string[];
    questions_asked?: string[];
    objections?: string[];
    next_best_action?: string;
  };
  confidence_score: number;
  suggested_reply: string;
  reply_approved: boolean;
  replied_to_at?: Date;
  received_at: Date;
  processed_at?: Date;
}

const ResponseSchema = new Schema<IResponse>({
  message_id: { type: Schema.Types.ObjectId, ref: "Message", required: true },
  prospect_id: { type: Schema.Types.ObjectId, ref: "Prospect", required: true },
  goal_id: { type: Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
  raw_content: { type: String, required: true },
  intent: {
    type: String,
    enum: Object.values(Intent),
    required: true,
    index: true,
  },
  sentiment: {
    type: String,
    enum: Object.values(Sentiment),
    required: true,
  },
  ai_analysis: {
    key_points: [{ type: String }],
    questions_asked: [{ type: String }],
    objections: [{ type: String }],
    next_best_action: { type: String },
  },
  confidence_score: { type: Number, min: 0, max: 1 },
  suggested_reply: { type: String },
  reply_approved: { type: Boolean, default: false },
  replied_to_at: { type: Date },
  received_at: { type: Date, required: true, index: true },
  processed_at: { type: Date },
});

const Response = mongoose.models.Response || mongoose.model<IResponse>("Response", ResponseSchema);
export default Response;
