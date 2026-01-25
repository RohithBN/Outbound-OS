import mongoose, { Schema, Document, Types } from "mongoose";
import { CampaignStatus } from "./enums";

export interface ISequenceStep {
  step: number;
  type: string;
  delay_days: number;
}

export interface ICampaign extends Document {
  goal_id: Types.ObjectId;
  name: string;
  sequence_config: ISequenceStep[];
  template_style: string;
  tone: string;
  total_prospects: number;
  messages_sent: number;
  messages_delivered: number;
  messages_opened: number;
  responses_received: number;
  positive_responses: number;
  conversions: number;
  started_at: Date;
  ended_at?: Date;
  status: CampaignStatus;
}

const SequenceStepSchema = new Schema<ISequenceStep>(
  {
    step: { type: Number, required: true },
    type: { type: String, required: true },
    delay_days: { type: Number, required: true },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaign>({
  goal_id: { type: Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
  name: { type: String, required: true },
  sequence_config: [SequenceStepSchema],
  template_style: { type: String, required: true },
  tone: { type: String, required: true },
  total_prospects: { type: Number, default: 0 },
  messages_sent: { type: Number, default: 0 },
  messages_delivered: { type: Number, default: 0 },
  messages_opened: { type: Number, default: 0 },
  responses_received: { type: Number, default: 0 },
  positive_responses: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  started_at: { type: Date, default: Date.now },
  ended_at: { type: Date },
  status: {
    type: String,
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.ACTIVE,
    index: true,
  },
});

const Campaign = mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);
export default Campaign;
