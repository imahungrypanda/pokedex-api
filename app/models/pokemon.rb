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
#
class Pokemon < ApplicationRecord
end
