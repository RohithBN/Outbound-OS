import mongoose, { Schema, Document, Types } from "mongoose";
import { MessageType, Channel, MessageStatus } from "./enums";

export interface IMessage extends Document {
  goal_id: Types.ObjectId;
  prospect_id: Types.ObjectId;
  sequence_step: number;
  message_type: MessageType;
  channel: Channel;
  subject_line: string;
  body: string;
  personalization_hooks: Array<string>;
  generation_context: Record<string, unknown>;
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  replied_at?: Date;
  status: MessageStatus;
  external_message_id?: string;
  created_at: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    goal_id: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    prospect_id: { type: Schema.Types.ObjectId, ref: "Prospect", required: true },
    sequence_step: { type: Number, required: true },
    message_type: {
      type: String,
      enum: Object.values(MessageType),
      required: true,
    },
    channel: {
      type: String,
      enum: Object.values(Channel),
      default: Channel.EMAIL,
    },
    subject_line: { type: String, required: true },
    body: { type: String, required: true },
    personalization_hooks: [{ type: String }],
    generation_context: { type: Schema.Types.Mixed, default: {} },
    sent_at: { type: Date, index: true },
    delivered_at: { type: Date },
    opened_at: { type: Date },
    replied_at: { type: Date },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.DRAFT,
      index: true,
    },
    external_message_id: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

MessageSchema.index({ goal_id: 1, prospect_id: 1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
