# frozen_string_literal: true

require 'net/http'
require 'json'

namespace :pokedex do
  desc 'Seed the database with Pokemon data from PokeAPI. Pass LIMIT=N to cap (default: all).'
  task seed: :environment do
    limit = ENV['LIMIT']&.to_i
    PokedexSeeder.new(limit: limit).run
  end
end

class PokedexSeeder
  API_BASE      = 'https://pokeapi.co/api/v2'
  CONCURRENCY   = 10
  LOG_EVERY     = 25
  IMAGE_DIR     = Rails.public_path.join('pokemon')

  def initialize(limit: nil)
    @limit = limit
  end

  def run
    total = @limit || discover_total
    FileUtils.mkdir_p(IMAGE_DIR)

    puts "Seeding #{total} pokemon from PokeAPI (concurrency=#{CONCURRENCY})."
    puts "This pulls #{total} records + downloads sprites to public/pokemon/."
    puts "Expect ~#{(total * 0.07).ceil}s on a typical connection."
    puts

    started_at = Time.zone.now
    records, failures = fetch_all(total)

    if failures.any?
      sample = failures.first(5).join(', ')
      sample += '...' if failures.size > 5
      warn "  [warn] #{failures.size} pokemon failed to fetch: #{sample}"
    end

    puts "Fetched #{records.size}/#{total} records in #{(Time.zone.now - started_at).round(1)}s. Writing to DB..."
    write(records)

    elapsed   = (Time.zone.now - started_at).round(1)
    image_mb  = Dir[IMAGE_DIR.join('*.png')].sum { |f| File.size(f) } / 1_048_576.0
    puts "Done in #{elapsed}s. Pokemon.count = #{Pokemon.count}. Sprites: #{image_mb.round(1)} MB in public/pokemon/."
  end

  private

  def discover_total
    res = get_json("#{API_BASE}/pokemon?limit=1")
    res.fetch('count')
  rescue StandardError => e
    abort "Could not reach PokeAPI (#{e.class}: #{e.message}). Pass LIMIT=N to skip discovery, or check your network."
  end

  def fetch_all(total)
    queue    = (1..total).to_a
    mutex    = Mutex.new
    results  = []
    failures = []
    fetched  = 0

    workers = Array.new(CONCURRENCY) do
      Thread.new do
        loop do
          id = mutex.synchronize { queue.shift }
          break unless id

          begin
            row = fetch_one(id)
            mutex.synchronize do
              results << row
              fetched += 1
              puts "  fetched #{fetched}/#{total}" if (fetched % LOG_EVERY).zero?
            end
          rescue StandardError => e
            warn "  [error] pokemon_id=#{id}: #{e.class}: #{e.message}"
            mutex.synchronize { failures << id }
          end
        end
      end
    end
    workers.each(&:join)
    [results.sort_by { |r| r[:pokemon_id] }, failures.sort]
  end

  def fetch_one(id)
    pokemon = get_json("#{API_BASE}/pokemon/#{id}")
    species = get_json("#{API_BASE}/pokemon-species/#{id}")
    row     = map_payload(pokemon, species)
    download_image(row[:pokemon_id], row[:remote_image_url])
    row[:image_url] = "/pokemon/#{row[:pokemon_id]}.png"
    row.delete(:remote_image_url)
    row
  end

  def download_image(pokemon_id, url)
    return if url.nil?

    dest = IMAGE_DIR.join("#{pokemon_id}.png")
    return if File.exist?(dest) && File.size(dest).positive?

    uri = URI(url)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https', open_timeout: 10, read_timeout: 30) do |http|
      res = http.get(uri.request_uri, 'User-Agent' => 'pokedex-api-seed/1.0')
      raise "image HTTP #{res.code} for #{url}" unless res.is_a?(Net::HTTPSuccess)

      File.binwrite(dest, res.body)
    end
  end

  def map_payload(pokemon, species)
    sprites = pokemon['sprites'] || {}
    image_url = sprites.dig('other', 'official-artwork', 'front_default') ||
                sprites['front_default']

    types = pokemon['types'].sort_by { |t| t['slot'] }
    base_stats = pokemon['stats'].to_h do |s|
      [s['stat']['name'].tr('-', '_'), s['base_stat']]
    end

    english_flavor = species['flavor_text_entries']
                     .find { |e| e.dig('language', 'name') == 'en' }
                     &.dig('flavor_text')
                     &.tr("\n\f", ' ')
                     &.squeeze(' ')
                     &.strip

    {
      pokemon_id: pokemon['id'],
      name: pokemon['name'],
      pokemon_type: types[0]&.dig('type', 'name'),
      secondary_type: types[1]&.dig('type', 'name'),
      remote_image_url: image_url,
      height_dm: pokemon['height'],
      weight_hg: pokemon['weight'],
      base_stats: base_stats,
      description: english_flavor,
      generation: species.dig('generation', 'url')&.match(%r{/generation/(\d+)/})&.captures&.first&.to_i
    }
  end

  def write(records)
    written = 0
    Pokemon.transaction do
      records.each do |attrs|
        record = Pokemon.find_or_initialize_by(pokemon_id: attrs[:pokemon_id])
        record.assign_attributes(attrs)
        record.save!
        written += 1
        puts "  wrote #{written}/#{records.size}" if (written % 100).zero?
      end
    end
  end

  def get_json(url)
    uri = URI(url)
    res = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https', open_timeout: 10,
                                              read_timeout: 30) do |http|
      http.get(uri.request_uri, 'User-Agent' => 'pokedex-api-seed/1.0')
    end
    raise "HTTP #{res.code} for #{url}" unless res.is_a?(Net::HTTPSuccess)

    JSON.parse(res.body)
  end
end
