'use strict';

let $ = null;

function getEventClientOffset (e) {
    return {
        x: e.clientX,
        y: e.clientY
    };
}

const ELEMENT_NODE = 1;

function getNodeClientOffset (node) {
    const el = node.nodeType === ELEMENT_NODE
        ? node
        : node.parentElement;

    if (!el) {
        return null;
    }

    const { top, left } = el.getBoundingClientRect();
    return { x: left, y: top };
}

export class JQueryBackend {
    constructor (manager, options = {}) {
        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        // this.registry = manager.getRegistry();

        this.sourceNodes = {};
        this.hoveredTargets = [];
        this.targetNodes = {};
    }

    setup () {
        if (typeof window === 'undefined') {
            return;
        }

        if (this.constructor.isSetUp) {
            throw new Error('Cannot have two jQuery backends at the same time.');
        }

        if (!$) {
            throw new Error('jQuery not found.');
        }

        this.constructor.isSetUp = true;
    }

    teardown () {
        if (typeof window === 'undefined') {
            return;
        }

        this.constructor.isSetUp = false;
    }

    connectDragSource (sourceId, node, options = {}) {
        if (node) {
            $(node).draggable({
                greedy: true,

                helper: 'clone',

                appendTo: 'body',

                start: (event, ui) => {
                    if (ui.helper && typeof(options.onStart) === 'function') {
                        options.onStart(event, ui);
                    }

                    this.actions.beginDrag([sourceId], {
                        clientOffset: getEventClientOffset(event.originalEvent),
                        getSourceClientOffset: this.getSourceClientOffset,
                        publishSource: false
                    });

                    this.actions.publishDragSource();
                },

                stop: (event, ui) => {
                    this.actions.hover(this.filterTargets(), {
                        clientOffset: getEventClientOffset(event.originalEvent)
                    });

                    if (typeof(options.onStop) === 'function') {
                        options.onStop(event, ui, this.monitor);
                    }

                    this.hoveredTargets = [];

                    this.actions.drop();
                    this.actions.endDrag();
                },

                ...options.draggable
            });

            this.sourceNodes[sourceId] = {node};
            return () => {
                delete this.sourceNodes[sourceId];
            };
        };
    }

    connectDragPreview (sourceId, node, options) {
        return;
    }

    filterTargets () {
        const maxOrder = Math.max.apply(
            null, this.hoveredTargets.map(t => this.targetNodes[t] && this.targetNodes[t].options.uiOrder || 0)
        );

        return this.hoveredTargets.filter(t =>
          maxOrder === 0 || (this.targetNodes[t] && this.targetNodes[t].options.uiOrder === maxOrder)
        );
    }

    connectDropTarget (targetId, node, options = {}) {
        if (node) {
            $(node).droppable({
                tolerance: 'pointer',

                over: (event, ui) => {
                    this.hoveredTargets.push(targetId);
                    this.actions.hover(this.filterTargets(), {
                        clientOffset: getEventClientOffset(event.originalEvent)
                    });
                },

                out: (event, ui) => {
                    this.hoveredTargets = this.hoveredTargets.filter(t => t !== targetId);

                    this.actions.hover(this.filterTargets(), {
                        clientOffset: getEventClientOffset(event.originalEvent)
                    });
                },

                ...options.droppable
            })

            this.targetNodes[targetId] = {node, options};
            return () => {
                delete this.targetNodes[targetId];
            };
        }
    }

    getSourceClientOffset = (sourceId) => {
        return getNodeClientOffset(this.sourceNodes[sourceId].node);
    }
}

export default function createJQueryBackend (jQuery, optionsOrManager = {}) {
    $ = jQuery;

    const jQueryBackendFactory = function (manager) {
        return new JQueryBackend(manager, optionsOrManager);
    };

    if (optionsOrManager.getMonitor) {
        return jQueryBackendFactory(optionsOrManager);
    } else {
        return jQueryBackendFactory;
    }
}
