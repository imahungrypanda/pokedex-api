class AddDetailFieldsToPokemons < ActiveRecord::Migration[7.2]
  def change
    add_column :pokemons, :height_dm,      :integer
    add_column :pokemons, :weight_hg,      :integer
    add_column :pokemons, :description,    :text
    add_column :pokemons, :generation,     :integer
    add_column :pokemons, :base_stats,     :text
    add_column :pokemons, :secondary_type, :string

    add_index :pokemons, :pokemon_id,   unique: true
    add_index :pokemons, :name,         unique: true
    add_index :pokemons, :pokemon_type
    add_index :pokemons, :generation
  end
end
