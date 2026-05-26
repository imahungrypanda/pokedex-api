# frozen_string_literal: true

module Api
  module V1
    class PokemonController < ApplicationController
      skip_before_action :verify_authenticity_token

      # GET /pokemon or /pokemon.json
      def index
        # TODO: implement pagination
        # ex: page_number = 1
        @pokemon = Pokemon.all
        render json: @pokemon
      end

      def show
        pokemon = Pokemon.find_by(pokemon_id: params[:id])
        return render(json: { error: 'Not found' }, status: :not_found) unless pokemon

        render json: pokemon
      end

      # POST /pokemon or /pokemon.json
      def create
        @pokemon = Pokemon.new(id: params[:id], name: params[:name])

        @pokemon.save

        render json: @pokemon
      end
    end
  end
end
