# Pokédex API

A Rails + React application for managing and browsing Pokémon data. RESTful API backend with a React frontend using Ant Design.

## Tech Stack

- **Backend**: Ruby on Rails 7.2
- **Frontend**: React 18 with Ant Design
- **Database**: SQLite3 (development)
- **JS Bundling**: esbuild (via jsbundling-rails)
- **Testing**: RSpec + FactoryBot

## Prerequisites

- **Ruby**: 3.4.5 (see `.ruby-version` / `.tool-versions`)
- **Node.js**: 22+ (see `.tool-versions`)
- **Yarn**: 1.22+
- **SQLite3**

## Installation

```bash
bundle install
yarn install
bin/rails db:setup
```

`db:setup` creates the SQLite database, runs migrations, and loads seeds.

## Running the App

```bash
bin/dev
```

`bin/dev` uses Foreman to run two processes together (defined in `Procfile.dev`):
- Rails server on port 3000
- esbuild in watch mode, rebuilding `app/assets/builds/application.js` on every change

The app is available at <http://localhost:3000>.

> If you don't have Foreman installed, `bin/dev` will install it on first run.

### Running them separately

```bash
# terminal 1
bin/rails s

# terminal 2
yarn build --watch
```

## Testing

```bash
bundle exec rspec
```

## Build Notes

- esbuild compiles `app/javascript/application.js` into `app/assets/builds/application.js`. The build is configured in `package.json` under `scripts.build`, including `--loader:.js=jsx` so JSX in `.js` files works.
- Sprockets is used only to serve the built JS (digest fingerprinting, asset linking). No CSS bundling — Ant Design ships its own CSS-in-JS.

## API Endpoints

- `GET /api/v1/pokemon/index` — List all Pokémon
- `POST /api/v1/pokemon/create` — Create a Pokémon
- `DELETE /api/v1/pokemon/:id` — Delete by Pokédex ID *(route exists; handler not yet implemented — see [docs/plans/full-pokedex-buildout.md](docs/plans/full-pokedex-buildout.md))*

See [docs/api_testing.md](docs/api_testing.md) for curl examples.

## Project Structure

```
pokedex-api/
├── app/
│   ├── controllers/
│   │   └── api/v1/             # JSON API controllers
│   ├── models/                 # ActiveRecord models
│   ├── javascript/
│   │   ├── application.js      # esbuild entrypoint, mounts React
│   │   └── components/         # React components
│   └── assets/builds/          # esbuild output (gitignored)
├── config/                     # Rails configuration
├── db/                         # Schema, migrations, seeds
├── docs/
│   ├── api_testing.md          # curl examples
│   ├── user_stories.md         # Product intent + outstanding tasks
│   ├── interview_summaries.md
│   └── plans/                  # Multi-phase build-out plan
├── spec/                       # RSpec specs + factories
└── public/                     # Static assets
```

## Plan

Active build-out plan in [docs/plans/full-pokedex-buildout.md](docs/plans/full-pokedex-buildout.md) — turns this skeleton into a full pokedex (schema expansion + PokeAPI seed, REST + GraphQL, RSpec coverage, antd UI overhaul).
