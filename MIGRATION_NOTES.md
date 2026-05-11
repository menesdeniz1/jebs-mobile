# Migration Notes — Jandarma Saha Rehberi

## Data Schema Changes

*(Will be documented as phases progress)*

## Decision-Tree Format

Decision-tree events use polymorphic `Step` types:
- **`instruction`** — linear checkbox step (same as legacy, but with explicit `type` field)
- **`question`** — branch point with 2+ labeled options, each pointing to a `next_order`
- **`terminal`** — end node with an `outcome` (one of: `close_file`, `continue_investigation`, `refer_to_prosecutor`)

The `DecisionTreeWalker` component navigates these step-by-step. Events with only `instruction` steps still use the flat `StepChecklist`.

## Content Needing Expert Review

| Event ID | Title | Branch Points | Status |
|----------|-------|---------------|--------|
| `darp` | [TASLAK] Darp (Kasten Yaralama) | Q6: Şüpheli olay yerinde mi? (Evet→7, Hayır→10) · Q14: Basit tıbbi müdahale? (Evet→15-şikâyet, Hayır→16-re'sen) | ⚠ Needs legal expert review |
| `uyusturucu` | [TASLAK] Uyuşturucu Madde | Q8: Kullanım miktarını aşıyor mu? (Evet→9-ticaret, Hayır→12-kullanım) | ⚠ Needs legal expert review |

**All other 11 events** remain in linear (instruction-only) format and are unaffected.

## Legacy AsyncStorage Keys → New Keys

| Old Key | New Key | Storage |
|---------|---------|---------|
| `@jebs_drafts` | `@gendarme:drafts:v1` | SecureStore |
| `@jebs_favorites` | `@gendarme:favorites:v1` | AsyncStorage |
| `@jebs_search_history` | `@gendarme:search_history:v1` | AsyncStorage |
| *(new)* | `@gendarme:disclaimer_accepted:v1` | AsyncStorage |
| *(new)* | `@gendarme:officer_profile:v1` | SecureStore |
