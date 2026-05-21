# == Schema Information
#
# Table name: pokemons
#
#  id             :integer          not null, primary key
#  base_stats     :text
#  description    :text
#  generation     :integer
#  height_dm      :integer
#  image_url      :string
#  name           :string
#  pokemon_type   :string
#  secondary_type :string
#  weight_hg      :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  pokemon_id     :integer
#
# Indexes
#
#  index_pokemons_on_generation    (generation)
#  index_pokemons_on_name          (name) UNIQUE
#  index_pokemons_on_pokemon_id    (pokemon_id) UNIQUE
#  index_pokemons_on_pokemon_type  (pokemon_type)
#
require 'test_helper'

class PokemonTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
