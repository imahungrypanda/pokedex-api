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
class Pokemon < ApplicationRecord
  serialize :base_stats, coder: JSON

  validates :pokemon_id, presence: true, uniqueness: true
  validates :name,       presence: true, uniqueness: true
  validates :image_url,  presence: true
  validates :height_dm, :weight_hg, numericality: { greater_than: 0 }, allow_nil: true

  scope :ordered,     -> { order(:pokemon_id) }
  scope :by_type,     ->(t) { where('pokemon_type = :t OR secondary_type = :t', t: t) if t.present? }
  scope :search_name, ->(q) { where('LOWER(name) LIKE ?', "%#{q.downcase}%") if q.present? }
end
