require 'rails_helper'

RSpec.describe 'Api::V1::Pokemon', type: :request do
  describe 'GET /api/v1/pokemon/index' do
    it 'returns 200 with the seeded records' do
      create(:pokemon, pokemon_id: 1, name: 'bulbasaur')
      create(:pokemon, pokemon_id: 4, name: 'charmander', pokemon_type: 'fire')

      get '/api/v1/pokemon/index'

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.length).to eq(2)
      expect(body.map { |p| p['name'] }).to contain_exactly('bulbasaur', 'charmander')
    end
  end
end
