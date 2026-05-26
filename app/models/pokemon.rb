class Pokemon < ApplicationRecord
  serialize :base_stats, coder: JSON

  validates :pokemon_id, presence: true, uniqueness: true
  validates :name,       presence: true, uniqueness: true
  validates :image_url,  presence: true
  validates :height_dm, :weight_hg, numericality: { greater_than: 0 }, allow_nil: true

  scope :ordered,     -> { order(:pokemon_id) }
  scope :by_type,     ->(t) { where("pokemon_type = :t OR secondary_type = :t", t: t) if t.present? }
  scope :search_name, ->(q) { where("LOWER(name) LIKE ?", "%#{q.downcase}%") if q.present? }
end
