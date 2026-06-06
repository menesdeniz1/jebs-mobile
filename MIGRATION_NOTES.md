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
    | `darp` | [TASLAK] Darp (Kasten Yaralama) | Q6: Şüpheli olay yerinde mi? (Evet→7, Hayır→10) · Q15: Basit tıbbi müdahale? (Evet→16-şikâyet, Hayır→17-re'sen) | ✅ Reviewed against CMK 2024 (Uzlaştırma added) |
    | `uyusturucu` | [TASLAK] Uyuşturucu Madde | Q8: Kullanım miktarını aşıyor mu? (Evet→9-ticaret, Hayır→12-kullanım) | ✅ Reviewed against CMK 2024 (Makul şüphe added) |

    **All other 11 events** remain in linear (instruction-only) format and are unaffected.

    ## Legacy AsyncStorage Keys → New Keys

    | Old Key | New Key | Storage |
    |---------|---------|---------|
    | `@jebs_drafts` | `@gendarme_drafts_v1` | SecureStore |
    | `@jebs_favorites` | `@gendarme_favorites_v1` | AsyncStorage |
    | `@jebs_search_history` | `@gendarme_search_history_v1` | AsyncStorage |
    | *(new)* | `@gendarme_disclaimer_accepted_v1` | AsyncStorage |
    | *(new)* | `@gendarme_officer_profile_v1` | SecureStore |
