import mongoose, { Schema, Document, Types } from "mongoose";
import { ProspectStatus } from "./enums";

export interface IProspect extends Document {
  goal_id: Types.ObjectId;
  source: string;
  source_id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  location: string;
  linkedin_url?: string;
  github_url?: string;
  profile_data: Record<string, unknown>;
  ai_score: number;
  score_reasoning: string;
  signals: Array<string>;

  // Existing
  status: ProspectStatus;

  // 🆕 Outreach Lifecycle
  outreach_status: "not_sent" | "sent" | "replied";
  reply_category: "interested" | "not_now" | "not_interested" | null;

  // 🆕 Assignment Lifecycle
  assignment_status: "not_sent" | "sent" | "completed";
  assignment_score: number | null;

  // 🆕 Final Ranking
  final_score: number | null;

  discovered_at: Date;
  updated_at: Date;
}

const ProspectSchema = new Schema<IProspect>(
  {
    goal_id: { type: Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
    source: { type: String, required: true },
    source_id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    title: { type: String },
    company: { type: String },
    location: { type: String },
    linkedin_url: { type: String },
    github_url: { type: String },
    profile_data: { type: Schema.Types.Mixed, default: {} },
    ai_score: { type: Number, min: 0, max: 10, index: true },
    score_reasoning: { type: String },
    signals: [{ type: String }],

    status: {
      type: String,
      enum: Object.values(ProspectStatus),
      default: ProspectStatus.DISCOVERED,
      index: true,
    },

    // 🆕 Outreach tracking
    outreach_status: {
      type: String,
      enum: ["not_sent", "sent", "replied"],
      default: "not_sent",
      index: true,
    },

    reply_category: {
      type: String,
      enum: ["interested", "not_now", "not_interested"],
      default: null,
      index: true,
    },

    // 🆕 Assignment tracking
    assignment_status: {
      type: String,
      enum: ["not_sent", "sent", "completed"],
      default: "not_sent",
      index: true,
    },

    assignment_score: { type: Number, default: null },

    // 🆕 Final ranking
    final_score: { type: Number, default: null, index: true },

    discovered_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updated_at" },
  }
);

ProspectSchema.index({ goal_id: 1, email: 1 }, { unique: true });

const Prospect =
  mongoose.models.Prospect || mongoose.model<IProspect>("Prospect", ProspectSchema);

export default Prospect;
