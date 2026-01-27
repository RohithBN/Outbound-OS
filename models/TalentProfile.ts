import mongoose, { Schema, Document } from "mongoose";

export enum TalentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  HIRED = "hired",
}

export interface ITalentProfile extends Document {
  email: string;
  name: string;
  role: string;
  location: string;
  experience_years: number;
  skills: string[];
  bio: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  current_company?: string;
  expected_salary_min?: number;
  expected_salary_max?: number;
  work_authorization: string;
  remote_preference: "remote" | "hybrid" | "onsite" | "flexible";
  availability: "immediately" | "2_weeks" | "1_month" | "3_months";
  preferred_company_size?: string[];
  preferred_industries?: string[];
  open_to_relocation: boolean;
  status: TalentStatus;
  profile_completeness: number;
  matched_count: number;
  contacted_count: number;
  interview_count: number;
  created_at: Date;
  updated_at: Date;
}

const TalentProfileSchema = new Schema<ITalentProfile>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true 
    },
    name: { type: String, required: true },
    role: { type: String, required: true, index: true },
    location: { type: String, required: true },
    experience_years: { type: Number, required: true, min: 0 },
    skills: [{ type: String, required: true }],
    bio: { type: String, required: true, maxlength: 500 },
    linkedin_url: { type: String },
    github_url: { type: String },
    portfolio_url: { type: String },
    resume_url: { type: String },
    current_company: { type: String },
    expected_salary_min: { type: Number },
    expected_salary_max: { type: Number },
    work_authorization: { 
      type: String, 
      required: true,
      enum: ["US Citizen", "Green Card", "H1B", "OPT", "Other"]
    },
    remote_preference: {
      type: String,
      required: true,
      enum: ["remote", "hybrid", "onsite", "flexible"],
      index: true
    },
    availability: {
      type: String,
      required: true,
      enum: ["immediately", "2_weeks", "1_month", "3_months"]
    },
    preferred_company_size: [{ type: String }],
    preferred_industries: [{ type: String }],
    open_to_relocation: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(TalentStatus),
      default: TalentStatus.ACTIVE,
      index: true
    },
    profile_completeness: { type: Number, default: 0, min: 0, max: 100 },
    matched_count: { type: Number, default: 0 },
    contacted_count: { type: Number, default: 0 },
    interview_count: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Calculate profile completeness on save
TalentProfileSchema.pre('save', function(next) {
  let completeness = 0;
  const fields = [
    'email', 'name', 'role', 'location', 'experience_years', 
    'skills', 'bio', 'work_authorization', 'remote_preference', 'availability'
  ];
  const optionalFields = [
    'linkedin_url', 'github_url', 'portfolio_url', 'current_company',
    'expected_salary_min', 'expected_salary_max'
  ];
  
  fields.forEach(field => {
    if (this[field as keyof ITalentProfile]) completeness += 7;
  });
  
  optionalFields.forEach(field => {
    if (this[field as keyof ITalentProfile]) completeness += 5;
  });
  
  this.profile_completeness = Math.min(100, completeness);
});

TalentProfileSchema.index({ skills: 1, location: 1, status: 1 });
TalentProfileSchema.index({ role: 1, status: 1 });

const TalentProfile = mongoose.models.TalentProfile || 
  mongoose.model<ITalentProfile>("TalentProfile", TalentProfileSchema);

export default TalentProfile;
