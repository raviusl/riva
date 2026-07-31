import type {
  CreateStorageObjectInput,
  DeleteStorageObjectInput,
  ListStorageObjectsQuery,
} from "@/core/storage/schema";
import type { StorageObject, StorageObjectId } from "@/core/storage/types";

/**
 * Storage persistence contract — implementation deferred.
 * No database / migrations / Supabase Storage in Project 045.
 */
export interface StorageRepository {
  findById(storageObjectId: StorageObjectId): Promise<StorageObject | null>;
  list(query: ListStorageObjectsQuery): Promise<StorageObject[]>;
  insert(input: CreateStorageObjectInput): Promise<StorageObject>;
  delete(input: DeleteStorageObjectInput): Promise<void>;
}
