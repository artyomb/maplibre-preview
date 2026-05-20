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
      expect(last_response.body).to include('overlay_layout')
      expect(last_response.body).to include('maplibre-preview:coordinate-selected')
    end

    it 'renders map cache toggle wiring' do
      get '/?style_url=https://example.com/style.json'
      expect(last_response).to be_ok

      expect(last_response.body).to include('Map Settings')
      expect(last_response.body).to include('Style Controls')
      expect(last_response.body).to include('id="settings-mode-switcher"')
      expect(last_response.body).to include('id="style-mode-switcher"')
      expect(last_response.body).to include('id="map-settings-toggle"')
      expect(last_response.body).to include('id="style-controls-toggle"')
      expect(last_response.body).to include('toggleControlSection')
      expect(last_response.body).to include('id="map-cache-btn"')
      expect(last_response.body).to include('id="basemap-opacity-slider"')
      expect(last_response.body).to include('id="terrain-exaggeration-slider"')
      expect(last_response.body).to include('id="collision-boxes-btn"')
      expect(last_response.body).to include('id="overdraw-inspector-btn"')
      expect(last_response.body).to include('id="tile-fade-btn"')
      expect(last_response.body).to include('id="style-parameters-panel"')
      expect(last_response.body).to include('id="style-parameters-toggle"')
      expect(last_response.body).to include('id="style-parameter-fields"')
      expect(last_response.body).to include('id="style-parameters-apply"')
      expect(last_response.body).to include('id="style-parameters-reset"')
      expect(last_response.body).to include('OverlayLayoutManager')
      expect(last_response.body).to include('overlayLayoutManager')
      expect(last_response.body).to include('resetOverlayLayout')
      expect(last_response.body).to include('id="overlay-layout-reset-btn"')
      expect(last_response.body).to include('Reset window layout')
      expect(last_response.body).to include('maplibre-preview:overlay-layout:v3')
      expect(last_response.body).not_to include('overlay-panel-dock-actions')
      expect(last_response.body).to include('mapCacheDisabled')
      expect(last_response.body).to include('basemapOpacity')
      expect(last_response.body).to include('terrainExaggeration')
      expect(last_response.body).to include('styleParameterDefinitions')
      expect(last_response.body).to include('parameterizedUrlRules')
      expect(last_response.body).to include('sourceDeclaredParameters')
      expect(last_response.body).to include('collectSourceMetadataParameters')
      expect(last_response.body).to include('applyStyleParametersToStyle')
      expect(last_response.body).to include('rememberParameterizedSourceUrls')
      expect(last_response.body).to include('parameterizedUrlRuleFor')
      expect(last_response.body).to include('getStyleParameterContext')
      expect(last_response.body).to include('isTemporalParameter')
      expect(last_response.body).to include('/css/temporal_picker.css')
      expect(last_response.body).to include('/js/temporal_picker.js')
      expect(last_response.body).to include('window.TemporalPicker.open')
      expect(last_response.body).to include('style-parameter-input-group')
      expect(last_response.body).to include('style-parameter-counts')
      expect(last_response.body).to include('style-parameter-context')
      expect(last_response.body).to include('Used by')
      expect(last_response.body).to include('Sources:')
      expect(last_response.body).not_to include("absolute.includes('/rb_tiles/')")
      expect(last_response.body).to include('layoutBottomOverlays')
      expect(last_response.body).to include('showCollisionBoxes')
      expect(last_response.body).to include('showOverdrawInspector')
      expect(last_response.body).to include("cache: 'no-store'")
      expect(last_response.body).to include('cache-off')
      expect(last_response.body).to include('transformRequest')
      expect(last_response.body).to include('canvasContextAttributes')
      expect(last_response.body).to include('raster-fade-duration')
      expect(last_response.body).to include('window.toggleMapCache')
      expect(last_response.body).to include('window.switchSettingsMode')
      expect(last_response.body).to include('window.applyStyleParameters')
      expect(last_response.body).to include('window.toggleStyleParametersPanel')
    end

    it 'renders feature popup tooltips as DOM text instead of raw HTML' do
      get '/?style_url=https://example.com/style.json'
      expect(last_response).to be_ok

      expect(last_response.body).to include('createPopupContent')
      expect(last_response.body).to include('item.textContent = tooltip')
      expect(last_response.body).to include('setDOMContent(createPopupContent(tooltips))')
      expect(last_response.body).not_to include('setHTML(tooltips')
    end

    it 'emits selected coordinates for host applications' do
      get '/'
      expect(last_response).to be_ok

      expect(last_response.body).to include('emitCoordinateSelection(e.lngLat)')
      expect(last_response.body).to include('window.parent.postMessage(payload, window.location.origin)')
    end

    it 'serves all required JavaScript modules' do
      %w[/js/overlay_layout.js /js/filters.js /js/contour.js /js/tilegrid.js /js/temporal_picker.js /vendor/maplibre-gl/maplibre-gl.js /vendor/maplibre-contour/index.min.js /vendor/d3/d3.v7.min.js].each do |js_file|
        get js_file
        expect(last_response).to be_ok
        expect(last_response.content_type).to include('javascript')
        expect(last_response.body).not_to be_empty
      end
    end

    it 'serves required stylesheets' do
      %w[/vendor/maplibre-gl/maplibre-gl.css /css/temporal_picker.css].each do |css_file|
        get css_file

        expect(last_response).to be_ok
        expect(last_response.content_type).to include('text/css')
        expect(last_response.body).not_to be_empty
      end
    end
  end

  describe 'Bundled frontend assets' do
    let(:app) { Class.new(MapLibrePreview::App) { set :environment, :test } }

    it 'includes local frontend asset paths' do
      get '/'
      body = last_response.body

      expect(body).to include('/vendor/maplibre-gl/maplibre-gl.css')
      expect(body).to include('/css/temporal_picker.css')
      expect(body).to include('/vendor/maplibre-gl/maplibre-gl.js')
      expect(body).to include('/vendor/maplibre-contour/index.min.js')
      expect(body).to include('/vendor/d3/d3.v7.min.js')
      expect(body).to include('/js/overlay_layout.js')
      expect(body).to include('/js/temporal_picker.js')
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
