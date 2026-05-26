# frozen_string_literal: true

# Delegate to the pokedex:seed rake task, which pulls real data from PokeAPI.
# Pass LIMIT=N to cap (useful for tests / CI).
Rake::Task['pokedex:seed'].invoke
