# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SFList JSON Editor — a browser-based visual editor for the [SFList JSON format](https://gist.github.com/kode54/a7bb01a0db3f2e996145b77f0ca510d5), a SoundFont playlist format used with BASS MIDI. Live at [sflist.losno.co](https://sflist.losno.co).

## Commands

- **Dev server:** `npx quasar dev -m pwa` (opens browser automatically)
- **Build:** `npx quasar build -m pwa` (output in `dist/pwa/`)
- **Lint:** `npm run lint`
- **Format:** `npm run format`
- **No tests** — the test script is a no-op

Package manager: bun (has `bun.lock`), though npm/pnpm also work.

## Architecture

Quasar v2 (Vue 3 + Vite) PWA using hash-based routing, TypeScript strict mode, and Pinia for state. Built with GenerateSW workbox mode for full offline support.

### Key layers

- **Types** (`src/types/sflist.ts`): Core domain model — `SFListDocument` contains an array of `SoundFontEntry` objects, each with optional gain, channels (1-48), and patch mappings (source→destination bank/program). `serializeDocument()` produces cleaned JSON output (omitting defaults).
- **Types** (`src/types/soundbank-info.ts`): `CachedPreset` / `CachedSoundBankInfo` for SF2/SF3 preset metadata.
- **Stores** (`src/stores/`):
  - `sflist-store` — the document state (entries, dirty flag, current filename). Persistence to localStorage is opt-in via `enablePersistence()`.
  - `soundbank-cache-store` — caches parsed SF2/SF3 preset lists using `spessasynth_core.SoundBankLoader`. Also localStorage-persisted.
- **Layout** (`src/layouts/MainLayout.vue`): Toolbar (new/open/save), right drawer with live JSON preview, and a storage consent gate that must be accepted before persistence activates.
- **Page** (`src/pages/IndexPage.vue`): Entry list with TransitionGroup animations, FAB for adding files. Handles file picking for both .sflist.json (loads as document) and SF2/SF3/SFZ (adds as entries).
- **Components** (`src/components/`): `SoundFontEntryCard` (per-entry card), `PresetPicker` (searchable preset selector from cached SF2 data), `PatchMappingEditor`/`PatchMappingList`, `ChannelSelector`, `GainInput`, `EmptyState`, `StorageConsent`.

### Key dependency

`spessasynth_core` — used solely for parsing SF2/SF3 files client-side to extract preset metadata (name, bank, program, isDrum). No audio playback.

## Quasar Config Notes

- Dark mode: `auto`
- Quasar plugins enabled: `LoadingBar`, `Dialog`, `Notify`
- Quasar auto-imports components — no need to register them manually
- Uses Material Icons
- Custom font: "Inter LoSnoCo" and "Iosevka LoSnoCo NoLig Web" loaded via `app.scss`
