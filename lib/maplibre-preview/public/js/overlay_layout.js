class OverlayLayoutManager {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'maplibre-preview:overlay-layout:v3';
        this.snapThreshold = options.snapThreshold || 32;
        this.mobileBreakpoint = options.mobileBreakpoint || 768;
        this.edgeGap = options.edgeGap || 10;
        this.getReservedBounds = options.getReservedBounds || (() => ({}));
        this.panels = new Map();
        this.state = this.loadState();
        this.drag = null;
        this.zIndex = 1100;
        this.resizeHandler = () => this.refreshBounds();
        window.addEventListener('resize', this.resizeHandler);
    }

    registerPanel(config) {
        const element = this.resolveElement(config.element);
        if (!element) return null;

        const id = config.id || element.id;
        if (!id) return null;

        const existing = this.panels.get(id);
        if (existing) this.unregisterPanel(id);

        const panel = {
            id,
            element,
            handle: this.resolveHandle(element, config.handleSelector),
            defaultAnchor: config.defaultAnchor || 'left',
            defaultOffset: config.defaultOffset || {x: 0, y: 0},
            snap: config.snap !== false,
            lockSizeOnDrag: config.lockSizeOnDrag === true,
            movable: config.movable !== false,
            cleanup: []
        };

        element.dataset.overlayPanelId = id;
        element.classList.add('overlay-managed-panel');
        this.panels.set(id, panel);

        if (panel.movable && panel.handle) {
            this.prepareHandle(panel);
        }

        this.applyStoredOrDefaultPosition(panel);
        return panel;
    }

    unregisterPanel(id) {
        const panel = this.panels.get(id);
        if (!panel) return;

        panel.cleanup.forEach(fn => fn());
        panel.element.classList.remove('overlay-managed-panel', 'overlay-dragging');
        panel.element.removeAttribute('data-overlay-panel-id');
        this.panels.delete(id);
    }

    movePanelTo(id, anchor) {
        const panel = this.panels.get(id);
        if (!panel) return;

        const nextState = {mode: 'anchor', anchor, offset: {x: 0, y: 0}};
        this.setPanelState(panel, nextState);
    }

    resetPanel(id) {
        const panel = this.panels.get(id);
        if (!panel) return;

        delete this.state[id];
        this.persistState();
        this.applyStoredOrDefaultPosition(panel);
    }

    resetLayout() {
        this.state = {};
        this.clearStoredState();
        this.panels.forEach(panel => this.applyStoredOrDefaultPosition(panel));
    }

    refreshPanel(id) {
        const panel = this.panels.get(id);
        if (!panel) return;
        if (this.drag?.panel?.id === id) return;

        const panelState = this.state[id] || this.defaultState(panel);
        this.applyPanelState(panel, panelState);
    }

    refreshBounds() {
        if (this.drag) return;
        this.panels.forEach(panel => this.refreshPanel(panel.id));
    }

    destroy() {
        window.removeEventListener('resize', this.resizeHandler);
        [...this.panels.keys()].forEach(id => this.unregisterPanel(id));
    }

    resolveElement(elementOrSelector) {
        if (!elementOrSelector) return null;
        return typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;
    }

    resolveHandle(element, selector) {
        return selector ? element.querySelector(selector) : element;
    }

    prepareHandle(panel) {
        const pointerDown = event => this.onPointerDown(event, panel);
        const keyDown = event => this.onHandleKeyDown(event, panel);

        panel.handle.classList.add('overlay-panel-handle');
        panel.handle.tabIndex = panel.handle.tabIndex >= 0 ? panel.handle.tabIndex : 0;
        if (!panel.handle.querySelector('button, input, select, textarea, a')) {
            panel.handle.setAttribute('role', panel.handle.getAttribute('role') || 'button');
        }
        panel.handle.setAttribute('aria-label', panel.handle.getAttribute('aria-label') || `Move ${panel.id} panel`);
        panel.handle.addEventListener('pointerdown', pointerDown);
        panel.handle.addEventListener('keydown', keyDown);
        panel.cleanup.push(() => panel.handle.removeEventListener('pointerdown', pointerDown));
        panel.cleanup.push(() => panel.handle.removeEventListener('keydown', keyDown));
    }

    onPointerDown(event, panel) {
        if (event.button !== 0 || !panel.movable || this.isInteractiveTarget(event.target)) return;

        const rect = panel.element.getBoundingClientRect();
        const pointerMove = moveEvent => this.onPointerMove(moveEvent);
        const pointerUp = upEvent => this.onPointerUp(upEvent);

        if (panel.lockSizeOnDrag) {
            panel.element.style.width = `${Math.round(rect.width)}px`;
            panel.element.style.height = `${Math.round(rect.height)}px`;
        }

        this.drag = {
            panel,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: rect.left,
            originY: rect.top,
            pointerMove,
            pointerUp
        };

        panel.element.classList.add('overlay-dragging');
        this.bringToFront(panel);
        try {
            panel.handle.setPointerCapture?.(event.pointerId);
        } catch (e) {
            // Some synthetic pointer events do not create an active pointer capture target.
        }

        panel.handle.addEventListener('pointermove', pointerMove);
        panel.handle.addEventListener('pointerup', pointerUp);
        panel.handle.addEventListener('pointercancel', pointerUp);
        event.preventDefault();
    }

    onPointerMove(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) return;

        const nextX = this.drag.originX + event.clientX - this.drag.startX;
        const nextY = this.drag.originY + event.clientY - this.drag.startY;
        const position = this.clampPosition(this.drag.panel, nextX, nextY);

        this.applyPosition(this.drag.panel, position.x, position.y);
    }

    onPointerUp(event) {
        if (!this.drag || event.pointerId !== this.drag.pointerId) return;

        const panel = this.drag.panel;
        const rect = panel.element.getBoundingClientRect();
        const nextState = this.stateFromPosition(panel, rect.left, rect.top);
        this.cleanupDrag();
        this.setPanelState(panel, nextState);
    }

    cleanupDrag() {
        if (!this.drag) return null;

        const drag = this.drag;
        try {
            drag.panel.handle.releasePointerCapture?.(drag.pointerId);
        } catch (e) {
            // Pointer capture may already be released by the browser.
        }
        drag.panel.handle.removeEventListener('pointermove', drag.pointerMove);
        drag.panel.handle.removeEventListener('pointerup', drag.pointerUp);
        drag.panel.handle.removeEventListener('pointercancel', drag.pointerUp);
        drag.panel.element.classList.remove('overlay-dragging');
        this.drag = null;
        return drag;
    }

    onHandleKeyDown(event, panel) {
        if (event.key === 'Escape' && this.drag) {
            this.cleanupDrag();
            this.refreshPanel(panel.id);
            return;
        }

        if (!event.shiftKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;

        const rect = panel.element.getBoundingClientRect();
        const step = event.altKey ? 32 : 8;
        const delta = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step]
        }[event.key];
        const position = this.clampPosition(panel, rect.left + delta[0], rect.top + delta[1]);

        this.setPanelState(panel, {mode: 'free', x: position.x, y: position.y});
        event.preventDefault();
    }

    isInteractiveTarget(target) {
        return target?.closest?.('button, input, select, textarea, a, label, [data-overlay-ignore-drag="true"]');
    }

    bringToFront(panel) {
        this.zIndex += 1;
        panel.element.style.zIndex = String(this.zIndex);
    }

    loadState() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        } catch (e) {
            console.warn('OverlayLayoutManager: could not load layout state', e);
            return {};
        }
    }

    persistState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.warn('OverlayLayoutManager: could not persist layout state', e);
        }
    }

    clearStoredState() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.warn('OverlayLayoutManager: could not clear layout state', e);
        }
    }

    defaultState(panel) {
        const offset = typeof panel.defaultOffset === 'function'
            ? panel.defaultOffset(panel)
            : panel.defaultOffset;

        return {
            mode: 'anchor',
            anchor: panel.defaultAnchor,
            offset: {...offset}
        };
    }

    applyStoredOrDefaultPosition(panel) {
        const panelState = this.state[panel.id] || this.defaultState(panel);
        this.applyPanelState(panel, panelState);
    }

    setPanelState(panel, panelState) {
        this.state[panel.id] = panelState;
        this.persistState();
        this.applyPanelState(panel, panelState);
    }

    applyPanelState(panel, panelState) {
        const responsiveState = this.isConstrainedViewport() && panelState.mode === 'free'
            ? this.defaultState(panel)
            : panelState;
        const position = responsiveState.mode === 'free'
            ? this.clampPosition(panel, responsiveState.x, responsiveState.y)
            : this.positionForAnchor(panel, responsiveState.anchor, responsiveState.offset || {x: 0, y: 0});

        this.applyPosition(panel, position.x, position.y);
    }

    applyPosition(panel, x, y) {
        panel.element.style.position = 'fixed';
        panel.element.style.left = `${Math.round(x)}px`;
        panel.element.style.top = `${Math.round(y)}px`;
        panel.element.style.right = 'auto';
        panel.element.style.bottom = 'auto';
        panel.element.style.transform = 'none';
    }

    positionForAnchor(panel, anchor, offset) {
        const rect = this.panelRect(panel);
        const viewport = this.viewportBounds();
        const centerX = (viewport.width - rect.width) / 2;
        const centerY = (viewport.height - viewport.reservedBottom - rect.height) / 2;
        let x = centerX;
        let y = centerY;

        if (anchor === 'left') {
            x = this.edgeGap + (offset.x || 0);
            y = centerY + (offset.y || 0);
        } else if (anchor === 'right') {
            x = viewport.width - rect.width - this.edgeGap + (offset.x || 0);
            y = centerY + (offset.y || 0);
        } else if (anchor === 'top') {
            x = centerX + (offset.x || 0);
            y = this.edgeGap + (offset.y || 0);
        } else if (anchor === 'bottom') {
            x = centerX + (offset.x || 0);
            y = viewport.height - viewport.reservedBottom - rect.height - this.edgeGap + (offset.y || 0);
        } else if (anchor === 'top-left') {
            x = this.edgeGap + (offset.x || 0);
            y = this.edgeGap + (offset.y || 0);
        } else if (anchor === 'top-right') {
            x = viewport.width - rect.width - this.edgeGap + (offset.x || 0);
            y = this.edgeGap + (offset.y || 0);
        } else if (anchor === 'bottom-left') {
            x = this.edgeGap + (offset.x || 0);
            y = viewport.height - viewport.reservedBottom - rect.height - this.edgeGap + (offset.y || 0);
        } else if (anchor === 'bottom-right') {
            x = viewport.width - rect.width - this.edgeGap + (offset.x || 0);
            y = viewport.height - viewport.reservedBottom - rect.height - this.edgeGap + (offset.y || 0);
        }

        return this.clampPosition(panel, x, y);
    }

    stateFromPosition(panel, x, y) {
        if (this.isConstrainedViewport()) {
            return {mode: 'anchor', anchor: this.nearestAnchor(panel, x, y).anchor, offset: {x: 0, y: 0}};
        }

        const nearest = this.nearestAnchor(panel, x, y);
        if (!panel.snap || nearest.distance > this.snapThreshold) {
            const clamped = this.clampPosition(panel, x, y);
            return {mode: 'free', x: clamped.x, y: clamped.y};
        }

        const rect = this.panelRect(panel);
        const viewport = this.viewportBounds();
        const centerX = (viewport.width - rect.width) / 2;
        const centerY = (viewport.height - viewport.reservedBottom - rect.height) / 2;
        const offset = {x: 0, y: 0};

        if (nearest.anchor === 'left' || nearest.anchor === 'right') {
            offset.y = y - centerY;
        } else {
            offset.x = x - centerX;
        }

        return {mode: 'anchor', anchor: nearest.anchor, offset};
    }

    nearestAnchor(panel, x, y) {
        const rect = this.panelRect(panel);
        const viewport = this.viewportBounds();
        const distances = [
            ['left', x],
            ['right', viewport.width - (x + rect.width)],
            ['top', y],
            ['bottom', viewport.height - viewport.reservedBottom - (y + rect.height)]
        ].map(([anchor, distance]) => ({anchor, distance: Math.abs(distance)}));

        return distances.sort((a, b) => a.distance - b.distance)[0];
    }

    clampPosition(panel, x, y) {
        const rect = this.panelRect(panel);
        const viewport = this.viewportBounds();
        const minX = this.edgeGap;
        const minY = this.edgeGap;
        const maxX = Math.max(minX, viewport.width - rect.width - this.edgeGap);
        const maxY = Math.max(minY, viewport.height - viewport.reservedBottom - rect.height - this.edgeGap);

        return {
            x: Math.min(maxX, Math.max(minX, x)),
            y: Math.min(maxY, Math.max(minY, y))
        };
    }

    panelRect(panel) {
        const rect = panel.element.getBoundingClientRect();
        return {
            width: rect.width || panel.element.offsetWidth || 1,
            height: rect.height || panel.element.offsetHeight || 1
        };
    }

    viewportBounds() {
        const reserved = this.getReservedBounds() || {};
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            reservedBottom: Math.max(0, Number(reserved.bottom || 0))
        };
    }

    isConstrainedViewport() {
        return window.innerWidth < this.mobileBreakpoint;
    }
}

window.OverlayLayoutManager = OverlayLayoutManager;
