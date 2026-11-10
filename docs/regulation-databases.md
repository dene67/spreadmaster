# Regulation databases

Open General settings in the expanded left menu to select a database, export the active package, or import a new JSON package. Imported packages live in IndexedDB in this browser profile. The selected website database persists locally. Descriptions open through circled information icons or explicit detail buttons; only circled information icons show hover previews.

The bundled M-A, M-B and M-C packages use different eligible species, held items and learnsets. M-A is pinned to Showdown commit `3f1798ee9032eaa68448ca8637aed591edf55b0e`; M-B uses Showdown's archived `championsregmb` module. Each package contains its source and official announcement URL.

## Package schema (version 1)

Use Export active database for a complete template. Required properties:

- `schemaVersion`: `1`.
- `id`: stable lowercase identifier (letters, numbers and hyphens).
- `name`: display name.
- `metadata`: `regulation`, `level: 50`, `maxSP: 32`, `totalSP: 66`; optional `window`, `checkedAt` and HTTPS source URLs.
- `species`: complete eligible roster; each entry needs canonical `id`, `name`, numeric `num`, `types`, six numeric `baseStats`, and `abilities`.
- `items`: array of legal item names or an ID-to-name object.
- `learnsets`: complete Pokémon-ID-to-move-ID arrays, including alternate forms.

Optional `moveOverrides` supports power, accuracy, PP, priority, category and type. Optional `moveDetails`, `itemDetails` and `abilityDetails` supply descriptions. Description entries use canonical identifiers and plain text; item/ability entries accept `description` and `notes` (an array of paragraphs), while moves accept `fullDesc` and `shortDesc`.

The importer validates packages before showing the import review. Pokémon and moves must be supported by the installed damage engine. Imports change availability, species stats/types and the supported move properties, not executable battle callbacks. New battle mechanics require a compatible engine update.

## Teams

Teams store `regulationId` in workspace backups and undo history. Existing teams from the original M-C-only workspace are marked M-C. New teams inherit the active website regulation. Change a team's assignment using Target Regulation in its toolbar.

A mismatch badge compares website and team assignments. Legality warnings use the team's assigned package (species, item, ability, move pool, SP limits, duplicate species and duplicate items). A missing custom package is reported separately; installing its package restores validation. Incomplete teams show a member count rather than being marked illegal solely for having fewer than six members.

The built-in presets describe end-of-regulation availability, with the installed Champions battle engine. They do not reconstruct changes to availability within a regulation's individual ranked seasons.

## Team folders and backups

Workspace import/export is in General settings. Folders are stored as `teamFolders` (`id`, `name`) and teams reference them with `folderId`. A removed folder moves its teams to Unfiled. Folder changes participate in workspace undo/redo. Folder collapse preferences are local display settings.
