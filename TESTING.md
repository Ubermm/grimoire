# EU AI Act module — verification log

Accountability checklist for the AI Act build. Each phase must pass: **Build** (`npm run build`),
**DB smoke** (`npx tsx scripts/smoke-ai-act.ts`), **Route smoke** (curl), **Render** (dev server),
and **FDA regression** (existing `/audit`, `/ind-creation`, `/analytics`, `/chat` still work).

## Commands
- Build: `npm run build`
- AI Act smoke (DB + classification Prolog): `npx tsx scripts/smoke-ai-act.ts`
- Seed: `npx tsx scripts/seed-ai-act.ts`
- Dev server: `npm run dev` (port 3000; NEXTAUTH_URL pinned to :3000)
- Render check: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/<route>`

## Status

| Phase | Item | Build | DB smoke | Route smoke | Render | FDA regression | Status |
|---|---|---|---|---|---|---|---|
| P0 | Models + lib/ai-act + smoke | ✅ | ✅ 8/8 classify tests pass | n/a | n/a | n/a | **done** |
| P1 | Seed real AI Act data | ✅ | ✅ 5 regs / 4 forms / 12 systems | n/a | n/a | n/a | **done** |
| P2 | Registry + UI shell | ✅ | ✅ | ✅ API 401 unauth | ✅ /ai-act + /registry 200, light theme | ✅ /audit 200 | **done** |
| P3 | Classification wizard | ✅ | ✅ 8/8 cases | ✅ API 401 | ✅ /ai-act/classify 200 | ✅ | **done** |
| P4 | Screening + GPAI + Annex IV | ✅ | ✅ 6/6 form cases | ✅ validate (smoke) | ✅ all 4 pages 200 | ✅ | **done** |
| P5 | AI Act audit flow | ✅ | ✅ authed HTTP e2e | ✅ systems+audits+classify+validate (authed) | ✅ 8/8 pages 200 | ✅ /audit 200 | **done** |
| P6 | Hybrid authoring | ✅ | n/a | ✅ live gpt-4o generate (4q/2 queries) + forms PUT (authed) | ✅ /ai-act/authoring 200 | ✅ | **done** |
| P7 | Cross-regulation + export | ✅ | n/a | ✅ live gpt-4o overlap (3 overlaps, authed) | ✅ /cross-regulation 200 | ✅ | **done** |
| P8 | Branding + final regression | ✅ | ✅ 14/14 final smoke | ✅ all authed routes | ✅ 10/10 AI Act pages 200 | ✅ /, /audit, /analytics 200 (chat/ind 307 = pre-existing login redirect) | **done** |

## Final state (all phases done)
- **74 routes** build clean (22 AI Act). React 19 / Next 16 / Tailwind 4.
- FDA features **unbroken** (no edits to Audit.tsx, inference.ts, validate route, or any FDA route).
- Verified end-to-end through real authenticated HTTP: registry CRUD, classification (compute + persist), screening/validate, audit create + subsection persistence, LLM form generation (live gpt-4o), forms save, cross-regulation analysis (live gpt-4o).
- Prolog logic: 14/14 smoke (8 classification + 6 seeded-form cases).
- Scripts: `scripts/seed-ai-act.ts` (seed), `scripts/smoke-ai-act.ts` (logic tests), `scripts/itest-user.ts` (authed-test user helper).

## Notes
- P0 (done): added `CAISystem`, `CAIActRegulation`, `CAIActForm`, `CAIActAudit` to `models.ts`;
  `src/lib/ai-act/{constants,schema,classification.pl,classify-form,annex-iv-sections,prompts}.ts`;
  `scripts/smoke-ai-act.ts`. Classification Prolog verified end-to-end (8 canned cases) through the
  real `/api/validate` program assembly + `executePrologQueries`. Build green. No FDA files touched.
