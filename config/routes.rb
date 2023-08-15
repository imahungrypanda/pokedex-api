Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'pokemons/index'
      post 'pokemons/create'
      delete 'pokemons/:id', to: 'pokemons#destroy'
    end
  end

  root 'pokemons#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
