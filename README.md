# README

Ruby version: 3.3.0 (see `.ruby-version`)
Node version: v18.20.8+ (tested with v18.20.8 and v22.14.0)

API Documentation: https://pokeapi.co/docs/v2#pokemon-section

## Setup

```bash
# Install dependencies
bundle install
yarn install --ignore-scripts

# Setup database
rake db:setup

# Compile frontend assets
./bin/webpack

# Start the server
rails s
```

## Notes

- Use `yarn install --ignore-scripts` to avoid build issues with deprecated `node-sass` dependency
- The `package.json` uses a `resolutions` field to redirect `node-sass` to modern `sass` (Dart Sass)



app/javascript/packs/components/Home/index.jsx


app/controllers/api/v1/pokemon_controller.rb
