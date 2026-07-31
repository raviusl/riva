# Domain Architecture Standard

**Status:** Canonical  
**Applies to:** All future business domains under `src/core/`  
**Reference implementation:** `src/core/task/`

---

## 1. Purpose

Every business domain (Task, Meeting, Document, Finance, Timeline, Notification, …) must follow the same architecture so the platform stays consistent, reviewable, and easy to extend.

This standard defines **contracts only** in the foundation phase:

- Types
- Validation
- Repository interface
- Service interface

It does **not** authorize database tables, migrations, server actions, CRUD UI, or business-rule engines until a domain sprint explicitly does.

---

## 2. Recommended folder structure

```text
src/core/
├── task/
│   ├── types.ts
│   ├── constants.ts
│   ├── schema.ts
│   ├── repository.ts
│   ├── service.ts
│   ├── permissions.ts      # placeholder until RBAC wiring
│   ├── events.ts           # placeholder until domain events bus
│   └── index.ts            # public barrel
├── meeting/
├── document/
├── finance/
├── timeline/
├── notification/
└── …
```

Optional (when a domain is implemented in UI):

```text
src/features/{domain}/     # UI, workspace tabs, forms
src/lib/{domain}/          # thin re-exports of @/core/{domain}
```

---

## 3. File responsibilities

| File | Responsibility |
| --- | --- |
| `types.ts` | Entity models and ID aliases |
| `constants.ts` | Status / priority / category enums and stable keys |
| `schema.ts` | Zod validation + input/output inferred types |
| `repository.ts` | Persistence **interface** only |
| `service.ts` | Domain orchestration **interface** only |
| `permissions.ts` | Permission key placeholders (`{domain}.read` / `.write`) |
| `events.ts` | Domain event name / payload placeholders |
| `index.ts` | Public exports for the domain |

---

## 4. Required public surface

Each domain barrel (`index.ts`) must expose:

1. **Types** — entity + related aliases  
2. **Validation** — Zod schemas + `Create*Input` / `Update*Input`  
3. **Repository interface** — `*Repository`  
4. **Service interface** — `*Service`

Constants, permissions, and events should also be exported when present.

---

## 5. Naming conventions

- Folder: singular domain key (`task`, `meeting`, `document`)
- Entity type: PascalCase (`Task`, `Meeting`)
- Enums: `SCREAMING_SNAKE` arrays + PascalCase union types (`TASK_STATUSES`, `TaskStatus`)
- Inputs: `CreateTaskInput`, `UpdateTaskInput`, `ListTasksQuery`
- Contracts: `TaskRepository`, `TaskService`
- Schema file: always `schema.ts` (not `schemas.ts`)

---

## 6. Explicit non-goals (foundation phase)

- No SQL / migrations / table creation
- No repository or service **implementations**
- No server actions
- No CRUD UI
- No workflow engines or automation
- No cross-domain writes (domains communicate via events later)

---

## 7. Future domain checklist

When adding a new domain under `src/core/{domain}/`:

1. [ ] Create folder `src/core/{domain}/`
2. [ ] Add `types.ts` with the primary entity
3. [ ] Add `constants.ts` for statuses / categories
4. [ ] Add `schema.ts` with Zod create/update/list schemas
5. [ ] Add `repository.ts` interface (no implementation)
6. [ ] Add `service.ts` interface (no implementation)
7. [ ] Add `permissions.ts` placeholder keys
8. [ ] Add `events.ts` placeholder event names
9. [ ] Add `index.ts` exporting Types + Validation + Repository + Service
10. [ ] Re-export from `src/core/index.ts` only when the domain is approved for platform use
11. [ ] Do **not** add migrations, actions, or UI in the same foundation PR unless explicitly scoped

---

## 8. Reference

See `src/core/task/` for the first compliant domain foundation.
