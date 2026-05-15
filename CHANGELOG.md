# Changelog

## [1.9.1] - 2026-05-15

### Security
- **Feature popup tooltips** - render style and feature tooltip values as DOM text instead of raw HTML to prevent script execution from untrusted style or tile data

## [1.9.0] - 2026-05-14

### Added
- **Temporal parameter picker** - added a custom calendar and time picker for date/time-like style parameters
- **Style parameter context** - show source/layer counts and localized usage hints for each detected style parameter

### Changed
- **Style parameter URL matching** - track source-specific parameterized URL rules and append only the parameters declared for the matching source
- **Temporal parameter inputs** - use the custom picker for temporal parameters while keeping query values normalized to epoch seconds

### Fixed
- **Source metadata inspection** - fetch source metadata without pre-appending parameter values so metadata-declared parameters can be discovered reliably
- **Parameterized tile requests** - removed the broad `/rb_tiles/` heuristic in favor of explicit source metadata and URL prefix matching

## [1.8.0] - 2026-05-14

### Added
- **Movable overlay windows** - added `OverlayLayoutManager` for shared drag, edge clamping, snapping and persisted positions of movable map UI panels
- **Window layout reset** - added `Reset window layout` action in Map Settings to clear saved panel positions from local storage and restore defaults

### Changed
- **Panel layout foundation** - moved Map Settings, Style Controls, Style Parameters, Performance, Elevation Profile and Tile Boundaries to the shared overlay layout manager
- **Default panel positions** - kept static map controls attached to map edges and placed Map Settings in the top-left default position

### Fixed
- **Overlay visibility** - fixed managed panel z-index so map settings, filter controls and static MapLibre controls remain visible
- **Elevation profile frame** - fixed profile window positioning and sizing while dragging near the bottom edge

## [1.7.2] - 2026-05-14

### Changed
- **Map settings styling** - rounded all control panel corners and styled range sliders to match the dark UI

## [1.7.0] - 2026-05-14

### Added
- **Style source parameters** - detect `query_params` / `queryParams` from style sources and source metadata
- **Style parameters panel** - add a bottom-center collapsible panel for passing detected parameters into style, source, tile, data, and metadata URLs
- **Date/time parameter inputs** - render date/time-like parameters as `datetime-local` fields and send them as epoch seconds

### Changed
- **Overlay layout** - stack bottom overlays so Style Parameters, Loading, and Elevation Profile panels do not cover each other
- **Style parameter state** - persist parameter values per style URL and keep applied values in the page query string

## [1.6.0] - 2026-05-13

### Added
- **Basemap opacity control** - added a Map Settings slider for changing preview basemap transparency without changing the tested style
- **Terrain exaggeration control** - added a terrain-only slider that updates `map.setTerrain({ source, exaggeration })`
- **MapLibre debug controls** - added Collision Boxes, Overdraw, and Raster Fade toggles for label placement, dense style, and raster/DEM diagnostics

### Changed
- **Tile Boundaries naming** - renamed the Tile Grid UI to Tile Boundaries to clarify that it uses MapLibre `showTileBoundaries`
- **Map Settings layout** - added compact setting rows and range styling for view-mode map controls

## [1.5.1] - 2026-05-13

### Changed
- **Map control layout** - split map settings and style controls into independent panels with separate collapse controls
- **Panel sizing** - adjusted map settings, filters, and layers panels to size from their visible content

### Fixed
- **Filter and layer scrolling** - restored internal scrolling for large filter and layer lists after the panel layout split

## [1.5.0] - 2026-05-13

### Added
- **Map request cache toggle** - added a development mode that disables browser HTTP cache for style and MapLibre resource requests

## [1.4.4] - 2026-05-13

### Fixed
- **Filter labels** - normalize object-based localized labels to display `title`, `name`, or `label` instead of `[object Object]`

## [1.4.2] - 2026-04-23

### Changed
- **Bundled frontend libraries** - vendored MapLibre GL JS, MapLibre Contour, and D3 into gem public assets
- **Offline-safe UI assets** - replaced CDN references with local `/vendor/...` asset paths served by the gem

## [1.4.1] - 2025-12-17

### Fixed
- **Static assets paths** - fixed paths to favicon and JS files to support non-root application mounting using `request.script_name`

## [1.4.0] - 2025-12-04

### Added
- **Tile Grid visualization** - TileGridManager class for displaying tile boundaries and statistics
- **Tile count tracking** - real-time count of loaded tiles with fallback estimation
- **Tile Grid panel** - UI panel showing number of loaded tiles with toggle for tile borders
- **Tile Grid button** - control button in layer controls to show/hide tile grid visualization

### Technical Changes
- **tilegrid.js** - new JavaScript module for tile grid management
- **MapLibre showTileBoundaries integration** - uses native debug feature for tile boundary visualization
- **Internal API tile counting** - attempts to count tiles via sourceCaches with fallback estimation

## [1.3.10] - 2025-11-19

### Changed
- **Panel styling** - unified background, transparency and edge attachment for all panels
- **Toggle buttons** - changed arrow directions, replaced performance panel close button with collapse
- **Performance panel** - partial collapse mode showing only FPS and Memory

## [1.3.9] - 2025-11-19

### Changed
- **Version info display** - removed service name, kept only version number
- **Version info styling** - repositioned to bottom-right corner with gray background, compact padding, subtle colors

### Added
- **Collapsible layer controls panel** - added collapse/expand button with arrow icon for layer controls panel

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
