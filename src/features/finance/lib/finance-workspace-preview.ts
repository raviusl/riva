import {
  calculateBalance,
  calculateTotal,
  type Finance,
} from "@/core/finance";
import type {
  FinanceBudgetLine,
  FinanceWorkspaceItem,
  FinanceWorkspaceModel,
  FinanceWorkspaceSummary,
} from "@/features/finance/lib/finance-types";
import { FINANCE_WORKSPACE_HUB_ID } from "@/features/finance/lib/finance-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

const COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "00000000-0000-4000-8000-000000000002";
const PROJECT_ID = "00000000-0000-4000-8000-000000000010";
const CLIENT_ID = "00000000-0000-4000-8000-000000000020";
const VENDOR_ID = "00000000-0000-4000-8000-000000000030";
const ACTOR = "00000000-0000-4000-8000-0000000000a1";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function withLabels(
  record: Finance,
  names: {
    projectName?: string | null;
    clientName?: string | null;
    vendorName?: string | null;
  } = {},
): FinanceWorkspaceItem {
  return {
    ...record,
    projectName: names.projectName ?? null,
    clientName: names.clientName ?? null,
    vendorName: names.vendorName ?? null,
  };
}

function buildSummary(
  records: FinanceWorkspaceItem[],
  budgetLines: FinanceBudgetLine[],
): FinanceWorkspaceSummary {
  const currency = "USD";
  let totalIncome = 0;
  let totalExpenses = 0;
  let outstandingInvoices = 0;
  let outstandingPayments = 0;
  let cashIn = 0;
  let cashOut = 0;
  let tax = 0;

  for (const record of records) {
    const total = calculateTotal(record);
    tax += record.tax;

    if (record.type === "income" || record.type === "payment") {
      if (record.status === "paid") {
        totalIncome += total;
        cashIn += total;
      }
    }

    if (record.type === "expense" || record.type === "refund") {
      if (record.status === "paid" || record.status === "open") {
        totalExpenses += total;
        cashOut += total;
      }
    }

    if (record.type === "invoice") {
      if (
        record.status === "open" ||
        record.status === "overdue" ||
        record.status === "draft"
      ) {
        outstandingInvoices += calculateBalance(record, 0);
      }
    }

    if (record.type === "payment" && record.status === "open") {
      outstandingPayments += total;
    }
  }

  const budgetTotal = budgetLines.reduce((sum, line) => sum + line.budget, 0);
  const budgetActual = budgetLines.reduce((sum, line) => sum + line.actual, 0);

  return {
    totalIncome,
    totalExpenses,
    outstandingInvoices,
    outstandingPayments,
    budgetTotal,
    budgetActual,
    budgetRemaining: budgetTotal - budgetActual,
    cashIn,
    cashOut,
    cashFlow: cashIn - cashOut,
    revenue: totalIncome,
    expense: totalExpenses,
    profit: totalIncome - totalExpenses,
    tax,
    currency,
  };
}

/**
 * UI foundation sample Finance Workspace.
 * Persistence / payment gateway / export are intentionally out of scope.
 */
export function getFinanceWorkspacePreview(
  hubId: string = FINANCE_WORKSPACE_HUB_ID,
): FinanceWorkspaceModel {
  const base = {
    companyId: COMPANY_ID,
    workspaceId: WORKSPACE_ID,
    createdBy: ACTOR,
    updatedBy: ACTOR,
    convertedInvoiceId: null as string | null,
    notes: null as string | null,
    internalNotes: null as string | null,
    documentContent: {} as import("@/core/finance/document-content").QuotationDocumentContent,
  } as const;

  const records: FinanceWorkspaceItem[] = [
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000f1",
        projectId: PROJECT_ID,
        clientId: CLIENT_ID,
        vendorId: null,
        type: "income",
        category: "services",
        currency: "USD",
        amount: 12_000,
        tax: 0,
        discount: 0,
        status: "paid",
        referenceNumber: "INC-1001",
        issuedAt: daysAgo(20),
        dueAt: null,
        paidAt: daysAgo(18),
        createdAt: daysAgo(20),
        updatedAt: daysAgo(18),
      },
      { projectName: uiZh.previewChenWedding, clientName: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000f2",
        projectId: PROJECT_ID,
        clientId: null,
        vendorId: VENDOR_ID,
        type: "expense",
        category: "venue",
        currency: "USD",
        amount: 4_500,
        tax: 360,
        discount: 0,
        status: "paid",
        referenceNumber: "EXP-220",
        issuedAt: daysAgo(14),
        dueAt: daysAgo(7),
        paidAt: daysAgo(6),
        createdAt: daysAgo(14),
        updatedAt: daysAgo(6),
      },
      { projectName: uiZh.previewChenWedding, vendorName: uiZh.previewGrandBallroom },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000f3",
        projectId: PROJECT_ID,
        clientId: CLIENT_ID,
        vendorId: null,
        type: "invoice",
        category: "services",
        currency: "USD",
        amount: 8_000,
        tax: 640,
        discount: 200,
        status: "open",
        referenceNumber: "INV-304",
        issuedAt: daysAgo(10),
        dueAt: daysFromNow(20),
        paidAt: null,
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },
      { projectName: uiZh.previewChenWedding, clientName: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000f4",
        projectId: PROJECT_ID,
        clientId: CLIENT_ID,
        vendorId: null,
        type: "invoice",
        category: "services",
        currency: "USD",
        amount: 3_200,
        tax: 256,
        discount: 0,
        status: "overdue",
        referenceNumber: "INV-298",
        issuedAt: daysAgo(45),
        dueAt: daysAgo(15),
        paidAt: null,
        createdAt: daysAgo(45),
        updatedAt: daysAgo(15),
      },
      { projectName: uiZh.previewChenWedding, clientName: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000f5",
        projectId: PROJECT_ID,
        clientId: CLIENT_ID,
        vendorId: null,
        type: "invoice",
        category: "services",
        currency: "USD",
        amount: 1_500,
        tax: 0,
        discount: 0,
        status: "draft",
        referenceNumber: "INV-310",
        issuedAt: null,
        dueAt: null,
        paidAt: null,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      { projectName: uiZh.previewChenWedding, clientName: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000f6",
        projectId: PROJECT_ID,
        clientId: CLIENT_ID,
        vendorId: null,
        type: "invoice",
        category: "fees",
        currency: "USD",
        amount: 900,
        tax: 0,
        discount: 0,
        status: "cancelled",
        referenceNumber: "INV-280",
        issuedAt: daysAgo(60),
        dueAt: daysAgo(30),
        paidAt: null,
        createdAt: daysAgo(60),
        updatedAt: daysAgo(50),
      },
      { projectName: uiZh.previewChenWedding, clientName: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000fa",
        projectId: PROJECT_ID,
        clientId: CLIENT_ID,
        vendorId: null,
        type: "payment",
        category: "services",
        currency: "USD",
        amount: 5_000,
        tax: 0,
        discount: 0,
        status: "paid",
        referenceNumber: "PAY-441",
        issuedAt: daysAgo(18),
        dueAt: null,
        paidAt: daysAgo(18),
        createdAt: daysAgo(18),
        updatedAt: daysAgo(18),
      },
      { projectName: uiZh.previewChenWedding, clientName: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000fb",
        projectId: PROJECT_ID,
        clientId: CLIENT_ID,
        vendorId: null,
        type: "payment",
        category: "services",
        currency: "USD",
        amount: 2_500,
        tax: 0,
        discount: 0,
        status: "open",
        referenceNumber: "PAY-450",
        issuedAt: daysAgo(3),
        dueAt: daysFromNow(7),
        paidAt: null,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      { projectName: uiZh.previewChenWedding, clientName: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000fc",
        projectId: PROJECT_ID,
        clientId: null,
        vendorId: VENDOR_ID,
        type: "transaction",
        category: "materials",
        currency: "USD",
        amount: 780,
        tax: 62.4,
        discount: 0,
        status: "paid",
        referenceNumber: "TXN-19",
        issuedAt: daysAgo(5),
        dueAt: null,
        paidAt: daysAgo(5),
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      },
      { projectName: uiZh.previewChenWedding, vendorName: uiZh.previewGrandBallroom },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000fd",
        projectId: PROJECT_ID,
        clientId: null,
        vendorId: null,
        type: "budget",
        category: "general",
        currency: "USD",
        amount: 25_000,
        tax: 0,
        discount: 0,
        status: "open",
        referenceNumber: "BUD-01",
        issuedAt: daysAgo(90),
        dueAt: null,
        paidAt: null,
        createdAt: daysAgo(90),
        updatedAt: daysAgo(2),
      },
      { projectName: uiZh.previewChenWedding },
    ),
  ];

  const budgetLines: FinanceBudgetLine[] = [
    {
      id: "bl1",
      category: "场地",
      budget: 8_000,
      actual: 4_500,
      currency: "USD",
    },
    {
      id: "bl2",
      category: "服务",
      budget: 10_000,
      actual: 6_200,
      currency: "USD",
    },
    {
      id: "bl3",
      category: "物料",
      budget: 3_000,
      actual: 780,
      currency: "USD",
    },
    {
      id: "bl4",
      category: "营销",
      budget: 1_500,
      actual: 0,
      currency: "USD",
    },
    {
      id: "bl5",
      category: "费用",
      budget: 2_500,
      actual: 900,
      currency: "USD",
    },
  ];

  return {
    id: hubId.trim() || FINANCE_WORKSPACE_HUB_ID,
    title: uiZh.financeWorkspaceTitle,
    description: "收入、支出、发票与预算（预览）",
    companyId: COMPANY_ID,
    workspaceId: WORKSPACE_ID,
    summary: buildSummary(records, budgetLines),
    records,
    budgetLines,
    activities: [
      {
        id: "act1",
        actorLabel: "Alex Chen",
        message: "将发票 INV-298 标记为逾期",
        createdAt: daysAgo(1),
      },
      {
        id: "act2",
        actorLabel: "Jordan Lee",
        message: "收到付款 PAY-441",
        createdAt: daysAgo(3),
      },
      {
        id: "act3",
        actorLabel: "Alex Chen",
        message: "已发送报价 QT-88",
        createdAt: daysAgo(8),
      },
      {
        id: "act4",
        actorLabel: "Alex Chen",
        message: "创建了发票 INV-304",
        createdAt: daysAgo(10),
      },
      {
        id: "act5",
        actorLabel: "Alex Chen",
        message: "记录了场地支出 EXP-220",
        createdAt: daysAgo(14),
      },
    ],
  };
}
