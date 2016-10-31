(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define("react-dnd-jquery-backend", ["jQuery"], factory);
	else if(typeof exports === 'object')
		exports["react-dnd-jquery-backend"] = factory(require("jQuery"));
	else
		root["react-dnd-jquery-backend"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.JQueryBackend = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	exports.default = createJQueryBackend;

	var _jquery = __webpack_require__(1);

	var _jquery2 = _interopRequireDefault(_jquery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function getEventClientOffset(e) {
	    return {
	        x: e.clientX,
	        y: e.clientY
	    };
	}

	var ELEMENT_NODE = 1;

	function getNodeClientOffset(node) {
	    var el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

	    if (!el) {
	        return null;
	    }

	    var _el$getBoundingClient = el.getBoundingClientRect(),
	        top = _el$getBoundingClient.top,
	        left = _el$getBoundingClient.left;

	    return { x: left, y: top };
	}

	var JQueryBackend = exports.JQueryBackend = function () {
	    function JQueryBackend(manager) {
	        var _this = this;

	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	        _classCallCheck(this, JQueryBackend);

	        this.getSourceClientOffset = function (sourceId) {
	            return getNodeClientOffset(_this.sourceNodes[sourceId].node);
	        };

	        this.actions = manager.getActions();
	        // this.monitor = manager.getMonitor();
	        // this.registry = manager.getRegistry();

	        this.sourceNodes = {};
	        this.hoveredTargets = [];
	        this.targetNodes = {};

	        this._mouseClientOffset = {};
	    }

	    _createClass(JQueryBackend, [{
	        key: 'setup',
	        value: function setup() {
	            if (typeof window === 'undefined') {
	                return;
	            }

	            if (this.constructor.isSetUp) {
	                throw new Error('Cannot have two jQuery backends at the same time.');
	            }

	            this.constructor.isSetUp = true;
	        }
	    }, {
	        key: 'teardown',
	        value: function teardown() {
	            if (typeof window === 'undefined') {
	                return;
	            }

	            this.constructor.isSetUp = false;
	            this._mouseClientOffset = {};
	        }
	    }, {
	        key: 'connectDragSource',
	        value: function connectDragSource(sourceId, node) {
	            var _this2 = this;

	            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	            if (node) {
	                (0, _jquery2.default)(node).draggable({
	                    greedy: true,

	                    helper: 'clone',

	                    appendTo: 'body',

	                    start: function start(event, ui) {
	                        if (ui.helper && typeof options.onStart === 'function') {
	                            options.onStart(event, ui);
	                        }

	                        _this2.actions.beginDrag([sourceId], {
	                            clientOffset: _this2._mouseClientOffset,
	                            getSourceClientOffset: _this2.getSourceClientOffset,
	                            publishSource: false
	                        });

	                        _this2.actions.publishDragSource();
	                    },

	                    stop: function stop(event, ui) {
	                        _this2.hoveredTargets = [];

	                        _this2.actions.drop();
	                        _this2.actions.endDrag();
	                    },

	                    drag: function drag(event, ui) {}
	                });

	                this.sourceNodes[sourceId] = { node: node };
	                return function () {
	                    delete _this2.sourceNodes[sourceId];
	                };
	            };
	        }
	    }, {
	        key: 'connectDragPreview',
	        value: function connectDragPreview(sourceId, node, options) {
	            return;
	        }
	    }, {
	        key: 'filterTargets',
	        value: function filterTargets() {
	            var _this3 = this;

	            var maxOrder = Math.max.apply(null, this.hoveredTargets.map(function (t) {
	                return _this3.targetNodes[t].options.uiOrder;
	            }));

	            return this.hoveredTargets.filter(function (t) {
	                return _this3.targetNodes[t].options.uiOrder === maxOrder;
	            });
	        }
	    }, {
	        key: 'connectDropTarget',
	        value: function connectDropTarget(targetId, node, options) {
	            var _this4 = this;

	            if (node) {
	                (0, _jquery2.default)(node).droppable({
	                    over: function over(event, ui) {
	                        _this4.hoveredTargets.push(targetId);

	                        _this4.actions.hover(_this4.filterTargets(), {
	                            clientOffset: getEventClientOffset(event.originalEvent)
	                        });
	                    },

	                    out: function out(event, ui) {
	                        _this4.hoveredTargets = _this4.hoveredTargets.filter(function (t) {
	                            return t !== targetId;
	                        });

	                        _this4.actions.hover(_this4.filterTargets(), {
	                            clientOffset: getEventClientOffset(event.originalEvent)
	                        });
	                    }
	                });

	                this.targetNodes[targetId] = { node: node, options: options };
	                return function () {
	                    delete _this4.targetNodes[targetId];
	                };
	            }
	        }
	    }]);

	    return JQueryBackend;
	}();

	function createJQueryBackend() {
	    var optionsOrManager = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    var jQueryBackendFactory = function jQueryBackendFactory(manager) {
	        return new JQueryBackend(manager, optionsOrManager);
	    };

	    if (optionsOrManager.getMonitor) {
	        return jQueryBackendFactory(optionsOrManager);
	    } else {
	        return jQueryBackendFactory;
	    }
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }
/******/ ])
});
;