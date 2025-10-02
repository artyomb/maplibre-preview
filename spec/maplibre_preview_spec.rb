# frozen_string_literal: true

require 'spec_helper'

RSpec.describe MapLibrePreview do
  describe 'App functionality' do
    let(:app) { Class.new(MapLibrePreview::App) { set :environment, :test } }

    it 'provides complete map development interface' do
      get '/'
      expect(last_response).to be_ok

      expect(last_response.body).to include('map-container')
      expect(last_response.body).to include('maplibre-gl')
      expect(last_response.body).to include('maplibre-contour')
      expect(last_response.body).to include('d3')
    end

    it 'serves all required JavaScript modules' do
      %w[filters.js contour.js].each do |js_file|
        get "/js/#{js_file}"
        expect(last_response).to be_ok
        expect(last_response.content_type).to include('javascript')
        expect(last_response.body).not_to be_empty
      end
    end
  end

  describe 'External dependencies' do
    let(:app) { Class.new(MapLibrePreview::App) { set :environment, :test } }

    it 'includes proper external dependencies' do
      get '/'
      body = last_response.body

      expect(body).to include('unpkg.com/maplibre-gl')
      expect(body).to include('unpkg.com/maplibre-contour')
      expect(body).to include('d3js.org/d3')
    end
  end

  describe 'Extension integration' do
    it 'provides extension for Sinatra integration' do
      test_app = Class.new(Sinatra::Base) do
        register MapLibrePreview::Extension
      end

      expect(test_app.ancestors).to include(MapLibrePreview::Extension)
      expect(test_app.settings.maplibre_preview_options).to be_a(Hash)
    end
  end
end