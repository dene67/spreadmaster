# SPREADMASTER

A modular, local-first Pokémon Champions workspace. Version 0.2 adds the current M-C roster, Champions Stat Points, complete speed matchup groups, team handoffs, Poképaste import/export, and a moth-inspired identity.

## Run the verified browser version

With Node.js 22 or newer:

```sh
node scripts/serve.mjs
```

Open http://127.0.0.1:5173. No npm installation is needed for the browser app. The bundled data, calculation engine and sprites work offline; fetching a Poképaste link requires an internet connection.

## Champions format

- Level 50, at most **66 Stat Points total**, at most **32 SP per stat**.
- HP = base + 75 + SP. Other stats = floor((base + 20 + SP) × nature multiplier).
- No configurable IVs or Tera controls.
- Roster restricted to the machine-readable **Regulation M-C snapshot checked on 2026-11-04**: 343 forms, including eligible Mega Evolutions and regional forms. Regulation window: 2026-09-09 through 2026-12-02.
- Base stats and learnable moves come from local Pokémon Showdown snapshots. Held items are limited by the regulation item list. Set ability selection uses the selected Pokémon's abilities.
- This is a dated, replaceable snapshot, not an automatically updating official game API.

## Speed matchups

All roster icons are rendered, without pagination or hidden “more” rows. Scroll the page to inspect the complete roster.

1. **Always faster:** even the opponent's 0-SP, neutral-alignment Speed beats your benchmark. Enable “Include negative Speed alignment” above the lists to include Speed-lowering natures in the comparison.
2. **Potentially faster:** some investment/alignment can beat the benchmark, but their minimum does not.
3. **Always slower:** even 32 SP with a positive Speed alignment remain slower. A clearly labeled “Can tie, never outspeed” subsection handles exact ties separately.

Click any icon to see the minimum opposing investment to outspeed you with neutral or positive alignment. The reverse comparison shows your minimum SP against both opposing alignments at a configurable opposing investment. It includes columns for your current alignment and a positive alignment. A tie is never treated as an outspeed. Impossible investments are reported explicitly. Team-loaded benchmarks flag when a solution requires reallocating points from other stats.

Within each section, Pokémon with the same base Speed and effective Speed range share a row. Different base stats remain separate even when battle modifiers make their rounded ranges equal, because their investment breakpoints can differ. The roster filter hides rows with no matching Pokémon. Sprite-first searchable selectors are available in Speed Matchups, the Team Builder and the Damage Calculator.

You and your opponents have separate battle modifiers: Speed stages, Tailwind, Choice Scarf, paralysis and a manually chosen ability multiplier. Ability activation is **not** inferred automatically from species or weather. Classification assumes the selected conditions and equal move priority; Trick Room is not a Speed-stat modifier.

## Teams and Poképaste

- Use the **Team Builder** for a compact team roster and direct set editing. Search team members by species, type, learnable move, ability, item, or saved move. Team lists show compact sprite rows.
- Create teams of up to six Pokémon and independent saved sets.
- Edit 0–32 SP in every stat with a live 66-SP budget and resulting stats.
- Team cards provide **Speed**, **Attack** and **Defend** actions. Both calculation areas also have a team picker.
- Import pasted team text or a `https://pokepast.es/<16-character-id>` link. Preview all Pokémon and conversion warnings before importing.
- Champions pastes conventionally place Stat Points in the `EVs:` line. Auto-detection treats values of 0–32 as SP; if any value exceeds 32, that set is treated as a legacy EV spread. Choose **Legacy EVs** explicitly for low-investment legacy text. `SPs:` and `Stat Points:` lines always mean SP.
- Legacy conversion preserves level-50 stat contributions: the first 4 EVs give one SP, and each subsequent 8 EVs give another. IVs/Tera are ignored with warnings; imported levels are normalized to 50. Invalid or over-budget spreads are rejected rather than silently trimmed.
- Export a Champions-compatible text paste, copy it, or download a `.txt` file. The export's `EVs:` line contains SP, not legacy EVs. This also preserves a full 66-SP spread without pretending it is a legal Scarlet/Violet EV spread.
- The **Open Poképaste** link lets you publish manually on that site. The app never publishes teams automatically.
- Complete JSON backup import/export remains available.

The old `volcarona-lab:v1` local workspace is migrated to the new point model when no SPREADMASTER workspace exists. The original stored key is retained. Sets outside the Champions roster remain in the library and are marked as unavailable; they cannot be used in active calculations without choosing an eligible species. A read failure does not deliberately overwrite the old storage.

## Damage calculator

Each side loads a saved Pokémon through **Open box** and provides its own live Stat Point sliders, numerical inputs and stat breakdown. Use **Save set** or **Overwrite set** to keep calculator changes. SP sliders respect the 32-per-stat and 66-total limits.
Uses the locally bundled **Smogon damage-calc 0.12.0** engine. The adapter converts SP to stat-equivalent EV values only at the engine boundary; user-facing values and descriptions remain Stat Points. All 343 roster forms were checked against the engine's raw stats.

Supports the selected sets' stats, nature, ability, item and moves; weather, terrain, stages, screens, Helping Hand, burns and doubles spread conditions. Shows damage range, percentage, OHKO threshold and damage rolls. Mega forms are selected explicitly from the roster when calculating evolved stats.

The primary damage range models full HP, one attack and no critical hits. An expandable panel estimates Spikes, Leech Seed and 50% recovery. Learnsets are bundled locally from Pokémon Showdown for searchable Pokémon selection. Complete team-wide legality clauses are not exhaustively validated. Additional Champions-specific changes beyond the bundled engine/data may require future patches.

## Identity and themes

Click the logo to toggle between classic Volcarona accents (orange / pale blue) and shiny-inspired accents (gold / lavender). Pokémon sprites also switch between their normal and shiny versions throughout the app. Both sprite sets are bundled locally, and the preference is saved locally.

## Source structure

```text
src/core/speed.js         Champions stats, speed groups, strict outspeed solver
src/core/calculator.js    Stat Point adapter for Smogon
src/core/paste.js         Paste parser, serialization and URL validation
src/core/storage.js       Point validation, local storage and legacy migration
src/core/data.js          Shared set model and data helpers
src/features/speed.js     Complete roster groups and matchup dialog
src/features/teams.js     Team builder, set editor and paste dialogs
src/features/calculator.js  Damage UI and team handoffs
src/app.js               Navigation, team picker and module registration
src/logo.js              Original moth-inspired SVG mark
src/style.css            Base layout and responsive components
src/champions.css        Champions layout, branding and theme tokens
public/data/champions.js Replaceable roster, item list and source metadata
scripts/pokepaste.cjs    Restricted, read-only Poképaste JSON fetcher
scripts/serve.mjs        Local preview and Poképaste proxy
desktop/                Electron shell, isolated preload and restricted IPC
```

Core modules do not depend on Electron and can be reused in a later mobile wrapper. Native Android/iOS builds have not been created.

## Build and test

```sh
node --test tests/core.test.js
node scripts/build.mjs
```

For Electron development on a machine with npm:

```sh
npm install
npm run build
npm start
npm run desktop:pack
```

The manually assembled Windows runtime is under `release/Volcarona Lab/`; its executable is named **SPREADMASTER.exe**. Keep the entire runtime directory together. The native launch previously exited before showing a window with code `0x80000003` in this execution environment. The cause is unresolved, and native desktop operation remains **unverified**. The browser version is the verified way to try the prototype. The alternative electron-builder portable build has not been run.

The old project directory is retained to preserve the running preview and local workspace. Product branding, package metadata and desktop window title are SPREADMASTER.

## Data provenance

- Official regulation announcement: https://www.pokemon.com/us/news/get-ready-for-regulation-set-m-c-in-pokemon-champions
- Official gameplay/regulation overview: https://champions.pokemon.com/en-us/gameplay/
- Available Pokémon reference: https://www.serebii.net/pokemonchampions/pokemon.shtml
- Machine-readable regulation species IDs and item facts: https://raw.githubusercontent.com/tinoxo/PokeCalc/main/data/champions-legality.json
- Stat Point reference: https://bulbapedia.bulbagarden.net/wiki/Stat_point
- Independently checked stat ordering and in-game examples: https://github.com/SebNotFound/champions-calc/blob/main/src/champions/stats.ts
- Base stats: https://github.com/smogon/pokemon-showdown — bundled snapshot, license in `public/data/LICENSE-showdown.txt`.
- Calculation engine: https://github.com/smogon/damage-calc — MIT license in `public/vendor/LICENSE-smogon.txt`.
- Sprites: https://github.com/PokeAPI/sprites — license in `public/sprites/LICENCE.txt`. Normal and shiny roster sprites are saved locally. `public/data/shiny-sprite-fallbacks.json` records any shiny form fallbacks or missing files; the current snapshot has none.
- Poképaste format and service: https://pokepast.es/
- Electron 45.2.2 runtime: https://github.com/electron/electron — official release archive SHA-256 verified; licenses included with the runtime.

`node scripts/update-champions.mjs` rebuilds the roster snapshot from the recorded source using the bundled dex. Review the regulation window and refresh the checked date deliberately when updating. `node scripts/fetch-champions-sprites.mjs` downloads the corresponding normal form sprites, and `node scripts/fetch-shiny-sprites.mjs` downloads shiny variants.

Pokémon and character designs belong to their respective rights holders. This is an unofficial fan project. Tool licenses do not transfer character or trademark rights.

## Verification

Twelve passing Node tests cover stat math for every SP value across bases/natures; in-game rounding examples; roster coverage and local sprite existence; strict speed-tie boundaries and minimality; all roster forms through the damage adapter; a damage benchmark; the 66/32 budget; Poképaste roundtrips; legacy EV conversion; invalid imports; non-destructive workspace migration; and restricted paste URLs.

Browser checks cover the three rendered speed sections and all 343 clickable icons, reciprocal Garchomp investment analysis, Champions paste preview/import/export, direct team-to-speed and team-to-defender actions, the calculator team picker, Shiny theme switching, and a successful real Poképaste-link fetch. Desktop startup and native mobile packaging remain unverified.
