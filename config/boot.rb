ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'bundler/setup' # Set up gems listed in the Gemfile.
require 'yaml'
module YAML
  class << self
    alias_method :original_safe_load, :safe_load
    def safe_load(source, **options)
      options[:aliases] = true
      original_safe_load(source, **options)
    end
  end
end

require 'bootsnap/setup' # Speed up boot time by caching expensive operations.
