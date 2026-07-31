import type {
  CreateAutomationInput,
  DeleteAutomationInput,
  DisableAutomationInput,
  EnableAutomationInput,
  ListAutomationsQuery,
  UpdateAutomationInput,
} from "@/core/automation/schema";
import type { Automation, AutomationId } from "@/core/automation/types";

/**
 * Automation persistence contract — implementation deferred.
 * No execution engine, scheduler, queue, or worker in Project 039.
 */
export interface AutomationRepository {
  findById(automationId: AutomationId): Promise<Automation | null>;
  list(query: ListAutomationsQuery): Promise<Automation[]>;
  create(input: CreateAutomationInput): Promise<Automation>;
  update(input: UpdateAutomationInput): Promise<Automation>;
  delete(input: DeleteAutomationInput): Promise<void>;
  enable(input: EnableAutomationInput): Promise<Automation>;
  disable(input: DisableAutomationInput): Promise<Automation>;
}
