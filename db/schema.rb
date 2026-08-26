# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_21_194334) do
  create_table "pokemons", force: :cascade do |t|
    t.integer "pokemon_id"
    t.string "name"
    t.string "pokemon_type"
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "height_dm"
    t.integer "weight_hg"
    t.text "description"
    t.integer "generation"
    t.text "base_stats"
    t.string "secondary_type"
    t.index ["generation"], name: "index_pokemons_on_generation"
    t.index ["name"], name: "index_pokemons_on_name", unique: true
    t.index ["pokemon_id"], name: "index_pokemons_on_pokemon_id", unique: true
    t.index ["pokemon_type"], name: "index_pokemons_on_pokemon_type"
  end
end
