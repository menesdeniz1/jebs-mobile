# Refactor Progress — Jandarma Saha Rehberi

## Checklist

### P0 — Ship-blockers

- [x] P0-1. HTML injection in PDF generation — `escapeHtml()` in `lib/html.ts`
- [x] P0-2. "Cihaza Kaydet" actually saves to real location
- [x] P0-3. Remove unauthorized official letterhead from PDF
- [x] P0-4. First-run disclaimer / consent screen
- [ ] P0-5. Drafts migrated from AsyncStorage to SecureStore

### P1 — High priority

- [x] P1-6. Type safety — `data/types.ts`, `data/schemas.ts`, `data/loader.ts`, zero `any`
- [x] P1-7. Markdown-in-data restructured to proper JSON objects
- [ ] P1-8. Decision-tree step model (polymorphic Step type)
- [x] P1-9. Silent failure / fire-and-forget writes fixed
- [x] P1-10. Store boilerplate extracted to `createPersistedStore` factory

### P2 — Medium priority

- [ ] P2-11. PDF tempfile cleanup on app start
- [ ] P2-12. Field-grade UX (font sizes, tap targets, Saha Modu)
- [ ] P2-13. Content versioning in JSON files
- [ ] P2-14. Tests (jest + jest-expo, ≥60% coverage on lib/ and store/)
- [ ] P2-15. Crash reporting (Sentry, OFF by default)

### P3 — Quality of life

- [ ] P3-16. Officer profile (auto-fill officer fields)
- [ ] P3-17. Date/time defaults (current local date/time)
- [ ] P3-18. Real official template layouts (per-form PDF templates)
- [ ] P3-19. Emergency contacts (112, 155, 156, AMATEM)
- [ ] P3-20. i18n scaffold (centralized Turkish strings)

---

## Phase Log

### Phase 0 — Orientation
- **Status**: ✅ Complete
- Read all source files: app/ (9 screens), lib/ (3 modules), store/ (3 stores), components/ (7 components), data/ (3 JSON files), constants/theme.ts
- Git repo confirmed; baseline commit `2b28eb1` created as `chore: baseline before refactor`
- Project has: 4 categories, 13 events (linear step checklists), 13 form templates, full PDF generation, search with Turkish normalization, favorites, drafts
- Key issues confirmed:
  - `as any[]` casts throughout (search.ts L71/120, index.tsx L19/41, forms.tsx L26, guide.tsx L25, categoryId.tsx L15-16, eventId.tsx L23)
  - HTML injection in pdf.ts L54-56, L59-60, L63, L72-73, L120-122
  - preview.tsx handleSave L14-16 does nothing
  - Unauthorized letterhead in pdf.ts L51-55
  - No disclaimer screen
  - Drafts in AsyncStorage (plaintext PII)
  - `AsyncStorage.setItem(...).catch(console.error)` fire-and-forget in all 3 stores
  - `legal_references` as markdown strings parsed by fragile regex
  - Steps are linear only (no decision tree)
- Dependencies installed, node_modules present

### Phase 1 — Type Safety (P1-6)
- **Status**: ✅ Complete (commit `cffb183`)
- Created `data/types.ts` — TypeScript interfaces for Category, Event, Step (polymorphic), FormTemplate, FormField, LegalReference, ProsecutorInfo, PartyRoles
- Created `data/schemas.ts` — Zod schemas matching every interface, with union types supporting legacy string formats during migration
- Created `data/loader.ts` — Typed data loader with runtime validation, legacy step normalization, caching
- Replaced all `as any[]` casts and raw JSON imports across 6 screen files + search.ts
- Fixed zod v4 API: `.error.issues[0].message` instead of `.error.errors[0].message`
- Added `typecheck` npm script
- `npx tsc --noEmit` passes with zero errors, zero `any` types

### Phase 2 — Security (P0-1, P0-3, P0-4)
- **Status**: ✅ Complete (commit `43f3857`)
- Created `lib/html.ts` with `escapeHtml()` handling &, <, >, ", '
- Rewrote `lib/pdf.ts`: all `${}` interpolations now use `escapeHtml()`; user-entered content escaped before `<br>` replacement
- Removed unauthorized letterhead and emblem; replaced with neutral "Jandarma Saha Rehberi" header
- Added "TASLAK — RESMİ BELGE DEĞİLDİR" watermark + draft notice banner
- Created `app/disclaimer.tsx` as `DisclaimerGate` wrapping app in `_layout.tsx`

### Phase 3 — Data Restructure + Store Hardening (P1-7, P0-2, P1-9, P1-10)
- **Status**: ✅ Complete (commits `b033a7c`, `8746cb3`, `3fee300`)
- **P1-7**: Created `data/migrate-events.js` script; converted all 13 events' `prosecutor_info`, `party_roles`, `witness_procedure`, `legal_references` from markdown strings to structured JSON objects. Updated schemas to structured-only (removed string union fallback). Updated `[eventId].tsx` to render structured data directly (no regex parsing). Updated `search.ts` to index structured `LegalReference[]`.
- **P0-2**: Rewrote `app/form/preview.tsx` — `handleSave` now uses `expo-file-system/legacy` `copyAsync` to persist PDF to `documentDirectory/pdfs/` with verify-after-write. Shows loading state and green confirmation badge.
- **P1-9**: Created `store/persistence.ts` — shared `loadFromStorage`/`persistToStorage`/`removeFromStorage` with retry-on-failure and user-visible Toast on error. All 3 stores rewritten to use it; zero `.catch(console.error)` remaining.
- **P1-10**: `persistence.ts` IS the factory — centralized load/persist/remove logic replaces duplicated boilerplate in all 3 stores. Updated storage keys per MIGRATION_NOTES.md.

---

## New Dependencies

*(None added yet)*

---

## Skipped Items

*(None skipped yet)*
