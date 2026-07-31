# RIVA Documentation

Internal documentation for **RIVA** — the operating system for service businesses.

> **Prototype V0 is archived.** Do not extend the current app. Wait for **Sprint 008**.  
> See [architecture/PROTOTYPE_V0_ARCHIVED.md](./architecture/PROTOTYPE_V0_ARCHIVED.md).

## Canonical design (approved)

| Folder | Purpose |
| --- | --- |
| [product/](./product/01_SOFTWARE_VISION.md) | **Product Bible** — vision, principles, IA, data, portals, automation, roadmap, rules |
| [architecture/](./architecture/00_ARCHITECTURE_PHASE.md) | **Software Architecture** — navigation, hierarchy, permissions, modules, portals |
| [technical-blueprint/](./technical-blueprint/00_OVERVIEW.md) | **CTO Technical Blueprint** — system, database, API, auth, permissions, storage, notifications, deployment, sprint plan, coding standards |

## Historical / Prototype V0 docs

Earlier Aura OS sprint docs remain for reference only. Where they conflict with `/docs/product` or `/docs/architecture`, the Product Bible and Architecture Phase win.

| Document | Purpose |
| --- | --- |
| [ROADMAP.md](./ROADMAP.md) | Legacy phases (superseded by product/08_ROADMAP.md) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Legacy stack notes |
| [AUTH.md](./AUTH.md) | Invitation-only auth (V0 implementation notes) |
| [DATA_MODEL.md](./DATA_MODEL.md) | Legacy target data model |
| [USER_JOURNEY.md](./USER_JOURNEY.md) | Legacy role journeys |
| [PRODUCT_BLUEPRINT.md](./PRODUCT_BLUEPRINT.md) | Legacy product blueprint |
| [NAVIGATION.md](./NAVIGATION.md) | Legacy nav (superseded by architecture/01) |
| [SIDEBAR_STRUCTURE.md](./SIDEBAR_STRUCTURE.md) | Legacy sidebar IA |
| [PAGE_HIERARCHY.md](./PAGE_HIERARCHY.md) | Legacy page trees |
| [URL_STRUCTURE.md](./URL_STRUCTURE.md) | Legacy routes |
| [DATABASE.md](./DATABASE.md) | V0 PostgreSQL tables |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Visual principles |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | V0 UI component inventory |
| [SPRINT002.md](./SPRINT002.md) … [SPRINT007.md](./SPRINT007.md) | Historical sprint notes |

## Current status

- **Product Bible** — approved under `/docs/product`
- **Architecture Phase** — approved under `/docs/architecture`
- **Sprint 008 Blueprint** — documentation approved under `/docs/sprint-008`
- **CTO Technical Blueprint** — drafted under `/docs/technical-blueprint`
- **Sprint 009 Core Foundation** — approved (`docs/SPRINT009.md`)
- **Sprint 010 Workspace Management** — approved (`docs/SPRINT010.md`)
- **Sprint 011 Identity & Membership** — implemented (`docs/SPRINT011.md`)
- **Sprint 012 Workspace Foundation** — implemented (`docs/SPRINT012.md`)
- **Sprint 013 Company Domain** — implemented (`docs/SPRINT013.md`)
- **Sprint 014 Project Domain** — implemented (`docs/SPRINT014.md`)
- **Sprint 015 Client Domain** — implemented (`docs/SPRINT015.md`)
- **Sprint 016 Vendor Domain** — implemented (`docs/SPRINT016.md`)
- **MVP usability pass** — implemented (`docs/MVP.md`) — real dashboard, CRUD, nav, mobile
- **Domain Architecture** — canonical (`docs/architecture/DOMAIN_ARCHITECTURE.md`)
- **Task Domain + Task Workspace** — persistence live (`workspace_tasks`, Project 029)
- **Security / RLS strategy** — [SECURITY.md](./SECURITY.md) (RLS enabled; tenant policies deferred by design)
- **Prototype V0** — archived UI remains; do not extend business modules
- **Next** — [Projects 029–040](./PROJECTS_029_040.md) complete; authorize the next delivery band when ready

## Related project docs

- Root [README.md](../README.md) — setup and local development
- [supabase/README.md](../supabase/README.md) — migration and auth notes
