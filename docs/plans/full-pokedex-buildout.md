# Full Pokedex Build-Out Plan

## Context

`pokedex-api` is currently an interview-challenge skeleton (Rails 6.0.6.1 + React 18 + Webpacker 4) with intentional bugs documented in `docs/user_stories.md`. The goal of this initiative is to turn it into a real, polished pokedex application:

- Fix the backend bugs (pagination, POST param mapping, error responses, missing DELETE)
- Expand the schema with rich PokeAPI data (height, weight, stats, description)
- Fix the broken seed image URLs (every entry currently points to Bulbasaur's sprite)
- Add a GraphQL layer alongside REST
- Write meaningful RSpec coverage
- Overhaul the React UI into a responsive antd card grid + detail page with React Router
- Upgrade Ruby and gems to current versions
- Audit and modernize the frontend build pipeline (Webpacker 4 is end-of-life)

Most JS dependencies are already in place (antd 5.8, react-router-dom 6.15). RSpec 5 + factory_bot_rails are already in the Gemfile. The main net-new gem is `graphql` + dev-only `graphiql-rails`.

## Decisions

- **UI**: Card grid + detail page, React Router (`/`, `/pokemon/:pokemonId`, `/new`)
- **Detail data**: Expand schema (`height_dm`, `weight_hg`, `description`, `generation`, `base_stats` JSON, `secondary_type`); backfill from PokeAPI
- **Seed cutoff**: **Gen 1 (151)** by default. Pulls ~300 HTTPS calls during `db:seed` (~30–60s). Idempotent loader means future gens can be backfilled by bumping `SEED_LIMIT`
- **GraphQL**: alongside REST. UI stays on REST, centralized in `api/pokemon.js` so swap is easy later
- **Lookups by `pokemon_id`** (dex number) not AR primary key — URLs match what users see (`/pokemon/25` = Pikachu)
- **Branch**: `feature/full-pokedex` cut from `main`

---

## Phase 0 — Toolchain upgrade

Tackled first because everything else (gem versions, frontend build) depends on this baseline.

### Ruby

- Current: **3.3.0** (`.tool-versions`, `.ruby-version`, `Gemfile`)
- Target: **3.4.5** (already installed locally via rbenv)
- Files: `.tool-versions`, `.ruby-version`, `Gemfile` (`ruby '3.4.5'`)
- Why 3.4 over staying on 3.3: language improvements (`it` block param, frozen string literal default-warning, `Array#fetch_values`), security/perf patches, and aligns with the Rails 7.1 target. Rails 6.0 has not been formally tested against Ruby 3.4 — deprecation warnings during the brief 6.0+3.4 overlap are expected and tolerable, since we move to Rails 7.1 immediately after
- Verify: `rbenv local 3.4.5`; `ruby -v`; `bundle install`; `bin/rails runner 'puts RUBY_VERSION'`

### Rails & core gems

- Current: Rails **6.0.6.1**
- Rails 6.0 is **end-of-life** (no security patches since June 2023). Target: **Rails 7.1.x** (latest 7.1 patch). Why not 7.2 or 8.0?
  - 7.1 is the smallest jump from 6.0 that still gets us out of EOL
  - 7.2 + 8.0 introduce more breaking changes (Solid Queue, propshaft default, etc.)
  - Two-step upgrade (6.0 → 6.1 → 7.0 → 7.1) is the Rails Guides–recommended path
- Files: `Gemfile`, `Gemfile.lock`, `config/application.rb`, `config/environments/*.rb`, `bin/setup`, possibly new framework defaults initializer
- Process: bump one minor at a time, run `rails app:update`, run `bundle exec rspec` between hops, accept new framework defaults via `config.load_defaults 7.1`

### Other gems to refresh

- `sqlite3 ~> 1.4` → `~> 2.0` (Rails 7.1 compatible)
- `puma ~> 4.1` → `~> 6.4` (Puma 4 is unsupported)
- `webpacker ~> 4.0` → **replace** (see Phase 0 frontend section below)
- `sass-rails` → likely drop entirely (antd 5 uses CSS-in-JS, no sass needed)
- `turbolinks ~> 5` → drop (Rails 7+ uses Turbo via `turbo-rails`; for a React SPA we don't need either)
- `jbuilder ~> 2.7` → `~> 2.11` (or drop if we standardize on `render json:` envelopes)
- `bootsnap` → `~> 1.18`
- `spring`, `spring-watcher-listen` → drop (Spring is deprecated; Rails 7 uses Bootsnap)
- `rspec-rails ~> 5.0` → `~> 6.1`
- `web-console`, `listen` → version bumps to match Rails 7.1 compatibility matrix

### Frontend build pipeline audit

Webpacker 4 is **end-of-life and unmaintained**. Two viable replacements:

| Option | Pros | Cons |
|---|---|---|
| **Shakapacker 7** | Webpack-based; closest migration path from Webpacker; community-maintained fork | Still webpack — heavier than esbuild; npm install churn |
| **jsbundling-rails + esbuild** | Rails 7 default; tiny config; fast builds | Requires moving from `app/javascript/packs/` to `app/javascript/` + `app/assets/builds/`; loses Webpacker's automatic React preset wiring |
| **Vite Rails** | Fastest dev server; modern DX; HMR works well | Less Rails-conventional; smaller community in Rails ecosystem |

**Recommendation: jsbundling-rails + esbuild**. Reasons:
- It's the Rails 7.1 default — least friction with the framework
- esbuild builds are 10–50× faster than webpack
- antd 5 + react-router + a handful of components is well within esbuild's sweet spot (no CSS Modules / no SSR complexity)
- Smaller config surface = less drift over time

Migration steps:
1. Add `gem "jsbundling-rails"` and `gem "cssbundling-rails"` (cssbundling not strictly needed since antd is CSS-in-JS, but useful for app-level CSS)
2. Run `bin/rails javascript:install:esbuild`
3. Move `app/javascript/packs/index.jsx` → `app/javascript/application.js` (entrypoint)
4. Move existing components from `app/javascript/packs/components/` → `app/javascript/components/`
5. Update `app/views/layouts/application.html.erb`: `javascript_pack_tag 'index'` → `javascript_include_tag "application", defer: true`
6. Update `package.json` build scripts: `"build": "esbuild app/javascript/application.js --bundle --sourcemap --outdir=app/assets/builds --loader:.js=jsx --loader:.jsx=jsx"`
7. Delete `config/webpacker.yml`, `config/webpack/*`, `bin/webpack*`, `babel.config.js`, `postcss.config.js` (esbuild handles JSX natively without Babel)
8. Add `Procfile.dev` for `bin/dev` (Rails 7 standard): runs Rails + `yarn build --watch` together
9. Update `.gitignore` for `app/assets/builds/`

Verify: `bin/dev` boots both processes; hot-rebuild on edit; `bin/rails assets:precompile` produces a working production bundle; the React app still mounts at `/`.

---

## Phase 1 — Schema expansion & seed enrichment

**Goal**: extend `pokemons` with detail-page fields and replace broken image URLs with real PokeAPI data. Satisfies the "View Pokemon Detail" user story and underpins the detail page in Phase 5.

### Migration

`db/migrate/<timestamp>_add_detail_fields_to_pokemons.rb`:

```ruby
add_column :pokemons, :height_dm,      :integer         # decimeters from PokeAPI
add_column :pokemons, :weight_hg,      :integer         # hectograms
add_column :pokemons, :description,    :text            # English flavor text
add_column :pokemons, :generation,     :integer         # 1..N
add_column :pokemons, :base_stats,     :text            # JSON-as-text (SQLite)
add_column :pokemons, :secondary_type, :string
add_index  :pokemons, :pokemon_id, unique: true
add_index  :pokemons, :name,       unique: true
add_index  :pokemons, :pokemon_type
add_index  :pokemons, :generation
```

### Model updates — `app/models/pokemon.rb`

- `serialize :base_stats, JSON` (Rails 7.1 syntax: `serialize :base_stats, coder: JSON`)
- Numericality validations on `height_dm`, `weight_hg` (allow_nil)
- Scopes:
  - `scope :by_type, ->(t) { where("pokemon_type = :t OR secondary_type = :t", t: t) if t.present? }`
  - `scope :search_name, ->(q) { where("LOWER(name) LIKE ?", "%#{q.downcase}%") if q.present? }`
  - `scope :ordered, -> { order(:pokemon_id) }`

### Seed loader — `lib/tasks/pokedex_seed.rake` (NEW)

- Task `pokedex:seed[limit]` (default 151; `SEED_LIMIT` env var override)
- `Net::HTTP` (stdlib) → `https://pokeapi.co/api/v2/pokemon/{id}` + `/pokemon-species/{id}`
- Mapping:
  - `pokemon_id` ← `id`
  - `name` ← `name.capitalize`
  - `pokemon_type` ← `types[0].type.name`
  - `secondary_type` ← `types[1]&.type&.name`
  - `image_url` ← `sprites.other["official-artwork"].front_default` (fallback to `sprites.front_default`)
  - `height_dm`, `weight_hg` ← direct
  - `base_stats` ← hash `{ hp:, attack:, defense:, special_attack:, special_defense:, speed: }`
  - `description` ← first English flavor text, with `\n\f` stripped
  - `generation` ← parsed from species `generation.url` (e.g. `/generation/1/`)
- `find_or_initialize_by(pokemon_id:)` → idempotent. **This is also how we fix the broken image URLs**: re-running on existing data updates `image_url` (and every other column) to the correct PokeAPI sprite.
- `sleep 0.1` between requests as a courtesy
- Log progress every 25 records
- Wrap in `ActiveRecord::Base.transaction` per batch of 25 for partial-failure recovery

### `db/seeds.rb`

Replace the 4013-line broken file with a one-liner:
```ruby
Rake::Task["pokedex:seed"].invoke(ENV.fetch("SEED_LIMIT", 151))
```

---

## Phase 2 — REST API fixes

Satisfies: pagination, fix POST bug, error responses, delete endpoint, detail endpoint, search/filter.

### `config/routes.rb`

Replace ad-hoc routes with a conventional resourceful block:

```ruby
namespace :api do
  namespace :v1 do
    resources :pokemon, only: [:index, :show, :create, :destroy]
  end
end
post "/graphql", to: "graphql#execute"
mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql" if Rails.env.development?
root "pokedex#index"
get "*path", to: "pokedex#index", constraints: ->(req) { !req.xhr? && req.format.html? }  # SPA fallback
```

The `*path` catch-all enables hard-reload on routes like `/pokemon/25`. It MUST come last and MUST filter on `req.format.html?` so it doesn't swallow JSON requests.

### `app/controllers/application_controller.rb`

Add `rescue_from`:
- `ActiveRecord::RecordNotFound` → 404 `{ error: ... }`
- `ActionController::ParameterMissing` → 400
- Validation failures → 422 `{ errors: [...] }`

### `app/controllers/api/v1/pokemon_controller.rb` — rewrite

- **`index`**: `page_number`/`per_page` (clamped 1..100), `q`, `type` params → `{ data: [...], meta: { page, per_page, total, total_pages } }`
- **`show`**: `Pokemon.find_by!(pokemon_id: params[:id])` → detail envelope
- **`create`**: fix the bug by aliasing `params[:id]` → `pokemon_id` inside `create_params`; permit `image_url` and all new columns; 201 on success, 422 on validation fail
- **`destroy`**: `find_by!(pokemon_id:)`, 204 on success, 404 via rescue_from

### `docs/api_testing.md`

Update curl examples to reflect new envelope, pagination params, `show`, `q`/`type`, DELETE by `pokemon_id`.

---

## Phase 3 — GraphQL alongside REST

### Gem additions

```ruby
gem "graphql", "~> 2.3"
group :development do
  gem "graphiql-rails"
end
```

Run `bundle exec rails generate graphql:install`.

### Type definitions

- `app/graphql/types/pokemon_type.rb` — fields mirror REST detail envelope
- `app/graphql/types/base_stats_type.rb` — explicit fields (hp/attack/defense/special_attack/special_defense/speed) rather than raw JSON, for proper schema introspection
- `app/graphql/types/all_pokemon_result_type.rb` — wrapper with `nodes`, `total`, `page`, `per_page`

### Queries — `app/graphql/types/query_type.rb`

- `pokemon(pokemonId:)` → `Pokemon.find_by(pokemon_id:)`
- `allPokemon(page:, perPage:, q:, type:)` → calls the same `Pokemon` scopes REST uses

### Mutations

- `app/graphql/mutations/create_pokemon.rb` — inputs mirror REST; returns `{ pokemon, errors }`
- `app/graphql/mutations/delete_pokemon.rb` — input `pokemonId`; returns `{ deletedPokemonId, errors }`
- `app/graphql/types/mutation_type.rb` — register both

Same scopes power REST and GraphQL → single source of truth for filter logic.

---

## Phase 4 — RSpec coverage

### Setup

- `spec/rails_helper.rb` — include `FactoryBot::Syntax::Methods`
- `spec/spec_helper.rb` — uncomment recommended block (random order, profile, focus)
- `spec/factories/pokemons.rb` — sequence-based factory covering all columns
- `spec/support/graphql_helper.rb` — `execute_query(q, vars)` helper, auto-required

### `spec/models/pokemon_spec.rb`

- Presence + uniqueness validations
- Scopes: `by_type`, `search_name` (case-insensitive partial), `ordered`
- `base_stats` serialize round-trip (assign hash, reload, expect hash)

### `spec/requests/api/v1/pokemon_spec.rb`

For each endpoint, at least one happy + one error path:

- **index**: envelope shape, pagination slice, `q`/`type` filtering, `per_page` clamp
- **show**: 200 detail, 404 on missing
- **create**: 201 with `id` → `pokemon_id` mapping, `image_url` persisted; 422 missing fields; 422 dup pokemon_id
- **destroy**: 204 + row gone; 404 on missing

### `spec/graphql/`

- Query single + null case
- `allPokemon` with pagination/filter
- Both mutations: success + failure paths

### Optional

`spec/tasks/pokedex_seed_spec.rb` — mock HTTP, assert idempotency.

---

## Phase 5 — Frontend overhaul

Final component tree under `app/javascript/components/` (post-Phase 0 esbuild migration):

```
app/javascript/
├── application.js                     # entrypoint, wraps <App/> in <BrowserRouter>
├── components/
│   ├── app.jsx                        # <Routes>; import 'antd/dist/reset.css'
│   ├── api/pokemon.js                 # NEW: fetch wrappers (list/get/create/delete)
│   ├── layout/AppLayout.jsx           # NEW: antd <Layout> Header + Content
│   ├── Home/
│   │   ├── index.jsx                  # rewrite: grid + filters + pagination
│   │   ├── PokemonCard.jsx            # NEW: <Card> w/ image, name, type tags, delete
│   │   ├── PokemonGrid.jsx            # NEW: <Row gutter> of <Col xs sm md lg xl>
│   │   ├── FilterBar.jsx              # NEW: <Input.Search> + <Select type>
│   │   └── CreateForm.jsx             # rewrite w/ antd <Form>
│   ├── Detail/
│   │   ├── index.jsx                  # NEW: route /pokemon/:pokemonId
│   │   ├── StatsBar.jsx               # NEW: <Progress> per stat (max 255)
│   │   └── TypeTag.jsx                # NEW: colored <Tag>, reused on cards
│   └── common/
│       ├── LoadingSkeleton.jsx        # NEW
│       └── EmptyState.jsx             # NEW
└── constants.js                       # NEW: 18 canonical pokemon types
```

### Key wiring

- **`application.js`** — wrap `<App />` in `<BrowserRouter>` from `react-router-dom`
- **`app.jsx`** — `import 'antd/dist/reset.css'` (antd 5 ships `reset.css`, NOT `antd.css` — the current commented-out import is wrong)
- **`api/pokemon.js`** — single source for HTTP. Centralizing means swap to GraphQL stays trivial
- **Home state shape**: `{ data, meta: {page, perPage, total, totalPages}, filters: {q, type}, loading, error }`. Debounce search ~300ms
- **PokemonCard** — clickable via `<Link to=...>` (so middle-click works) → `/pokemon/:pokemonId`. Header `#001` + capitalized name. Type tag chips. Delete via antd `<Popconfirm>` → `message.success` + refetch
- **CreateForm** — antd `<Form>` with rules (numeric pokemon_id 1..1025, min name length, URL regex, type from constant). 422 → walk `errors[]` into per-field errors. Success → `message.success` + reset + `navigate('/')`
- **Detail** — `useParams()`, `getPokemon(pokemonId)`. Show image, both type tags, description, height in m (`dm/10`), weight in kg (`hg/10`), 6 `<Progress>` stat bars. 404 → antd `<Result status="404">`

---

## Phase 6 — Polish

- **Responsive grid**: `xs:24 sm:12 md:8 lg:6 xl:4` (1/2/3/4/6 columns)
- **Accessibility**: `alt={name}` on every image, semantic `<Link>` (not onClick), preserve antd focus rings, semantic headings on detail page
- **README update**: new endpoints, GraphQL URL, seed scope, env var, dev workflow (`bin/dev`), Ruby/Rails version notes
- **Performance**: image lazy-loading attribute (`<img loading="lazy">`), debounced search

### Optional / deferred

- Auth / CSRF protection (currently `skip_before_action :verify_authenticity_token` — fine for single-user demo)
- Image upload via ActiveStorage (already wired in Rails)
- GraphQL subscriptions
- Dark mode via antd `ConfigProvider`
- Full Gen 1–9 seed (just bump `SEED_LIMIT`)

---

## Critical files

**Modify:**
- `.tool-versions`, `Gemfile`, `Gemfile.lock`
- `config/application.rb`, `config/environments/*.rb`
- `app/models/pokemon.rb`
- `app/controllers/api/v1/pokemon_controller.rb`
- `app/controllers/application_controller.rb`
- `config/routes.rb`
- `db/seeds.rb`
- `app/views/layouts/application.html.erb` (esbuild migration)
- `spec/models/pokemon_spec.rb`
- `spec/requests/api/v1/pokemon_spec.rb`
- `spec/rails_helper.rb`
- `docs/api_testing.md`, `README.md`

**Create:**
- `db/migrate/<ts>_add_detail_fields_to_pokemons.rb`
- `lib/tasks/pokedex_seed.rake`
- `app/graphql/types/{pokemon_type,base_stats_type,all_pokemon_result_type}.rb`
- `app/graphql/mutations/{create_pokemon,delete_pokemon}.rb`
- All new components listed in Phase 5 tree
- `spec/factories/pokemons.rb`
- `spec/support/graphql_helper.rb`
- `spec/graphql/**` specs
- `Procfile.dev`

**Delete:**
- `config/webpacker.yml`, `config/webpack/*`, `bin/webpack*`
- `babel.config.js`, `postcss.config.js`
- `app/javascript/packs/` directory (after moving to `app/javascript/`)
- The "Part 1 — Backend fixes.md" note file (content is in `docs/user_stories.md`)

---

## Reusable existing code

- **antd 5.8** + **react-router-dom 6.15** already in `package.json` — no `yarn add`
- **rspec-rails** + **factory_bot_rails** already in Gemfile; `rails_helper.rb` exists
- **`pokedex#index`** + `app/views/pokedex/index.html.erb` — keep as SPA mount
- **`rescue_from` pattern** — conventional Rails error centralization

---

## Verification

After each phase:

### Phase 0 (toolchain)

```
asdf install ruby 3.3.6
bundle install
bin/rails -v                  # expect Rails 7.1.x
bin/dev                       # boots Rails + esbuild watcher
bundle exec rspec             # all green (empty specs, but suite runs)
```

Smoke: open `/`, confirm React app mounts; check Network tab for `application-<hash>.js` (not a `packs/` URL).

### Phase 1 (schema + seed)

```
bin/rails db:drop db:create db:migrate db:seed
bin/rails runner 'puts Pokemon.count; puts Pokemon.find_by(pokemon_id: 25).attributes'
```

Expect ~151 rows, Pikachu with height 4, weight 60, base_stats hash, description, and a working image_url.

### Phase 2 (REST)

```
curl 'localhost:3000/api/v1/pokemon?page_number=1&per_page=5' | jq
curl 'localhost:3000/api/v1/pokemon?q=pika&type=electric' | jq
curl 'localhost:3000/api/v1/pokemon/25' | jq
curl -X POST localhost:3000/api/v1/pokemon -H 'Content-Type: application/json' \
  -d '{"id":1025,"name":"Testmon","image_url":"https://x/y.png","pokemon_type":"normal"}'
curl -X DELETE localhost:3000/api/v1/pokemon/1025 -i     # 204
curl localhost:3000/api/v1/pokemon/9999 -i                # 404 JSON
curl -X POST localhost:3000/api/v1/pokemon -H 'Content-Type: application/json' -d '{}'  # 422
```

### Phase 3 (GraphQL)

Open `localhost:3000/graphiql`; run:
```graphql
query { pokemon(pokemonId: 25) { name pokemonType description baseStats { hp attack speed } } }
query { allPokemon(page:1, perPage:5, type:"fire") { total nodes { name } } }
mutation { createPokemon(input:{pokemonId:1026, name:"Gqmon", imageUrl:"https://x/y.png", pokemonType:"normal"}) { pokemon { id } errors } }
```

### Phase 4 (RSpec)

```
bundle exec rspec
```

All green. Coverage spans validations + every REST endpoint (success + error) + GraphQL queries + both mutations.

### Phase 5/6 (UI)

```
bin/dev
```

Browser checks:
- Grid renders with images (now correct!), names, type tags; responsive 1/2/3/4/6 col at xs/sm/md/lg/xl
- Search "char" filters live; type filter "fire" combines with search
- Pagination at bottom; page change fetches new slice
- Card click → detail with stats bars, description, height/weight converted to m/kg
- Delete → Popconfirm → toast → row removed
- `/new` empty submit → field errors; valid → toast + redirect
- Hard reload `/pokemon/25` works (SPA catch-all route)
- Tab through grid: visible focus rings
- VoiceOver reads alt text on each Pokemon image

---

## Risks & tradeoffs

1. **Rails 6 → 7.1 upgrade churn**: Multi-step jump (6.0 → 6.1 → 7.0 → 7.1). Risk: `config.load_defaults` changes can subtly break stuff. Mitigation: bump one minor at a time, run specs between hops, accept new framework defaults explicitly
1a. **Ruby 3.4 on Rails 6.0**: Rails 6.0 predates Ruby 3.4 by years and was never tested against it. Expect deprecation warnings (e.g. `URI::DEFAULT_PARSER`, `Net::HTTPResponse#body` quirks) during the brief overlap window. Mitigation: get to Rails 7.1 quickly; treat 3.4-on-6.0 as a transient state, not a destination
2. **Webpacker → esbuild migration**: changes file layout, build commands, and the JS entrypoint. Risk: production asset pipeline breakage. Mitigation: do this in Phase 0 (before any UI rewrite) so we land in a known-good state before touching React code
3. **SQLite + serialized JSON**: stats are read-only display data, not queried — fine. If filtering on stats becomes a need, migrate to Postgres with native JSONB
4. **PokeAPI flakiness during seed**: Gen 1 cutoff + idempotent upsert + `sleep 0.1` + progress logs. Fallback to fixture JSON in `spec/fixtures/` for CI if needed
5. **antd 5 bundle size**: ~1MB JS. esbuild does decent tree-shaking; bundle analyzer pass at the end of Phase 5 to confirm
6. **CSRF still skipped** on POST/DELETE: acceptable for single-user demo; document in README — don't ship multi-tenant without auth
7. **SPA fallback route ordering**: must be last and filter on `req.format.html?` — flag at review
8. **Route param `:id` = `pokemon_id`**: documented in `api_testing.md`. URLs match what users see (`/pokemon/25` = Pikachu, not whatever AR row it occupies)
9. **Scope creep**: subscriptions, uploads, auth, dark mode, full Gen 1–9, Ruby 3.4 — all flagged optional. Defer

---

## Execution order

Recommended commit/PR cadence (smaller PRs = easier review):

1. **PR 1**: Phase 0 — Ruby + Rails + frontend pipeline upgrade. **Big risk concentration, isolated.**
2. **PR 2**: Phase 1 + Phase 2 — schema + seed + REST API. Backend feature-complete.
3. **PR 3**: Phase 3 — GraphQL layer.
4. **PR 4**: Phase 4 — RSpec coverage. (Could be folded into PRs 2 & 3 instead — tests next to features.)
5. **PR 5**: Phase 5 + Phase 6 — UI overhaul + polish.

If preference is one big feature branch instead: keep this as the working doc and merge once at the end.
