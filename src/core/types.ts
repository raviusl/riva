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
  "inquiry",
  "proposal",
  "confirmed",
  "planning",
  "execution",
  "completed",
  "cancelled",
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

/** Project 097 client types (CRM foundation). */
export const CLIENT_TYPES = [
  "wedding",
  "corporate",
  "private",
  "others",
] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

/** Pipeline status — archive is terminal soft-delete. */
export const CLIENT_STATUSES = [
  "inquiry",
  "follow_up",
  "confirmed",
  "completed",
  "cancelled",
  "archived",
] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const CLIENT_SOURCES = [
  "facebook",
  "instagram",
  "tiktok",
  "xiaohongshu",
  "google",
  "referral",
  "walk_in",
  "existing_client",
  "others",
] as const;
export type ClientSource = (typeof CLIENT_SOURCES)[number];

export const WEDDING_SESSIONS = [
  "rom",
  "lunch",
  "dinner",
  "tea_ceremony",
  "others",
] as const;
export type WeddingSession = (typeof WEDDING_SESSIONS)[number];

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
  registration_no: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  swift_code: string | null;
  signature_url: string | null;
  default_payment_terms: string | null;
  default_terms_and_conditions: string | null;
  default_document_footer: string | null;
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
  client_id: string | null;
  name: string;
  project_code: string | null;
  description: string | null;
  project_type: ProjectType | null;
  status: ProjectStatus;
  owner_id: string | null;
  coordinator_id: string | null;
  sales_id: string | null;
  planner_id: string | null;
  start_date: string | null;
  end_date: string | null;
  wedding_date: string | null;
  event_date: string | null;
  venue: string | null;
  ballroom: string | null;
  session: string | null;
  package_name: string | null;
  expected_pax: number | null;
  client_budget: number | null;
  theme: string | null;
  dress_code: string | null;
  notes: string | null;
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
  lead_owner_id: string | null;
  assigned_pic_id: string | null;
  client_code: string | null;
  name: string;
  company_name: string | null;
  bride_name: string | null;
  groom_name: string | null;
  display_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  home_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  birthday: string | null;
  anniversary: string | null;
  client_type: ClientType | null;
  status: ClientStatus;
  is_active: boolean;
  source: ClientSource | null;
  follow_up_at: string | null;
  wedding_date: string | null;
  wedding_type: string | null;
  session: string | null;
  include_rom: boolean;
  include_lunch: boolean;
  include_dinner: boolean;
  venue: string | null;
  ballroom: string | null;
  expected_pax: number | null;
  theme: string | null;
  dress_code: string | null;
  religion: string | null;
  language: string | null;
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
