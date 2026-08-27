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
require 'rails_helper'

RSpec.describe Pokemon, type: :model do
  describe 'validations' do
    it 'requires pokemon_id, name, and image_url' do
      pokemon = described_class.new
      expect(pokemon).not_to be_valid
      expect(pokemon.errors[:pokemon_id]).to include("can't be blank")
      expect(pokemon.errors[:name]).to include("can't be blank")
      expect(pokemon.errors[:image_url]).to include("can't be blank")
    end

    it 'enforces uniqueness on pokemon_id' do
      create(:pokemon, pokemon_id: 1)
      duplicate = build(:pokemon, pokemon_id: 1)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:pokemon_id]).to include('has already been taken')
    end

    it 'enforces uniqueness on name' do
      create(:pokemon, name: 'pikachu')
      duplicate = build(:pokemon, name: 'pikachu')
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to include('has already been taken')
    end

    it 'rejects non-positive height_dm and weight_hg but allows nil' do
      expect(build(:pokemon, height_dm: 0)).not_to be_valid
      expect(build(:pokemon, weight_hg: -1)).not_to be_valid
      expect(build(:pokemon, height_dm: nil, weight_hg: nil)).to be_valid
    end
  end

  describe 'base_stats serialization' do
    it 'round-trips a hash through the database' do
      stats = { 'hp' => 45, 'attack' => 49, 'defense' => 49,
                'special_attack' => 65, 'special_defense' => 65, 'speed' => 45 }
      pokemon = create(:pokemon, base_stats: stats)
      expect(pokemon.reload.base_stats).to eq(stats)
    end
  end

  describe 'scopes' do
    let!(:bulbasaur) do
      create(:pokemon, pokemon_id: 1, name: 'bulbasaur', pokemon_type: 'grass', secondary_type: 'poison')
    end
    let!(:charmander) { create(:pokemon, pokemon_id: 4, name: 'charmander', pokemon_type: 'fire') }
    let!(:pikachu) { create(:pokemon, pokemon_id: 25, name: 'pikachu', pokemon_type: 'electric') }

    describe '.ordered' do
      it 'orders by pokemon_id ascending' do
        expect(described_class.ordered.pluck(:pokemon_id)).to eq([1, 4, 25])
      end
    end

    describe '.by_type' do
      it 'matches the primary type' do
        expect(described_class.by_type('fire')).to contain_exactly(charmander)
      end

      it 'matches the secondary type too' do
        expect(described_class.by_type('poison')).to contain_exactly(bulbasaur)
      end

      it 'returns all records when blank' do
        expect(described_class.by_type(nil).count).to eq(3)
        expect(described_class.by_type('').count).to eq(3)
      end
    end

    describe '.search_name' do
      it 'matches a case-insensitive partial' do
        expect(described_class.search_name('PIKA')).to contain_exactly(pikachu)
        expect(described_class.search_name('char')).to contain_exactly(charmander)
      end

      it 'returns all records when blank' do
        expect(described_class.search_name(nil).count).to eq(3)
      end
    end
  end
end
