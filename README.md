# MapLibre Preview

A Ruby gem providing development tools for MapLibre GL JS styles with advanced filtering, terrain visualization, and performance monitoring capabilities. Designed for seamless integration into Sinatra applications.

[![Ruby](https://img.shields.io/badge/ruby-2.7+-red.svg)](https://ruby-lang.org)
[![Sinatra](https://img.shields.io/badge/sinatra-web_framework-lightgrey.svg)](http://sinatrarb.com/)
[![MapLibre](https://img.shields.io/badge/maplibre-gl_js-blue.svg)](https://maplibre.org/)
[![Русский](https://img.shields.io/badge/русский-документация-orange.svg)](docs/README_RU.md)

## Key Features

- **Advanced Layer Filtering**: Metadata-driven layer filtering with support for complex filter expressions
- **Terrain Visualization**: Full terrain support with elevation profiles and contour line generation
- **Performance Monitoring**: Real-time FPS, memory usage, and tile loading metrics
- **Interactive Debugging**: Hover and click modes for feature inspection
- **Sinatra Integration**: Seamless integration as Sinatra extension with helper methods
- **Static Asset Serving**: Built-in middleware for serving JavaScript modules without conflicts

## Architecture Overview

The gem consists of several integrated components:

### Core Components

- **[Main Module](lib/maplibre-preview.rb)** - Core gem functionality including Sinatra extension, Rack middleware, helper methods, and standalone application
- **[Slim Templates](lib/maplibre-preview/views/)** - HTML templates for map interface
- **[JavaScript Modules](lib/maplibre-preview/public/js/)** - Client-side filtering and terrain logic

### Data Flow

1. **Sinatra Integration** → Register extension → Configure options → Use helpers
2. **Asset Serving** → StaticMiddleware intercepts `/js/*` requests → Serves from gem
3. **Map Rendering** → Helper methods render Slim templates → Include external dependencies
4. **Client Interaction** → JavaScript modules handle filtering and terrain features

## Quick Start

### Installation

Add to your Gemfile:

```ruby
gem 'maplibre-preview'
```

Then run:

```bash
bundle install
```

### Basic Integration

```ruby
require 'maplibre-preview'

class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

### Passing Style URL

There are several ways to pass a style URL to the map:

**1. Via URL parameter:**
```
http://localhost:9292/map?style_url=https://example.com/style.json
```

**2. Via route parameter:**
```ruby
get '/map' do
  params[:style_url] = 'https://example.com/style.json'
  slim :maplibre_map, layout: :maplibre_layout
end
```

**3. Via source parameter:**
```
http://localhost:9292/map?source=Example_Style
```

### Standalone Development Server

The gem includes a complete Sinatra application for testing and development:

```ruby
require 'maplibre-preview'

# Run standalone development server
MapLibrePreview::App.run!
```

This starts a complete web server with:
- Map interface at `http://localhost:4567/map`
- JavaScript assets served from `/js/*`
- All gem functionality available out of the box

**How to use with a style:**
- Pass style URL as parameter: `http://localhost:4567/map?style_url=https://example.com/style.json`

**Without a style:**
- Shows only basemap tiles (OpenStreetMap)
- Useful for testing basic functionality
- No custom layers or styling

**Use cases:**
- Quick testing of gem functionality
- Development and debugging
- Demonstrating capabilities

## Configuration

The gem uses fixed configurations for optimal compatibility:

- **Map Center**: `[35.15, 47.41]`
- **Initial Zoom**: `2`
- **Basemap**: OpenStreetMap tiles with 0.8 opacity
- **Library Versions**: MapLibre GL JS 5.7.3, MapLibre Contour 0.1.0, D3.js 7

**Style URL**: Pass via URL parameter `?style_url=https://example.com/style.json`

## API Reference

### Sinatra Extension

```ruby
# Register the extension
register MapLibrePreview::Extension
```

### Template Integration

The gem provides Slim templates that can be used directly in your routes:

| Template | Description | Usage |
|----------|-------------|-------|
| `maplibre_map` | Main map interface template | `slim :maplibre_map, layout: :maplibre_layout` |
| `maplibre_layout` | HTML layout with external dependencies | Used as layout for map template |

### Standalone Application

```ruby
# Available routes
GET /map          # Main map development interface
GET /js/:file     # JavaScript asset serving
```

## Style Metadata Support

The gem supports advanced filtering through style metadata:

```json
{
  "metadata": {
    "filters": {
      "buildings": [
        {
          "id": "residential",
          "filter": ["==", ["get", "type"], "residential"]
        },
        {
          "id": "commercial", 
          "filter": ["==", ["get", "type"], "commercial"]
        }
      ]
    },
    "locale": {
      "en": {
        "buildings": "Buildings",
        "residential": "Residential",
        "commercial": "Commercial"
      }
    }
  }
}
```

## Terrain Support

For terrain visualization, add terrain configuration to your style:

```json
{
  "terrain": {
    "source": "terrain-source"
  },
  "sources": {
    "terrain-source": {
      "type": "raster-dem",
      "tiles": ["https://your-terrain-tiles/{z}/{x}/{y}.png"],
      "encoding": "terrarium"
    }
  }
}
```

## Performance Monitoring

The gem includes real-time performance monitoring:

- **FPS and Frame Time**: Real-time rendering performance
- **Memory Usage**: JavaScript heap memory monitoring
- **Tile Loading**: Active tile count and loading status
- **Layer Management**: Active layer count and visibility
- **Zoom Level**: Current map zoom level
- **Terrain Status**: Terrain data availability

## File Structure

```
lib/
├── maplibre-preview.rb          # Main gem module and Sinatra integration
└── maplibre-preview/
    ├── version.rb                # Gem version
    ├── views/                    # Slim templates
    │   ├── map.slim             # Main map interface
    │   └── map_layout.slim      # HTML layout
    └── public/js/               # JavaScript modules
        ├── filters.js           # Layer filtering logic
        └── contour.js           # Terrain and contour features
```

## Development

### Prerequisites

- Ruby 2.7+
- Sinatra 2.1+
- Slim 4.1+
- Rack 2.0+

### Setup

```bash
# Install dependencies
bundle install

# Run tests
bundle exec rspec

# Run RuboCop
bundle exec rubocop

# Build gem
gem build maplibre-preview.gemspec
```

### Testing

```bash
# Run all tests
bundle exec rspec

# Run specific test file
bundle exec rspec spec/maplibre_preview_spec.rb
```

## Integration Examples

### Basic Map Integration

```ruby
class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

### Style URL Integration

```ruby
class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    # Style URL passed via params[:style_url]
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

### Multiple Map Routes

```ruby
class MyApp < Sinatra::Base
  register MapLibrePreview::Extension
  
  get '/map' do
    # Uses params[:style_url] if provided
    slim :maplibre_map, layout: :maplibre_layout
  end
  
  get '/terrain' do
    # Set style URL via params
    params[:style_url] = 'https://example.com/terrain-style.json'
    slim :maplibre_map, layout: :maplibre_layout
  end
end
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.