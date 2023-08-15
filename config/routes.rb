Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'pokemon/index'
      post 'pokemon/create'
      delete 'pokemon/:id', to: 'pokemon#destroy'
    end
  end

  root 'pokemons#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
