# frozen_string_literal: true

require 'bundler/setup'
require 'maplibre-preview'
require 'rspec'
require 'rack/test'

RSpec.configure do |config|
  config.include Rack::Test::Methods
  config.before { ENV['RACK_ENV'] = 'test' }
end
