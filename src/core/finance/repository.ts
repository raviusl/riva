import type {
  CreateFinanceInput,
  DeleteFinanceInput,
  ListFinanceQuery,
  UpdateFinanceInput,
} from "@/core/finance/schema";
import type { Finance, FinanceId } from "@/core/finance/types";

/**
 * Finance persistence contract — implementation deferred.
 * No payments provider or repository implementation in Project 035.
 */
export interface FinanceRepository {
  findById(financeId: FinanceId): Promise<Finance | null>;
  list(query: ListFinanceQuery): Promise<Finance[]>;
  listByWorkspace(
    companyId: string,
    workspaceId: string,
  ): Promise<Finance[]>;
  listByProject(
    companyId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<Finance[]>;
  create(input: CreateFinanceInput): Promise<Finance>;
  update(input: UpdateFinanceInput): Promise<Finance>;
  delete(input: DeleteFinanceInput): Promise<void>;
}
