/**
 * RIVA core types — Sprint 012 Workspace Foundation
 */

export const WORKSPACE_STATUSES = [
  "pending",
  "active",
  "suspended",
  "archived",
] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export const COMPANY_STATUSES = ["active", "suspended", "archived"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_TYPES = [
  "agency",
  "brand",
  "venue",
  "corporate",
  "wedding",
  "other",
] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const MEMBERSHIP_STATUSES = [
  "pending",
  "accepted",
  "suspended",
  "removed",
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/** @deprecated Prefer MembershipStatus */
export const PERSON_STATUSES = MEMBERSHIP_STATUSES;
export type PersonStatus = MembershipStatus;

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "completed",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = [
  "wedding",
  "corporate",
  "birthday",
  "concert",
  "exhibition",
  "other",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Sprint 015 client types (Product Blueprint). */
export const CLIENT_TYPES = [
  "bride",
  "groom",
  "corporate",
  "individual",
] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const CLIENT_STATUSES = ["active", "follow_up", "archived"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

/** Sprint 016 vendor categories. */
export const VENDOR_CATEGORIES = [
  "photographer",
  "videographer",
  "decorator",
  "makeup_artist",
  "live_band",
  "emcee",
  "venue",
  "catering",
  "florist",
  "others",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_STATUSES = ["active", "inactive", "archived"] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

/** Sprint 012 workspace membership roles (Product Blueprint). */
export const MEMBERSHIP_ROLES = [
  "founder",
  "admin",
  "planner",
  "coordinator",
  "sales",
  "viewer",
] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

/** Full role catalog including legacy keys for RBAC compatibility. */
export const CORE_ROLES = [
  "founder",
  "admin",
  "planner",
  "coordinator",
  "sales",
  "viewer",
  "owner",
  "member",
  "guest",
  "finance",
  "vendor",
  "client",
] as const;
export type CoreRole = (typeof CORE_ROLES)[number];

export const CORE_PERMISSIONS = [
  "workspace.read",
  "workspace.write",
  "company.read",
  "company.write",
  "people.read",
  "people.write",
  "people.invite",
  "people.assign_role",
  "project.read",
  "project.write",
  "client.read",
  "client.write",
  "vendor.read",
  "vendor.write",
  "permission.manage",
] as const;
export type CorePermission = (typeof CORE_PERMISSIONS)[number];

export const INVITATION_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "revoked",
  "rejected",
] as const;
export type CoreInvitationStatus = (typeof INVITATION_STATUSES)[number];

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  timezone: string;
  locale: string;
  currency: string;
  country: string | null;
  logo_url: string | null;
  custom_domain: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  type: CompanyType | null;
  logo_url: string | null;
  country: string | null;
  timezone: string | null;
  locale: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
};

/** Canonical membership: User ↔ Workspace ↔ Company ↔ Role */
export type Membership = {
  id: string;
  user_id: string | null;
  workspace_id: string;
  company_id: string;
  role_key: MembershipRole | CoreRole | string;
  email: string;
  full_name: string;
  status: MembershipStatus;
  person_id: string | null;
  created_at: string;
  updated_at: string;
};

/** Person row (legacy invite path; linked via membership.person_id). */
export type Person = {
  id: string;
  workspace_id: string;
  company_id: string | null;
  user_id: string | null;
  email: string;
  full_name: string;
  status: MembershipStatus;
  created_at: string;
  updated_at: string;
};

export type PersonRole = {
  id: string;
  person_id: string;
  role_key: CoreRole | string;
  created_at: string;
};

export type WorkspaceMember = Person & {
  roles: string[];
};

export type Project = {
  id: string;
  workspace_id: string;
  company_id: string;
  name: string;
  description: string | null;
  project_type: ProjectType | null;
  status: ProjectStatus;
  owner_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

/** Core CRM client (table: crm_clients). Linked to Company + optional Project. */
export type Client = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string | null;
  owner_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  client_type: ClientType | null;
  status: ClientStatus;
  follow_up_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Vendor (Company + optional Project). */
export type Vendor = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string | null;
  owner_id: string | null;
  name: string;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  category: VendorCategory | null;
  status: VendorStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export {
  MEETING_STATUSES,
  MEETING_TYPES,
  type MeetingStatus,
  type MeetingType,
} from "@/core/meeting/constants";

export type {
  Meeting,
  MeetingParticipant,
} from "@/core/meeting/types";

export type CoreInvitation = {
  id: string;
  workspace_id: string;
  company_id: string | null;
  email: string;
  full_name: string;
  role_key: CoreRole | string;
  token_hash: string;
  status: CoreInvitationStatus;
  invited_by_user_id: string | null;
  invited_person_id: string | null;
  expires_at: string;
  accepted_at: string | null;
  accepted_user_id: string | null;
  rejected_at: string | null;
  rejected_by_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceContext = {
  workspaceId: string;
  companyId: string;
  membershipId: string;
  personId?: string | null;
  userId: string;
  roleKey: string;
};

export type SessionContext = {
  userId: string;
  workspace: Workspace;
  company: Company;
  membership: Membership;
  permissions: Set<string>;
};
