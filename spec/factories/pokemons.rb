FactoryBot.define do
  factory :pokemon do
    sequence(:pokemon_id) { |n| n }
    sequence(:name) { |n| "mon#{n}" }
    pokemon_type { "grass" }
    image_url { "/pokemon/1.png" }
    height_dm { 7 }
    weight_hg { 69 }
    description { "A test pokemon." }
    generation { 1 }
    base_stats do
      { "hp" => 45, "attack" => 49, "defense" => 49,
        "special_attack" => 65, "special_defense" => 65, "speed" => 45 }
    end
  end
end
