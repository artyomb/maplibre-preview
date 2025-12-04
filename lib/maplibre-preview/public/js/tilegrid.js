/**
 * TileGridManager - manages tile boundaries visualization and tile statistics
 */
class TileGridManager {
    constructor(options) {
        this.map = options.map;
        this.panelContainer = null;
        this.isVisible = false;
        this.showBorders = true;
        this.tilesLoaded = 0;
        this.updateInterval = null;
    }

    init() {
        if (!this.map) return;

        this.createPanel();
        this.setupEventListeners();
        this.startTileTracking();
    }

    createPanel() {
        this.panelContainer = document.createElement('div');
        this.panelContainer.id = 'tilegrid-panel';
        this.panelContainer.className = 'tilegrid-panel';
        this.panelContainer.style.display = 'none';

        this.panelContainer.innerHTML = `
            <div class="tilegrid-header">
                <span class="tilegrid-title">Tile Grid</span>
                <button class="tilegrid-close" onclick="tileGridManager.toggle()">×</button>
            </div>
            <div class="tilegrid-stats">
                <div class="tilegrid-stat-label">NO. OF TILES LOADED</div>
                <div class="tilegrid-stat-value" id="tilegrid-count">0</div>
            </div>
            <div class="tilegrid-controls">
                <label class="tilegrid-checkbox-label">
                    <span>Show tile borders</span>
                    <input type="checkbox" id="tilegrid-borders-checkbox" checked onchange="tileGridManager.toggleBorders(this.checked)">
                    <span class="tilegrid-checkbox-custom"></span>
                </label>
            </div>
        `;

        document.getElementById('map-container').appendChild(this.panelContainer);
    }

    setupEventListeners() {
        this.map.on('sourcedata', () => this.updateTileCount());
        this.map.on('data', () => this.updateTileCount());
        this.map.on('moveend', () => this.updateTileCount());
        this.map.on('zoomend', () => this.updateTileCount());
    }

    startTileTracking() {
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.updateTileCount();
            }
        }, 1000);
    }

    updateTileCount() {
        if (!this.map || !this.isVisible) return;

        try {
            const style = this.map.getStyle();
            if (!style || !style.sources) return;

            let totalTiles = 0;

            // Count tiles from all raster and vector sources
            Object.keys(style.sources).forEach(sourceName => {
                const sourceCache = this.map.style?.sourceCaches?.[sourceName];
                if (sourceCache) {
                    const tiles = sourceCache.getVisibleCoordinates?.() || [];
                    totalTiles += tiles.length;
                }
            });

            // Fallback: estimate tiles based on zoom and viewport
            if (totalTiles === 0) {
                totalTiles = this.estimateTileCount();
            }

            this.tilesLoaded = totalTiles;
            const countElement = document.getElementById('tilegrid-count');
            if (countElement) {
                countElement.textContent = this.tilesLoaded;
            }
        } catch (e) {
            console.warn('TileGridManager: could not count tiles', e);
        }
    }

    estimateTileCount() {
        const bounds = this.map.getBounds();
        const nw = this.map.project(bounds.getNorthWest());
        const se = this.map.project(bounds.getSouthEast());
        
        const viewportWidth = Math.abs(se.x - nw.x);
        const viewportHeight = Math.abs(se.y - nw.y);
        
        // Fallback estimation, assume standard 256px tiles
        const tilesX = Math.ceil(viewportWidth / 256) + 1;
        const tilesY = Math.ceil(viewportHeight / 256) + 1;
        
        return tilesX * tilesY;
    }

    toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.panelContainer) {
            this.panelContainer.style.display = this.isVisible ? 'block' : 'none';
        }

        const btn = document.getElementById('tilegrid-mode-btn');
        if (btn) {
            btn.textContent = this.isVisible ? 'Hide Tile Grid' : 'Tile Grid';
            btn.className = `control-button ${this.isVisible ? 'active' : ''}`;
        }

        if (this.isVisible) {
            this.updateTileCount();
            this.toggleBorders(true);
        } else {
            this.toggleBorders(false);
        }
    }

    toggleBorders(show) {
        this.showBorders = show;
        
        if (this.map) {
            this.map.showTileBoundaries = show;
        }

        // Update checkbox state
        const checkbox = document.getElementById('tilegrid-borders-checkbox');
        if (checkbox && checkbox.checked !== show) {
            checkbox.checked = show;
        }
    }

    show() {
        if (!this.isVisible) {
            this.toggle();
        }
    }

    hide() {
        if (this.isVisible) {
            this.toggle();
        }
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        if (this.panelContainer && this.panelContainer.parentNode) {
            this.panelContainer.parentNode.removeChild(this.panelContainer);
        }

        if (this.map) {
            this.map.showTileBoundaries = false;
        }
    }
}

