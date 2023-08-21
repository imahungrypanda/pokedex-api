class CreatePokemons < ActiveRecord::Migration[6.0]
  def change
    create_table :pokemons do |t|
      t.integer :pokemon_id
      t.string :name
      t.string :pokemon_type
      t.string :image_url

      t.timestamps
    end
  end
end
