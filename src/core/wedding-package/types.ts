/**
 * Project 102 — Wedding Project Package types.
 */

import type { WeddingPackageStatus } from "@/core/wedding-package/constants";

export type WeddingProjectPackageItem = {
  id: string;
  package_id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  position: number;
  title: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  unit_of_measure: string | null;
  category: string | null;
  vendor_id: string | null;
  is_included: boolean;
  created_at: string;
  updated_at: string;
};

export type WeddingProjectPackage = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  source_finance_package_id: string | null;
  name: string;
  description: string | null;
  currency: string;
  status: WeddingPackageStatus;
  sequence: number;
  notes: string | null;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type WeddingProjectPackageWithItems = WeddingProjectPackage & {
  items: WeddingProjectPackageItem[];
};

export type WeddingPackageSummary = {
  packageCount: number;
  itemCount: number;
  totalValue: number;
  confirmedValue: number;
  currency: string;
};
