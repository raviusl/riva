/**
 * Reuse membership owner options from Client CRM helpers.
 */

import type { ClientOwnerOption } from "@/features/client/components/create-client-form";
import {
  listClientOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/client/lib/client-owners";

export type TaskOwnerOption = ClientOwnerOption;

export const listTaskOwnerOptions = listClientOwnerOptions;
export { ownerLabelFromOptions };
