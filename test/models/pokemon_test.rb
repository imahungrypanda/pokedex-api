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
require 'test_helper'

class PokemonTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
