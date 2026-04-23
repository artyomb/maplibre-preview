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
      %w[/js/filters.js /js/contour.js /js/tilegrid.js /vendor/maplibre-gl/maplibre-gl.js /vendor/maplibre-contour/index.min.js /vendor/d3/d3.v7.min.js].each do |js_file|
        get js_file
        expect(last_response).to be_ok
        expect(last_response.content_type).to include('javascript')
        expect(last_response.body).not_to be_empty
      end
    end

    it 'serves required stylesheets' do
      get '/vendor/maplibre-gl/maplibre-gl.css'

      expect(last_response).to be_ok
      expect(last_response.content_type).to include('text/css')
      expect(last_response.body).not_to be_empty
    end
  end

  describe 'Bundled frontend assets' do
    let(:app) { Class.new(MapLibrePreview::App) { set :environment, :test } }

    it 'includes local frontend asset paths' do
      get '/'
      body = last_response.body

      expect(body).to include('/vendor/maplibre-gl/maplibre-gl.css')
      expect(body).to include('/vendor/maplibre-gl/maplibre-gl.js')
      expect(body).to include('/vendor/maplibre-contour/index.min.js')
      expect(body).to include('/vendor/d3/d3.v7.min.js')
      expect(body).not_to include('unpkg.com')
      expect(body).not_to include('d3js.org')
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
