# Migration Notes — Jandarma Saha Rehberi

## Data Schema Changes

*(Will be documented as phases progress)*

## Decision-Tree Format

*(Will be documented in Phase 4)*

## Content Needing Expert Review

*(Placeholder decision-tree steps will be listed here)*

## Legacy AsyncStorage Keys → New Keys

| Old Key | New Key | Storage |
|---------|---------|---------|
| `@jebs_drafts` | `@gendarme:drafts:v1` | SecureStore |
| `@jebs_favorites` | `@gendarme:favorites:v1` | AsyncStorage |
| `@jebs_search_history` | `@gendarme:search_history:v1` | AsyncStorage |
| *(new)* | `@gendarme:disclaimer_accepted:v1` | AsyncStorage |
| *(new)* | `@gendarme:officer_profile:v1` | SecureStore |
