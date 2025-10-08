# Pokédex API

A Rails + React application for managing and browsing Pokémon data. Features a RESTful API backend built with Rails and a modern React frontend with Ant Design.

## Tech Stack

- **Backend**: Ruby on Rails 6.0.6
- **Frontend**: React 18.2.0 with Ant Design
- **Database**: SQLite3 (development)
- **Build Tools**: Webpacker 4.0

## Prerequisites

### Required Software

- **Ruby**: 3.3.0 (see `.ruby-version`)
- **Node.js**: 18.20.8+ (tested with v18.20.8 and v22.14.0)
- **Yarn**: 1.22.22+
- **SQLite3**: For database
- **Bundler**: For Ruby gem management

## Installation

### 1. Install Runtime Versions
- Ruby 3.3.0
- Node.js 18.20.8+
- Yarn 1.22.22+

### 2. Install Dependencies

```bash
# Install Ruby gems
bundle install

# Install JavaScript packages
# Note: Use --ignore-scripts to avoid node-sass build issues
yarn install --ignore-scripts
```

### 3. Setup Database

```bash
# Create and seed the database
rails db:setup
# or
rake db:setup
```

### 4. Compile Frontend Assets

```bash
./bin/webpack
```

### 5. Start the Server

```bash
rails server
# or
rails s
```

The app will be available at `http://localhost:3000`

## API Documentation

### Endpoints

- `GET /api/v1/pokemon/index` - List all Pokémon
- `POST /api/v1/pokemon/create` - Create a new Pokémon

For detailed API testing examples with curl commands, see [docs/api_testing.md](docs/api_testing.md)

## Project Structure

```
pokedex-api/
├── app/
│   ├── controllers/
│   │   └── api/v1/          # API controllers
│   ├── models/              # ActiveRecord models
│   ├── javascript/packs/    # React components
│   └── views/               # Rails views
├── config/                  # Configuration files
├── db/                      # Database files
├── docs/                    # Documentation
│   └── api_testing.md       # API testing guide
├── public/                  # Static assets
└── test/                    # Test files
```

## Development Workflow

### Running the Application

```bash
# Terminal 1: Start Rails server
rails s

# Terminal 2: Start Webpack dev server (optional, for hot reloading)
./bin/webpack-dev-server
```

### Testing the API

Use the curl commands in [docs/api_testing.md](docs/api_testing.md) or tools like:
- curl
- Postman
- Insomnia

Example:
```bash
# List all Pokémon
curl http://localhost:3000/api/v1/pokemon/index

# Create a Pokémon
curl -X POST http://localhost:3000/api/v1/pokemon/create \
  -H "Content-Type: application/json" \
  -d '{"id": 25, "name": "Pikachu"}'
```
