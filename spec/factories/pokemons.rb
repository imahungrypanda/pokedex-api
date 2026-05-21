FactoryBot.define do
  factory :pokemon do
    sequence(:pokemon_id) { |n| n }
    sequence(:name) { |n| "mon#{n}" }
    pokemon_type { "grass" }
    image_url { "https://example.com/sprite.png" }
  end
end
