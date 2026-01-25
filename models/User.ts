import mongoose, { Schema, Document } from "mongoose";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface IUser extends Document {
  email: string;
  password_hash?: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  email_verified_at?: Date;
  provider?: string;
  provider_id?: string;
  settings: {
    timezone?: string;
    notifications_enabled?: boolean;
    daily_send_limit?: number;
  };
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String },
    name: { type: String, required: true },
    avatar_url: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    email_verified: { type: Boolean, default: false },
    email_verified_at: { type: Date },
    provider: { type: String },
    provider_id: { type: String },
    settings: {
      timezone: { type: String, default: "UTC" },
      notifications_enabled: { type: Boolean, default: true },
      daily_send_limit: { type: Number, default: 100 },
    },
    last_login_at: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserSchema.index({ provider: 1, provider_id: 1 });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
