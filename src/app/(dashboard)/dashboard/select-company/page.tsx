import { redirect } from "next/navigation";

import { requireSessionUserId } from "@/core/auth/session";
import { OS_BUSINESS_PATH } from "@/lib/os/entry-paths";

/** Legacy route — redirected into OS Business Picker (Project 056). */
export default async function SelectCompanyPage() {
  await requireSessionUserId();
  redirect(OS_BUSINESS_PATH);
}
