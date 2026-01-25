export enum ObjectiveType {
  HIRING = "hiring",
  SALES = "sales",
  PARTNERSHIP = "partnership",
}

export enum GoalStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum ProspectStatus {
  DISCOVERED = "discovered",
  CONTACTED = "contacted",
  RESPONDED = "responded",
  QUALIFIED = "qualified",
  CONVERTED = "converted",
  DISQUALIFIED = "disqualified",
}

export enum MessageType {
  INITIAL = "initial",
  FOLLOW_UP = "follow_up",
  REPLY = "reply",
  VALUE_ADD = "value_add",
}

export enum Channel {
  EMAIL = "email",
  LINKEDIN = "linkedin",
  SMS = "sms",
}

export enum MessageStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  REPLIED = "replied",
  BOUNCED = "bounced",
  FAILED = "failed",
}

export enum Intent {
  INTERESTED = "interested",
  NOT_NOW = "not_now",
  NOT_INTERESTED = "not_interested",
  QUESTION = "question",
  OBJECTION = "objection",
  OUT_OF_OFFICE = "out_of_office",
}

export enum Sentiment {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
}

export enum CampaignStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
}
