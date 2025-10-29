# Changelog

## [1.3.7] - 2025-10-29

### Added
- **Antialias toggle control** - button to enable/disable antialias with localStorage persistence and page reload
- **Style-based initial view** - support for `center` and `zoom` properties from style JSON according to MapLibre Style Spec

### Changed
- **Default map center** - updated to `[96.63, 64.81]`

## [1.2.7] - 2025-10-20

### Fixed
- **Puma dependency conflict** - moved Puma from runtime to development dependencies

## [1.2.6] - 2025-10-07

### Added
- **Version info panel** in bottom-right corner with gem name and version link to GitHub

## [1.2.5] - 2025-10-07

### Added
- **Development server startup** with `if __FILE__ == $0` pattern for direct gem execution
- **IntelliJ IDEA integration** support for running gem from source code during development

### Technical Changes
- **Direct execution support** - gem can now be run directly with `ruby lib/maplibre-preview.rb`
- **Development workflow improvement** - no need to build gem for testing changes
- **Port configuration** - development server runs on port 9292 by default

## [1.2.4] - 2025-10-05

### Added
- **CLI executable** - completely new `bin/maplibre-preview` command-line interface
- **Server management commands** with `--up`, `--down`, `--port` options
- **Help system** with `--help` and `--version` commands
- **Process management** with PID file tracking and server control
- **Puma dependency** for reliable server operation
- **Ruby 3.0+ requirement** for modern Ruby features

### New CLI Features
- **`maplibre-preview --up`** - start server with default or custom port
- **`maplibre-preview --up --port 9292`** - start server on specific port
- **`maplibre-preview --down`** - stop running server
- **`maplibre-preview --help`** - show usage information
- **`maplibre-preview --version`** - show version information
- **Unknown command validation** - proper error messages for invalid arguments

## [1.1.4] - 2025-10-03

### Fixed
- **Terrain elevation correction** for accurate height display in tooltips and profiles
- **Centralized exaggeration compensation** with `getRealTerrainElevation` function

## [1.1.0] - 2025-10-01

### Refactored
- **Simplified architecture** with streamlined Sinatra extension pattern
- **Consolidated code** into single `lib/maplibre-preview.rb` file
- **Removed helper methods** in favor of direct Slim template calls
- **Updated template names** to `maplibre_map` and `maplibre_layout` to avoid conflicts
- **Streamlined Sinatra extension** with prepend modules for static assets and templates

### Technical Changes
- **Removed StaticMiddleware** in favor of prepend-based static asset serving
- **Removed Helpers module** with helper methods
- **Direct route integration** using `slim :maplibre_map, layout: :maplibre_layout`
- **Simplified file structure** with all core functionality in main file
- **Improved template resolution** using `__dir__` context for gem paths

## [1.0.0] - 2025-09-29

### Added
- **Extracted MapLibre development tools** from existing tiles-proxy-cache project
- **Sinatra extension** for easy integration into existing applications
- **StaticMiddleware** for serving gem assets (JS files) without conflicts
- **Helper methods** for rendering map development interface
- **Standalone application** for testing and development purposes

### Extracted Features
- **Advanced layer filtering** with metadata support (from `filters.js`)
- **Terrain visualization** and elevation profiles (from `contour.js`)
- **Performance monitoring** and metrics display
- **Interactive style debugging** tools
- **Contour line generation** for terrain data using MapLibre Contour
- **Hover and click modes** for feature inspection
- **MapLibre GL JS integration** with version 5.7.3

### Refactored Components
- **Slim templates** (`map.slim`, `map_layout.slim`) adapted for gem structure
- **JavaScript modules** (`filters.js`, `contour.js`) preserved with original functionality
- **View rendering** with dynamic path resolution for gem integration
- **Configuration system** with sensible defaults for MapLibre development

### Technical Implementation
- **Ruby >= 2.7.0** support with modern gem structure
- **Sinatra 2.1+** compatibility and extension system
- **Rack middleware** for asset serving without path conflicts
- **Comprehensive test suite** with RSpec for all components
- **Clean gem structure** optimized for integration use cases

### Migration Notes
This gem extracts the MapLibre development tools that were previously embedded in the tiles-proxy-cache project, making them reusable across different Sinatra applications. The original functionality has been preserved while adding proper gem structure and integration capabilities.
