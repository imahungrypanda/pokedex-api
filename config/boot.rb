ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'bundler/setup' # Set up gems listed in the Gemfile.

# Ruby 3.4 dropped logger from default gems; ActiveSupport 6.1 references
# Logger at load time before our app boots. Required here so it's available
# for both `bin/rails` and rspec entry paths. Remove once on Rails 7.1+.
require 'logger'
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
