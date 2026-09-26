# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Folder structure

Expo's official recommendation (kebab-case filenames, named exports,
colocation) plus a `features/` layer for domain logic.

```
src/
  app/          routes only — a screen composes, it does not implement
  components/   all UI, grouped by what it serves
    common/       no domain knowledge: error-notice, screen-loader
    auth/         renders the auth feature
    ui/           design-system pieces (see below — not created yet)
  features/     domain logic only: requests, hooks, types. No components.
  lib/          app-wide infrastructure: api client, i18n, env
  providers/    React context mounted at the root
```

Dirs in the reference structure that do not exist here yet, and what creates
them: `hooks/` (a hook two features both use), `types/` (a type two features
both use), `utils/` (a pure helper, with its test beside it), `constants/`
(theme metrics, non-env config), `store/` (client state — server state is
already React Query's job, so this may never be needed). Create one when the
second consumer appears; an empty folder is an invitation to fill it badly.

`components/ui/` is the design system. Tamagui already is ours, so it stays
empty until we wrap it — a themed `Button` variant, a `Card` with our
elevation. Reach for `tamagui.config.ts` and `themes.ts` first; a wrapper that
only re-passes props belongs in neither place.

## The one dependency rule

```
app/  →  components/  →  features/  →  lib/
```

Imports only ever point right. A component may use a feature's hooks; a
feature never imports a component. `lib/` imports nothing above it — that is
why `lib/api/client.ts` takes an injected `AuthBridge` instead of importing
the session, and `features/auth/refresh.ts` supplies it.

This is what keeps features portable: `features/auth` is a folder of requests
and hooks with no JSX in it, so it can be read, tested, or replaced without
opening a single component.

## Where a component goes

`src/components/<domain>/` when it touches one feature, `src/components/common/`
when it touches none. `sign-out-button.tsx` is a button with an icon, but it
calls `useSignOut`, so it is `components/auth/`. `error-notice.tsx` takes a
string and renders it, so it is `components/common/`.

A component that starts in a domain folder and gains a second, unrelated
caller moves to `common/` — a one-line import change, so do it then rather
than guessing up front.

## Adding a feature

A feature is one domain's data and logic. Copy this shape:

```
src/features/goals/
  types.ts        wire types + domain types
  api.ts          query keys and request functions — plain async, no React
  hooks.ts        useQuery / useMutation wrapping api.ts
  index.ts        public surface — nothing outside imports deeper than this
```

Its screens go in `src/components/goals/`, its routes in `src/app/`. Split a
flat file into a folder (`hooks/use-goals.ts`) only once it earns it.

- **Import features through `index.ts`,** never a deep path.
- **Use `api` from `@/lib/api`** for anything authenticated. It attaches the
  token, refreshes ahead of expiry, and replays once on 401. `publicApi` exists
  only for endpoints that mint credentials.
- **Errors are `ApiError`.** Branch on `error.code` — the backend's contract in
  `internal/api/errors/codes.go` — never on the message.

`features/auth` is the reference implementation. It carries two files beyond
the template (`session.ts`, `refresh.ts`) because it is the one feature that
owns the session; a CRUD feature needs neither.

## Writing form copy

A form is a blank page the person fills in their own way. Aretos is not an
assistant interviewing them, so the copy around a free-text input names the
field and never suggests what to write in it.

- **A placeholder names what the field holds,** as a short noun phrase:
  `Nombre de la meta`, `Detalles de la meta`, `Tu nota`. A field whose job is
  an action may name the action instead: `Añadir una etiqueta`.
- **Never a question.** `¿Por qué te importa?` on a goal's description reads as
  something to answer, and the person writes "because I want to" in a field
  meant for anything they care to say about the goal.
- **Never an example or a template.** `Ej. Llega a tiempo` gets copied, or
  quietly narrows what feels allowed. A fill-in pattern like `Si… entonces…`
  does the same.
- **Hints explain; they do not model an answer.** A hint may say what the field
  is for or why it helps ("deciding when and where beforehand raises the
  odds"). It does not show a sample entry.
- **The label carries the meaning.** A placeholder disappears on the first
  keystroke, so nothing the person needs in order to understand the field may
  live only there.

A title above a set of fixed options — a choice, not a text field — may be a
question, because the options are its answers: `¿Cómo lo registras?`.
