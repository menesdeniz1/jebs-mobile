# Offline form and field-guide prototype

An unofficial Turkish-language Expo/React Native learning project: structured content, searchable guides, form drafts and PDF generation. It is **not an official system, legal advice or a validated operational tool**. Use fictional data only. Legal/procedural content is unverified draft material, not endorsed instructions.

## Run

Use Node.js 22, then `npm ci` and `npm start`. The repository uses Expo SDK 54. `npm run typecheck` checks TypeScript; `npm test -- --runInBand` runs the unit tests. `node scripts/test-crypto.cjs` tests the storage boundary without a real device. Passing mocked tests is not evidence of production readiness.

Dependency maintenance reduced the audit findings from 38 (including 2 critical) to 22 (12 moderate, 10 high) at review time. The remaining findings include Expo/tooling transitive dependencies; a tested SDK upgrade is still needed. No zero-vulnerability or deployment-safety claim is made. Do not expose development tooling to untrusted networks.

## Implementation

React Native/Expo UI, Zustand state, schema validation, Turkish text search, local content and PDF formatting. Source publication does not certify correctness of form wording, legal references or security of exported files.

## Storage maintenance — September 2026

The previous XOR obfuscation and static web key were replaced by versioned AES-256-GCM with a fresh random nonce, native asynchronous random bytes and a key stored through Expo SecureStore. Storage fails closed if SecureStore is unavailable; sensitive web persistence is disabled. This is local storage encryption, **not end-to-end encryption** and not a security audit.

Legacy plaintext/XOR records are not automatically migrated or deleted. A read failure blocks writes to that storage key for the current process, preventing silent overwrite; back up old device data and implement an explicit migration before using this version with existing records. Failed saves can leave temporary UI state that has not been persisted: do not assume it is saved.

PDF exports, sharing, device compromise, backups and logging need separate review. Do not enter real officer/case/person information. Use of the source is not authorization to use any official branding or third-party asset. The author identifies the project as personally developed; framework/font/model licenses remain separate. No new blanket license is granted to third-party content.

Implementation references: [Expo Crypto SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/crypto/) and [noble-ciphers](https://github.com/paulmillr/noble-ciphers/tree/1.3.0).
