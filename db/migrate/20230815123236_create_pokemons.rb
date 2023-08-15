class CreatePokemons < ActiveRecord::Migration[6.0]
  def change
    create_table :pokemons, { id: false } do |t|
      t.integer :id, primary_key: true
      t.string :name
      t.string :pokemon_type
      t.string :image_url

      t.timestamps
    end
  end
end
