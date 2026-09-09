# Aretos

Frontend monorepo for Aretos. Every client the product ships — mobile, web, desktop and the
public site — lives here alongside the shared code they build on, so a change to shared logic
lands everywhere at once instead of being copy-pasted across repos.

## The monorepo

It's a plain [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) setup — no Turborepo,
Nx or Lerna. The root `package.json` declares the workspaces:

- `apps/*` — the deliverables: `mobile` (Expo / React Native), `web`, `desktop`, `www`
- `packages/core` — shared code consumed by the apps as `@aretos/core`

Everything is namespaced under `@aretos/*`, so an app depends on shared code the same way it
depends on anything from the registry:

```json
"dependencies": {
  "@aretos/core": "*"
}
```

npm links the workspace on install instead of downloading it; there is no build or publish step
in between. Dependencies are hoisted to a single root `node_modules` with one shared
`package-lock.json`, which keeps versions aligned across apps and makes a clean install one command.

Aside from `mobile`, the apps are still scaffolds.

## Getting started

Requires Node 20+ and npm 9+ (workspaces).

```bash
npm install          # installs every workspace from the root
```

Run a workspace by name:

```bash
npm run start -w @aretos/mobile     # Expo dev server
npm run ios -w @aretos/mobile
npm run android -w @aretos/mobile
```

Each app owns its own scripts and toolchain; the root only carries what's genuinely shared.

## Formatting

Prettier is configured once at the root and applies to the whole tree:

```bash
npm run format         # write
npm run format:check   # verify, for CI
```
