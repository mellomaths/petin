export type Report = {
  id?: string;
  createdByAccountId?: string;
  againstAccountId: string;
  petId: string;
  reason: string;
  explanation: string; // 560 characters
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export enum Reason {
  FAKE_ACCOUNT = "FAKE_ACCOUNT",
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  INAPPROPRIATE_PICTURE = "INAPPROPRIATE_PICTURE",
  WILD_ANIMAL = "WILD_ANIMAL",
  SPAM = "SPAM",
  OTHER = "OTHER",
}

export enum ReportStatus {
  PENDING = "PENDING", // Pending for analysis
  BEING_ANALYZED = "BEING_ANALYZED", // Being analyzed by the team
  REJECTED = "REJECTED", // Nothing happens
  ACCEPTED = "ACCEPTED", // A case is opened and the user is notified, the account can be suspended
}
