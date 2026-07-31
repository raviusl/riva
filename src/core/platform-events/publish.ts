/**
 * Publish helper — single constructor for PlatformEvent records.
 */

import { assertRecordCompany } from "@/core/company-isolation/guards";
import { platformEventIdFromSeed } from "@/core/platform-events/id";
import type {
  PlatformEvent,
  PublishPlatformEventInput,
} from "@/core/platform-events/types";

/**
 * Build one platform event with standardized id / context fields.
 * Enforces companyId presence via Company Isolation guard.
 */
export function publishPlatformEvent(
  input: PublishPlatformEventInput,
): PlatformEvent {
  assertRecordCompany({ companyId: input.companyId }, input.companyId);

  const id = platformEventIdFromSeed(
    [
      input.companyId,
      input.workspaceId,
      input.entity,
      input.entityId,
      input.name,
      input.salt ?? "",
      input.timestamp.slice(0, 19),
      ...input.channels,
    ].join("|"),
  );

  return {
    id,
    name: input.name,
    entity: input.entity,
    entityId: input.entityId,
    title: input.title,
    description: input.description,
    timestamp: input.timestamp,
    companyId: input.companyId,
    workspaceId: input.workspaceId,
    actorId: input.actorId ?? null,
    actorLabel: input.actorLabel ?? null,
    href: input.href ?? null,
    metadata: input.metadata ?? {},
    channels: input.channels,
  };
}
