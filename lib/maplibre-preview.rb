# frozen_string_literal: true

require 'sinatra/base'
require 'slim'
require_relative 'maplibre-preview/version'

module MapLibrePreview
  # Fixed versions for guaranteed compatibility
  MAPLIBRE_VERSION = '5.7.3'
  CONTOUR_VERSION = '0.1.0'
  D3_VERSION = '7'

  # Sinatra extension for map development tools
  module Extension
    module AddPublic
      def static!(options={})
        super
        path = File.expand_path "#{__dir__}/maplibre-preview/public/#{Sinatra::Base::URI_INSTANCE.unescape(request.path_info)}"
        return unless File.file?(path)

        env['sinatra.static_file'] = path
        cache_control(*settings.static_cache_control) if settings.static_cache_control?
        send_file path, options.merge(disposition: nil)
      end
    end

    module FindTemplate
      def find_template(views, name, engine, &block)
        super
        yield File.expand_path "#{__dir__}/maplibre-preview/views/#{name}.#{@preferred_extension}"
      end
    end

    def self.registered(app)
      Sinatra::Templates.prepend FindTemplate
      Sinatra::Base.prepend AddPublic
      app.set :static, true
      app.set :maplibre_preview_options, {}

      app.get '/maplibre_preview' do
        slim :maplibre_map, layout: :maplibre_layout
      end
    end
  end

  # Standalone Sinatra application for map development
  class App < Sinatra::Base
    register Extension

    configure do
      set :views, File.expand_path('maplibre-preview/views', __dir__)
      set :public_folder, File.expand_path('maplibre-preview/public', __dir__)
    end

    get '/js/:file' do
      serve_js_file(params[:file])
    end

    get '/map' do
      slim :maplibre_map, layout: :maplibre_layout, locals: { options: {} }
    end

    private

    def serve_js_file(filename)
      gem_js_path = File.expand_path("maplibre-preview/public/js/#{filename}", __dir__)
      if File.exist?(gem_js_path)
        content_type 'application/javascript'
        File.read(gem_js_path)
      else
        status 404
        'File not found'
      end
    end
  end
end

Sinatra.register MapLibrePreview::Extension
