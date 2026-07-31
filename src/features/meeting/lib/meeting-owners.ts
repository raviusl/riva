/**
 * Reuse membership owner options from Client CRM helpers.
 */

import type { ClientOwnerOption } from "@/features/client/components/create-client-form";
import {
  listClientOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/client/lib/client-owners";

export type MeetingOwnerOption = ClientOwnerOption;

export const listMeetingOwnerOptions = listClientOwnerOptions;
export { ownerLabelFromOptions };
