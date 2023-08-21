# == Schema Information
#
# Table name: pokemons
#
#  id           :integer          not null, primary key
#  image_url    :string
#  name         :string
#  pokemon_type :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  pokemon_id   :integer
#

class Pokemon < ApplicationRecord
  validates :pokemon_id, presence: true
  validates :name, presence: true
  validates :name, uniqueness: true
  validates :image_url, presence: true
end
