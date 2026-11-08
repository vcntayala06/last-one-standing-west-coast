# LOS iPhone release gate — November 7, 2026

STATUS: **STAGING ONLY — NOT AN APPROVED BUILD AND NOT READY TO PUBLISH.**

The staging branch was forked from `west-coast-development` (older Build 6.38). The approved Stage 6D desktop master is on the owner's Windows laptop and has NOT been copied or backed up here. Do not deploy this branch, merge it to the live branch, or overwrite the desktop master.

## Exact restore point required before any code modification

Name: **LOS Stage 6D — APPROVED MASTER — 2026-11-07**

A complete restore point must include:
1. Actual game source folder used by the **LOS WEST COAST** desktop shortcut, including scripts, media, assets, config, and launcher.
2. The game's approved question bank, question-manager state, and any browser-local data (check dedicated Chrome profile's localStorage, IndexedDB, and other persistent storage).
3. Saved players, groups, avatars/voice settings, audio caches where needed, and any other state needed to reproduce approved behavior.
4. Non-secret inventory of runtime dependencies and server startup methods. **Never commit live API keys, credentials, or private player data to a public repository.**
5. SHA-256 checksums and a restore verification: open the copied backup independently and confirm the approved version, question counts, and gameplay.

Do not call this restore point complete until actual source and data are copied and a restore test passes.

## Mobile deployment acceptance tests

- Launch HTTPS-hosted current Stage 6D on iPhone independently of laptop power and home Wi-Fi.
- Verify voice control actually receives transcripts in supported iPhone browsers; LOWLOW audio playback alone is insufficient.
- Verify all approved Medium, Adult, Family/Kids, and Hip-Hop questions available on phone; do not silently substitute September seed questions.
- Verify player/group data behavior, portable import/export, privacy, and first-run defaults.
- Fix responsive portrait/landscape: no cropped Game Setup, labels, category buttons, or side-panel overflow/black strip.
- Fix Settings navigation: Player Management and Group Management open immediately on first tap/click and close the Settings overlay.
- Validate host audio, avatars, timers, wrong/correct screens, player limits, and 3-strike gameplay against the approved master.
- Preserve private backups and approved desktop master unchanged throughout testing.

## Workflow

1. Obtain verified, self-contained Stage 6D backup from laptop before publishing or editing.
2. Bring source into protected staging only; keep restore point unchanged.
3. Audit hosting compatibility. GitHub Pages hosts static files over HTTPS, but local browser storage does not automatically transfer across devices. Local Node/backend services or API keys require an appropriate separately secured service.
4. Fix mobile/desktop issues on staging; automated and physical iPhone tests.
5. Publish only after the owner validates the exact approved questions, voice, and gameplay.

**Roll back to:** LOS Stage 6D — APPROVED MASTER — 2026-11-07, once that verified restore point exists. Branch creation alone does not provide this backup.
