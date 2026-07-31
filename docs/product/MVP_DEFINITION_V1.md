# MVP Definition v1.0

**Status:** Canonical  
**Product:** RIVA  
**Version:** 1.0  
**Scope:** Foundation Projects 001–040  
**Audience:** Product, Engineering, Company Owners, Coordinators

This document is the official definition of the first shippable RIVA product.  
It does not authorize new code, migrations, routes, or redesign of frozen foundations.

---

## 1. Product Goal

### What is the first version of RIVA?

**RIVA MVP v1.0** is an invitation-only **Agent Portal** for service businesses: one operating surface where a company runs delivery work across projects, people, meetings, tasks, files, money, and timeline — inside a clear **Workspace → Company** hierarchy.

It is the first version teams can use **daily** to coordinate real client work, not a prototype, marketing site, or AI demo.

### What problem does it solve?

Service businesses (events, weddings, agencies, field services) scatter work across chat, spreadsheets, email, and ad-hoc folders. Context is lost between sales, coordination, vendors, and finance.

RIVA MVP consolidates that operational context into one system of record so the internal team can:

- Switch Workspace / Company without losing tenancy boundaries  
- Open a **Project / Client / Vendor / Meeting / Task** workspace and see related work  
- Track chronological activity on a **Timeline**  
- Keep **Documents**, **Finance**, and **Notifications** in the same product chrome  
- Preview **Automation** workflows without relying on an execution engine yet  

MVP answers: *“What is happening for this company and this delivery — and where do I act next?”*

---

## 2. Target Users

| User | In MVP? | Role |
| --- | --- | --- |
| **Internal Team** | Yes | Day-to-day operators inside the Agent Portal |
| **Company Owner** | Yes | Owns company settings, membership, and commercial oversight |
| **Coordinator** | Yes | Runs delivery: projects, tasks, meetings, timeline, vendors |
| **Sales** | Yes | Creates / advances clients and early project context |
| **Client** | Future | Client Portal — out of MVP scope |
| **Vendor** | Future | Vendor-facing portal / marketplace — out of MVP scope |

MVP is **agent-first**. Clients and vendors may appear as **records** and workspace links; they do not receive dedicated portals in v1.0.

---

## 3. MVP Scope

### Included

| Area | MVP expectation |
| --- | --- |
| **Authentication** | Invitation-only access; session; workspace/company context |
| **Company** | Company create/select; company-scoped data |
| **Workspace** | Workspace switcher; tenancy root for company work |
| **Dashboard** | Real company-scoped overview (not prototype placeholders as primary UX) |
| **Project** | Project list + Project Workspace chrome |
| **Client** | Client list + Client Workspace chrome |
| **Vendor** | Vendor list + Vendor Workspace chrome |
| **Meeting** | Meeting Workspace (preview acceptable where persistence is incomplete) |
| **Task** | Task persistence, assignment, activity, Task Workspace |
| **Timeline** | Timeline Workspace aggregating chronological platform events |
| **Document** | Document domain + Document Workspace (preview OK without storage engine) |
| **Finance** | Finance domain + Finance Workspace (preview OK without payments provider) |
| **Notification** | Notification domain + Notification Workspace (preview OK without delivery providers) |
| **Automation** | Automation domain + Automation Workspace **preview only** — no execution |

All included surfaces reuse shared Workspace architecture (`WorkspaceLayout`, `WorkspaceHeader`, `WorkspaceTabNav`, URL `?tab=`, cross-navigation) and Domain Architecture under `src/core/{domain}/` where those foundations exist.

### Excluded

| Area | Reason |
| --- | --- |
| **AI** | Assisted intelligence is a later phase |
| **Public signup** | Access remains invitation / provisioning based |
| **Billing** | No subscription, metering, or payment collection for RIVA itself |
| **Marketplace** | No public vendor marketplace |
| **Mobile app** | Web Agent Portal only |
| **Public API** | No external partner API product |
| **Workflow execution** | Automations are definition/preview only |
| **WhatsApp automation** | Channel catalog may exist; delivery/automation is out |
| **Email automation** | Templates/preview only; no outbound campaign engine |

Anything in **Excluded** requires an explicit post-MVP project authorization. It must not be smuggled into Alpha polish work.

---

## 4. Release Criteria

RIVA **Alpha** may be used daily when all of the following are true:

### Platform

1. An invited user can sign in and land in a valid **Workspace + Company** context.  
2. Workspace and Company switching works without corrupting tenancy.  
3. Primary Agent Portal navigation reaches Dashboard and core modules without broken shells.

### Core delivery loop

4. A Coordinator can create or open a **Project**, attach or open related **Client** / **Vendor** context, and navigate via workspace deep links.  
5. **Tasks** can be created, assigned, updated, and reviewed with an activity trail in Task Workspace.  
6. **Meetings** are reachable in Meeting Workspace (preview allowed if persistence is incomplete, but chrome and tabs must be stable).  
7. **Timeline Workspace** shows a chronological feed combining available platform events (meetings, tasks, task activity; placeholders clearly labeled).

### Supporting modules

8. **Document**, **Finance**, **Notification**, and **Automation** workspaces open with shared Workspace chrome and `?tab=` routing.  
9. Preview-only modules (storage, payments, providers, automation execution) show honest empty/coming-soon states — not fake production claims.  
10. No Alpha path depends on Excluded capabilities (AI, public signup, billing, marketplace, mobile, public API, workflow execution, WhatsApp/email automation).

### Quality bar

11. Empty, loading, and error states exist for primary dashboard and list routes.  
12. Permissions placeholders do not silently grant write where the product intends read-only (document/finance/notification/automation previews).  
13. Foundation docs and Domain/Workspace architecture remain the source of truth; Alpha does not introduce a parallel UI system.

When these criteria are met, Alpha is **daily-usable for internal operators**. It is not “feature complete,” and preview modules remain explicitly non-production for storage, payments, delivery, and execution.

---

## 5. Success Metrics

MVP success is measured on **operator adoption and delivery clarity**, not vanity traffic.

| Metric | Target (Alpha → early MVP) | Notes |
| --- | --- | --- |
| **Daily active companies** | ≥ 1 real company using RIVA as primary ops board | Not demo-only |
| **Weekly active operators** | ≥ 3 roles per active company (e.g. Owner + Coordinator + Sales) | Invitation-based |
| **Core loop completion** | ≥ 80% of active weeks include Project + Task activity | Create/update tasks linked to a project |
| **Workspace navigation** | ≥ 70% of sessions use Workspace chrome / deep links (not only flat lists) | Cross-nav health |
| **Timeline usefulness** | Operators open Timeline at least weekly on active companies | Chronological trust |
| **Support friction** | Critical path bugs (auth, tenancy switch, task CRUD) resolved within 48h | Alpha reliability |
| **Scope discipline** | Zero Excluded features shipped as “temporary hacks” in Alpha | Feature freeze integrity |

Secondary signals (qualitative):

- Coordinators can answer “what’s due / what’s overdue” without leaving RIVA.  
- Owners can see company-scoped project/client/vendor posture from the dashboard.  
- Preview modules are understood as preview — no false expectation of email/WhatsApp/automation execution.

---

## 6. Feature Freeze

### Declaration

**Foundation Projects 001–040 are frozen.**

That foundation includes:

- Product / architecture / technical-blueprint canon  
- Domain Architecture under `src/core/{domain}/`  
- Shared Workspace architecture and cross-navigation  
- Delivered Task depth (persistence, assignment, activity)  
- Timeline aggregation Workspace  
- Document, Finance, Notification, Automation domains + Workspaces (including preview surfaces)

### Rules after freeze

1. **Extend, do not redesign** — new work adds persistence, providers, or depth on top of existing contracts and chrome.  
2. **No parallel shells** — do not invent a second layout system for modules that already use Workspace architecture.  
3. **No schema opportunism** — new tables/migrations require an explicit project; do not silently reshape frozen domain contracts.  
4. **Preview honesty** — preview modules stay labeled until their execution/storage/delivery projects ship.  
5. **Exceptions** require a written product decision that names which frozen surface is being changed and why.

Post-040 development (execution engines, Client Portal, AI, billing, public SaaS, etc.) must treat 001–040 as the stable base, not a disposable prototype.

---

## Related documents

- [01_SOFTWARE_VISION.md](./01_SOFTWARE_VISION.md)  
- [02_PRODUCT_PRINCIPLES.md](./02_PRODUCT_PRINCIPLES.md)  
- [03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md)  
- [08_ROADMAP.md](./08_ROADMAP.md)  
- [10_DEVELOPMENT_RULES.md](./10_DEVELOPMENT_RULES.md)  
- [../architecture/DOMAIN_ARCHITECTURE.md](../architecture/DOMAIN_ARCHITECTURE.md)  
- [../PROJECTS_029_040.md](../PROJECTS_029_040.md)

---

## Document control

| Field | Value |
| --- | --- |
| Document | MVP Definition v1.0 |
| Path | `docs/product/MVP_DEFINITION_V1.md` |
| Freeze boundary | Foundation Projects 001–040 |
| Next gate | RIVA Alpha daily-use criteria (Section 4) |
