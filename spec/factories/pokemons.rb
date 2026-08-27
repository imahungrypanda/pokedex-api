# frozen_string_literal: true

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
FactoryBot.define do
  factory :pokemon do
    sequence(:pokemon_id) { |n| n }
    sequence(:name) { |n| "mon#{n}" }
    pokemon_type { 'grass' }
    image_url { '/pokemon/1.png' }
    height_dm { 7 }
    weight_hg { 69 }
    description { 'A test pokemon.' }
    generation { 1 }
    base_stats do
      { 'hp' => 45, 'attack' => 49, 'defense' => 49,
        'special_attack' => 65, 'special_defense' => 65, 'speed' => 45 }
    end
  end
end
