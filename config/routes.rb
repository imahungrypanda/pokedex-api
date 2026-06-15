# typed: true
# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'pokemon/index'
      get 'pokemon/:id', to: 'pokemon#show', constraints: { id: /\d+/ }
      post 'pokemon/create'
      delete 'pokemon/:id', to: 'pokemon#destroy'
    end
  end

  root 'pokedex#index'
  get '*path', to: 'pokedex#index', constraints: ->(req) { !req.path.start_with?('/api/', '/assets/') && !req.xhr? }
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end