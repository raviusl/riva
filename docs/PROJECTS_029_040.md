# Projects 029–040 — Delivery Sequence

**Status:** 029–040 implemented  

**Depends on:** Sprint 011–016 · MVP · Domain Architecture · Task Domain foundation · Task Workspace v1  
**Standard:** [`docs/architecture/DOMAIN_ARCHITECTURE.md`](./architecture/DOMAIN_ARCHITECTURE.md)

---

## Precursors (done)

| Item | Outcome |
| --- | --- |
| Task Domain foundation | `src/core/task/` contracts (types, schema, repository/service interfaces) |
| Domain Architecture | Shared `src/core/{domain}/` pattern + checklist |
| Task Workspace v1 | Preview UI: Overview · Tasks list · detail · create/edit |

---

## Sequence

### Task depth

| ID | Project | Goal | Constraint |
| --- | --- | --- | --- |
| **029** | Task Persistence | Tables, repository/service impl, server actions; wire Task Workspace off preview | **Implemented** · No assignment UI engine · No activity feed · No timeline |
| **030** | Task Assignment | Real assignee model + people/directory wiring | **Implemented** · No notifications · No automation |
| **031** | Task Activity Feed | Activity stream for task lifecycle events | **Implemented** · Reuse Activity foundation · No redesign |
| **032** | Timeline Workspace | Unified chronological Timeline Workspace | **Implemented** · Aggregation only · No new schema |

### Document

| ID | Project | Goal | Constraint |
| --- | --- | --- | --- |
| **033** | Document Domain | Deepen `src/core/document/` to approved platform contracts | **Implemented** · No storage engine · No CRUD UI · No Workspace |
| **034** | Document Workspace | Workspace UI on Document Domain (same chrome as Task/Meeting) | **Implemented** · Preview OK · No storage · No upload |

### Finance

| ID | Project | Goal | Constraint |
| --- | --- | --- | --- |
| **035** | Finance Domain | Deepen `src/core/finance/` contracts | **Implemented** · No payments provider · No CRUD UI · No Workspace |
| **036** | Finance Workspace | Workspace UI on Finance Domain | **Implemented** · Preview OK · No payments · No export |

### Notification

| ID | Project | Goal | Constraint |
| --- | --- | --- | --- |
| **037** | Notification Domain | Deepen `src/core/notification/` contracts | **Implemented** · No email/SMS/push · No Workspace |
| **038** | Notification Workspace | Workspace UI on Notification Domain | **Implemented** · Preview OK · No providers · No jobs |

### Automation

| ID | Project | Goal | Constraint |
| --- | --- | --- | --- |
| **039** | Automation Domain | Deepen `src/core/automation/` contracts | **Implemented** · No engine · No scheduler · No Workspace |
| **040** | Automation Workspace | Workspace UI on Automation Domain | **Implemented** · Preview OK · No execution · No scheduler |

### Timeline

| ID | Project | Goal | Constraint |
| --- | --- | --- | --- |
| — | Timeline Domain deepen | Align `src/core/timeline/` beyond Project 032 aggregation | Deferred past 040 |
| — | Timeline Workspace deepen | Extend Timeline Workspace beyond aggregation hub | Deferred past 040 |

---

## Rules

1. **One project at a time** — do not start N+1 until N is approved/merged.  
2. **Domain before Workspace** for 033–040 (033 → 034, 035 → 036, …).  
3. **Follow Domain Architecture** — `types` · `constants` · `schema` · `repository` · `service` · `permissions` · `events` · `index`.  
4. **Follow Workspace architecture** — `WorkspaceLayout` · `WorkspaceHeader` · URL `?tab=` · feature folder under `src/features/{domain}/`.  
5. **No scope bleed** — no recurring tasks, automation engines, or Client Portal in this band unless a project explicitly adds them.

---

## Next

Projects 029–040 are complete. Authorize the next delivery band when ready.
