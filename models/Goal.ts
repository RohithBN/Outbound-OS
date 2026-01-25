import mongoose, { Schema, Document } from "mongoose";
import { ObjectiveType, GoalStatus } from "./enums";

export interface IGoal extends Document {
  user_id: string;
  raw_input: string;
  objective_type: ObjectiveType;
  criteria: Record<string, unknown>;
  target_count: number;
  current_count: number;
  success_metric: string;
  deadline: Date;
  status: GoalStatus;
  created_at?: Date;
  updated_at?: Date;
  salary_range?:string
}

const GoalSchema = new Schema<IGoal>(
  {
    user_id: { type: String, required: true, index: true },
    raw_input: { type: String, required: true },
    objective_type: {
      type: String,
      enum: Object.values(ObjectiveType),
      required: true,
    },
    criteria: { type: Schema.Types.Mixed, default: {} },
    target_count: { type: Number, required: true },
    current_count: { type: Number, default: 0 },
    success_metric: { type: String, required: true },
    deadline: { type: Date, required: true },
    salary_range:{type:String},
    status: {
      type: String,
      enum: Object.values(GoalStatus),
      default: GoalStatus.DRAFT,
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

GoalSchema.index({ created_at: 1 });

const Goal = mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);
export default Goal;
