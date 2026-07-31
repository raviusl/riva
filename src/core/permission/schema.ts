import { z } from "zod";

import { PLATFORM_PERMISSIONS } from "@/core/permission/permissions";

export const platformPermissionSchema = z.enum(PLATFORM_PERMISSIONS);

export const permissionKeySchema = platformPermissionSchema;

export type PlatformPermissionInput = z.infer<typeof platformPermissionSchema>;

export const permissionGrantSchema = z.object({
  subjectId: z.string().min(1),
  permissions: z.array(platformPermissionSchema),
});

export type PermissionGrantInput = z.infer<typeof permissionGrantSchema>;

export const hasPermissionInputSchema = z.object({
  permissions: z.array(z.string()),
  required: platformPermissionSchema,
});

export type HasPermissionInput = z.infer<typeof hasPermissionInputSchema>;

export const hasAnyPermissionInputSchema = z.object({
  permissions: z.array(z.string()),
  required: z.array(platformPermissionSchema).min(1),
});

export type HasAnyPermissionInput = z.infer<typeof hasAnyPermissionInputSchema>;

export const hasAllPermissionsInputSchema = z.object({
  permissions: z.array(z.string()),
  required: z.array(platformPermissionSchema).min(1),
});

export type HasAllPermissionsInput = z.infer<
  typeof hasAllPermissionsInputSchema
>;
