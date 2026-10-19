# EW Game UI

EW Game UI is a Vue and TypeScript interface for the game client. It is designed to run as a fixed UI surface inside a Chromium Embedded Framework (CEF) host, while disconnected browser mode supports day-to-day development without the game runtime.

The repository currently contains a working menu flow, a composable game HUD, a reusable component library, window and overlay infrastructure, localized text primitives, feature stores, and typed seams for future host integration. The application starts in disconnected mode; a concrete CEF transport and protobuf/WebSocket composition root are not present yet.

## Current product surface

The routed application currently provides:

- a connection screen, hero selection, hero deletion and character creation flow;
- a game HUD with chat, shortcut bars, skill presentation and cast feedback;
- player and target status, buffs, debuffs and toggle effects;
- party member, party control and squad control windows;
- video and input settings, including disconnected persistence and display-preview behavior;
- component and color reference views for UI development;
- development-only APIs and a debug window for exercising gameplay state without the host.

The menu and runtime-backed features use sample or empty disconnected gateways in browser development. Some window catalogue entries are explicit feature placeholders rather than completed product screens.

## Technology

- Vue 3 with the Composition API
- TypeScript with strict indexed-access checks
- Pinia for shared application and presentation state
- Vue Router with hash history for browser and local-file compatibility
- Vite for development and bundling
- Vitest, Vue Test Utils and jsdom for unit and component tests
- ESLint, Oxlint, Prettier and repository-specific audits

Node.js `22.18+` or `24.12+` and npm are required.

## Getting started

```sh
npm install
npm run dev
```

The development server opens the disconnected application in a normal browser. The default route redirects to the connection screen.

Useful routes:

| Route | Purpose |
| --- | --- |
| `#/menu` | Connect to the disconnected menu flow |
| `#/menu/select-hero` | Select and manage a hero |
| `#/menu/create-character` | Create a sample character |
| `#/game` | Exercise the game HUD |
| `#/components` | Browse shared component examples |
| `#/colors` | Inspect the color system |

## Commands

```sh
npm run dev                  # Start the Vite development server
npm run test:unit            # Run Vitest in watch mode
npm run type-check           # Check TypeScript and Vue types
npm run lint                 # Run repository checks and apply configured lint fixes
npm run audit:localization   # Audit shared-component copy and localization keys
npm run format               # Format source files
npm run build                # Type-check and create the production bundle
npm run preview              # Preview a production bundle
```

## Architecture

The UI is organized around a one-way feature flow:

```text
route view / window content
          |
          v
component + composable
          |
          v
      Pinia store
          |
          v
  service gateway selector
       /         \
      v           v
disconnected   connected adapter
gateway        (host transport seam)
```

Views render UI and coordinate user interactions. Pinia stores own shared state and feature lifecycles. Gateway interfaces isolate stores from the eventual game transport, while services select the appropriate gateway from the current runtime integration mode.

### Application shell and routing

`src/main.ts` creates Vue, Pinia and the router. In development it also installs selected browser-facing developer APIs for manipulating disconnected gameplay state.

`src/App.vue` provides the application-wide localization, icon, overlay/window and toast contexts. Route views are rendered inside those providers, so feature code can consume the shared facilities without creating parallel global systems.

The router uses hash history and a relative Vite base. This keeps navigation compatible with both a development server and a packaged local-file surface.

### Shared UI system

`src/shared/components/` contains the reusable `G*` component library, grouped by actions, collections, content, feedback, forms, layout, navigation and overlays. Stable exports live in `src/shared/components/index.ts`; components whose keyboard or selection contracts are still evolving are separated in `experimental.ts`.

Cross-cutting behavior lives beside the components:

- `src/shared/composables/` contains accessibility, localization, overlay, progress, state and window helpers;
- `src/shared/providers/` owns application-level context for icons, localization, overlays and toasts;
- `src/shared/services/`, `types/`, `utilities/` and `windows/` contain framework-independent contracts and calculations.

### Managed windows and overlays

`src/windows/appWindowCatalog.ts` is the central catalogue for application windows. A definition binds a stable window ID to content, accessible labels, behavior, size constraints and an initial position.

`GOverlayHost`, `useWindows()` and the `windowManager` store form the runtime window system. They validate catalogue entries, open or focus one managed instance per ID, maintain z-order, constrain geometry to the viewport and persist layouts in local storage when it is available. Persistent HUD elements and closable tool windows use the same infrastructure with different definitions.

### Feature state and runtime gateways

Feature contracts are organized under `src/services/` and `src/views/game/types/`; UI-facing state is under `src/stores/`. Implemented gateway-backed domains include buffs, debuffs, party state, game settings, target status and toggles. The menu has its own gateway contract for connection, hero selection and character creation.

The default `RuntimeIntegrationMode.Disconnected` selects browser-safe implementations. Several gameplay domains also expose connected adapters or configuration functions that accept a host transport. Those adapters are integration seams, not a finished transport layer: the repository does not currently create a WebSocket, load protobuf schemas or switch the application into connected mode at startup. The menu service also currently resolves to its disconnected gateway in both modes.

Runtime-facing stores validate snapshots and events before exposing them to components. Stateful domains use explicit revisions, lifecycle cleanup and resynchronization where appropriate. Temporary presentation concerns—window placement, dragging, selection and draft settings—remain separate from authoritative runtime-shaped data.

### Localization

Visible product copy is represented by a stable table and key contract:

```ts
{
  table: 'MENU',
  textKey: '#START_GAME',
}
```

`GText` resolves this content through the localization provider. The localization service caches table requests, falls back to the key when a value is absent and applies parameters after resolution. The current application loader serves local English tables from `src/localization/en/`; replacing that loader with a game-backed implementation does not require views to change.

Localization values are presentation data. Routes, action IDs, setting keys, telemetry keys and storage keys must remain stable identifiers rather than resolved copy.

### Styling and visual direction

Global styles are split by responsibility under `src/styles/`. Design tokens and shared classes define the reusable visual language; feature styles build on those primitives. The intended aesthetic is a restrained, modern high-fantasy interface with strong readability and accessible interaction states.

Repository rules require relative CSS units, reuse of global classes where practical and centralized colors rather than colors declared inside Vue components. `npm run lint:relative-units` enforces the numeric `px` restriction across source and documentation files.

## Project map

```text
src/
  assets/          Local SVG and image assets
  localization/    Text contracts, local tables and the application loader
  services/        Runtime mode, feature gateways, adapters and developer APIs
  shared/          Reusable UI components and cross-cutting infrastructure
  stores/          Pinia domain and presentation stores
  styles/          Tokens, global rules and feature-level styles
  views/           Routed menu, HUD, debug and reference views
  windows/         Central application window catalogue
scripts/           Repository-specific source audits
docs/              Design-system documentation
```

Most feature tests are colocated as `*.spec.ts` files. Pure geometry, validation, mapping and time calculations are tested independently, while Vue Test Utils covers component behavior, accessibility and store-driven integration.

## Host integration boundary

The intended packaged architecture is:

```text
game runtime (authoritative)
          |
          | typed snapshots, events and requests
          v
host transport implementation
          |
          v
connected feature gateways
          |
          v
Pinia stores and Vue UI
```

When the host bridge is added:

- keep raw transport and serialization details behind the gateway boundary;
- configure all connected gateways before enabling connected runtime mode;
- validate every incoming payload before mutating store state;
- preserve message meaning and revision semantics across contract versions;
- handle startup order, reconnects, stale responses, revision gaps and unknown messages;
- keep the game authoritative for gameplay and runtime settings;
- verify rendering, keyboard and pointer input, navigation and asset loading in both the browser and CEF host.

Do not make views or visual components open sockets, decode transport messages or depend directly on host globals. Generated serialization code, when introduced, should be regenerated from its schema rather than edited by hand.

## Contribution notes

- Read `AGENTS.MD` before changing code or styles.
- Prefer existing shared components, composables, tokens and global classes before adding feature-local alternatives.
- Add or update colocated tests when behavior changes.
- Treat disconnected gateways as deterministic development adapters, not alternate sources of production authority.
- Keep browser-only persistence optional because storage can be unavailable in an embedded client.
- Preserve visible focus, keyboard navigation, reduced-motion support and readable contrast.

## Current limitations

- CEF hosting is an integration target; it is not configured by this repository.
- No concrete WebSocket or protobuf transport exists in the current source tree.
- Connected gateway seams are not composed into an application startup path.
- Localization currently uses bundled local tables rather than a game-owned loader.
- Several catalogue windows intentionally render placeholder content.
