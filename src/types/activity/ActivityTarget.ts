export enum ActivityTargetType {
  Workspace = "workspace",
  Company = "company",
  Project = "project",
  Client = "client",
  Vendor = "vendor",
  Task = "task",
  Timeline = "timeline",
  Meeting = "meeting",
  Document = "document",
  File = "file",
  Invoice = "invoice",
  Quotation = "quotation",
  User = "user",
}

export const ACTIVITY_TARGET_TYPES: readonly ActivityTargetType[] = [
  ActivityTargetType.Workspace,
  ActivityTargetType.Company,
  ActivityTargetType.Project,
  ActivityTargetType.Client,
  ActivityTargetType.Vendor,
  ActivityTargetType.Task,
  ActivityTargetType.Timeline,
  ActivityTargetType.Meeting,
  ActivityTargetType.Document,
  ActivityTargetType.File,
  ActivityTargetType.Invoice,
  ActivityTargetType.Quotation,
  ActivityTargetType.User,
];

/**
 * Polymorphic target of an Activity.
 */
export interface ActivityTarget {
  id: string;
  type: ActivityTargetType;
}
