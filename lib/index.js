'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function classNames() {
  var classes = '';

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!arg) continue;

    var argType = typeof arg === 'undefined' ? 'undefined' : _typeof(arg);

    if ('string' === argType || 'number' === argType) {
      classes += ' ' + arg;
    } else if (Array.isArray(arg)) {
      classes += ' ' + classNames.apply(null, arg);
    } else if ('object' === argType) {
      for (var key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes += ' ' + key;
        }
      }
    }
  }
  return classes.substr(1);
}

var emptyFunction = function emptyFunction() {};
var CX = classNames;

function createUIEvent(draggable) {
  return {
    position: {
      top: draggable.state.pageY,
      left: draggable.state.pageX
    }
  };
}

function canDragY(draggable) {
  return draggable.props.axis === 'both' || draggable.props.axis === 'y';
}

function canDragX(draggable) {
  return draggable.props.axis === 'both' || draggable.props.axis === 'x';
}

function isFunction(func) {
  return typeof func === 'function' || Object.prototype.toString.call(func) === '[object Function]';
}

// @credits https://gist.github.com/rogozhnikoff/a43cfed27c41e4e68cdc
function findInArray(array, callback) {
  for (var i = 0, length = array.length, element = null; i < length; i += 1) {
    element = array[i];

    if (callback.apply(callback, [element, i, array])) {
      return element;
    }
  }
}

function matchesSelector(el, selector) {
  var method = findInArray(['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'], function (method) {
    return isFunction(el[method]);
  });

  return el[method].call(el, selector);
}

// @credits:
// http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
/* Conditional to fix node server side rendering of component */
var isTouchDevice = false;
if (typeof window === 'undefined') {
  // Do Node Stuff
  var _isTouchDevice = false;
} else {
  // Do Browser Stuff
  var _isTouchDevice2 = 'ontouchstart' in window // works on most browsers
  || 'onmsgesturechange' in window; // works on ie10 on ms surface
  // Check for IE11
  try {
    document.createEvent('TouchEvent');
  } catch (e) {
    _isTouchDevice2 = false;
  }
}

// look ::handleDragStart
//function isMultiTouch(e) {
//  return e.touches && Array.isArray(e.touches) && e.touches.length > 1
//}

/**
 * simple abstraction for dragging events names
 * */
var dragEventFor = function () {
  var eventsFor = {
    touch: {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    },
    mouse: {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup'
    }
  };
  return eventsFor[isTouchDevice ? 'touch' : 'mouse'];
}();

/**
 * get {pageX, pageY} positions of control
 * */
function getControlPosition(e) {
  var position = e.touches && e.touches[0] || e;

  return {
    pageX: position.pageX,
    pageY: position.pageY
  };
}

function getBoundPosition(pageX, pageY, bound, target) {
  if (bound) {
    if (typeof bound !== 'string' && bound.toLowerCase() !== 'parent' && (typeof bound === 'undefined' ? 'undefined' : _typeof(bound)) !== 'object') {
      console.warn('Bound should either "parent" or an object');
    }

    var par = target.parentNode;
    var topLimit = bound.top || 0;
    var leftLimit = bound.left || 0;
    var rightLimit = bound.right || par.offsetWidth;
    var bottomLimit = bound.bottom || par.offsetHeight;
    pageX = Math.min(pageX, rightLimit - target.offsetWidth);
    pageY = Math.min(pageY, bottomLimit - target.offsetHeight);
    pageX = Math.max(leftLimit, pageX);
    pageY = Math.max(topLimit, pageY);
  }
  return {
    pageX: pageX,
    pageY: pageY
  };
}

function addEvent(el, event, handler) {
  if (!el) {
    return;
  }

  if (el.addEventListener) {
    el.addEventListener(event, handler, false);
  } else if (el.attachEvent) {
    el.attachEvent('on' + event, handler);
  } else {
    el['on' + event] = handler;
  }
}

function removeEvent(el, event, handler) {
  if (!el) {
    return;
  }

  if (el.removeEventListener) {
    el.removeEventListener(event, handler, false);
  } else if (el.detachEvent) {
    el.detachEvent('on' + event, handler);
  } else {
    el['on' + event] = null;
  }
}

var ReactDragTool = function (_Component) {
  _inherits(ReactDragTool, _Component);

  function ReactDragTool(props) {
    _classCallCheck(this, ReactDragTool);

    var _this = _possibleConstructorReturn(this, (ReactDragTool.__proto__ || Object.getPrototypeOf(ReactDragTool)).call(this, props));

    _this.handleDragStart = function (e) {
      // todo: write right implementation to prevent multitouch drag
      // prevent multi-touch events
      // if (isMultiTouch(e)) {
      //     this.handleDragEnd.apply(e, arguments);
      //     return
      // }
      // e.preventDefault();

      // Short circuit if handle or cancel prop was provided
      // and selector doesn't match
      if (_this.props.handle && !matchesSelector(e.target, _this.props.handle) || _this.props.cancel && matchesSelector(e.target, _this.props.cancel)) {
        return;
      }

      // Make it possible to attach event handlers on top of this one
      _this.props.onMouseDown(e);

      var node = _reactDom2.default.findDOMNode(_this);

      var dragPoint = getControlPosition(e);

      // Initiate dragging
      _this.setState({
        dragging: true,
        offsetX: parseInt(dragPoint.pageX, 10),
        offsetY: parseInt(dragPoint.pageY, 10),
        startX: parseInt(node.style.left, 10) || 0,
        startY: parseInt(node.style.top, 10) || 0
      });

      // Call event handler
      if (_this.props.onStart) {
        _this.props.onStart(e, createUIEvent(_this));
      }

      // Add event handlers
      addEvent(document, dragEventFor.move, _this.handleDrag);
      addEvent(document, dragEventFor.end, _this.handleDragEnd);
    };

    _this.handleDrag = function (e) {
      // Prevent the default behavior
      e.preventDefault();

      var dragPoint = getControlPosition(e);

      // Calculate top and left
      var pageX = _this.state.startX + (dragPoint.pageX - _this.state.offsetX);
      var pageY = _this.state.startY + (dragPoint.pageY - _this.state.offsetY);
      var pos = getBoundPosition(pageX, pageY, _this.props.bound, _reactDom2.default.findDOMNode(_this));
      pageX = pos.pageX;
      pageY = pos.pageY;

      // Snap to grid if prop has been provided
      if (Array.isArray(_this.props.grid)) {
        var directionX = pageX < parseInt(_this.state.pageX, 10) ? -1 : 1;
        var directionY = pageY < parseInt(_this.state.pageY, 10) ? -1 : 1;

        pageX = Math.abs(pageX - parseInt(_this.state.pageX, 10)) >= _this.props.grid[0] ? parseInt(_this.state.pageX, 10) + _this.props.grid[0] * directionX : _this.state.pageX;

        pageY = Math.abs(pageY - parseInt(_this.state.pageY, 10)) >= _this.props.grid[1] ? parseInt(_this.state.pageY, 10) + _this.props.grid[1] * directionY : _this.state.pageY;
      }

      // Update top and left
      _this.setState({
        pageX: pageX,
        pageY: pageY
      });

      // Call event handler
      if (_this.props.onDrag) {
        _this.props.onDrag(e, createUIEvent(_this));
      }
    };

    _this.handleDragEnd = function (e) {
      // Short circuit if not currently dragging
      e.preventDefault();

      if (!_this.state.dragging) {
        return;
      }

      // Turn off dragging
      _this.setState({
        dragging: false
      });

      // Call event handler
      if (_this.props.onStop) {
        _this.props.onStop(e, createUIEvent(_this));
      }

      // Remove event handlers
      removeEvent(document, dragEventFor.move, _this.handleDrag);
      removeEvent(document, dragEventFor.end, _this.handleDragEnd);
    };

    _this.state = {
      // Whether or not currently dragging
      dragging: false,

      // Start top/left of this.getDOMNode()
      startX: 0,
      startY: 0,

      // Offset between start top/left and mouse top/left
      offsetX: 0,
      offsetY: 0,

      // Current top/left of this.getDOMNode()
      pageX: _this.props.start.x,
      pageY: _this.props.start.y
    };
    return _this;
  }

  _createClass(ReactDragTool, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.start !== nextProps.start) {
        this.setState({
          pageX: nextProps.start.x,
          pageY: nextProps.start.y
        });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // Remove any leftover event handlers
      removeEvent(document, dragEventFor.move, this.handleDrag);
      removeEvent(document, dragEventFor.end, this.handleDragEnd);
    }
  }, {
    key: 'render',
    value: function render() {
      var originalStyle = this.props.children.props.style;
      var style = {
        position: 'absolute',
        // Set top if vertical drag is enabled
        top: canDragY(this) ? this.state.pageY : this.state.startY,

        // Set left if horizontal drag is enabled
        left: canDragX(this) ? this.state.pageX : this.state.startX
      };

      for (var s in originalStyle) {
        style[s] = originalStyle[s];
      }

      var className = CX({
        'react-drag-tool': true,
        'react-drag-tool-dragging': this.state.dragging
      });
      var oldClass = this.props.children.props.className;

      if (oldClass) {
        className = oldClass + ' ' + className;
      }

      return _react2.default.cloneElement(_react2.default.Children.only(this.props.children), {
        style: style,
        className: className,
        onMouseDown: this.handleDragStart,
        onMouseUp: this.handleDragEnd,
        onTouchStart: this.handleDragStart,
        onTouchEnd: this.handleDragEnd
      });
      // Reuse the child provided
      // This makes it flexible to use whatever element is wanted (div, ul, etc)
    }
  }]);

  return ReactDragTool;
}(_react.Component);

ReactDragTool.displayName = 'redrag';
ReactDragTool.propTypes = {
  /**
   * `axis` determines which axis the draggable can move.
   *
   * 'both' allows movement horizontally and vertically.
   * 'x' limits movement to horizontal axis.
   * 'y' limits movement to vertical axis.
   *
   * Defaults to 'both'.
   */
  axis: _react.PropTypes.oneOf(['both', 'x', 'y']),

  /**
   * `handle` specifies a selector to be used as the handle
   * that initiates drag.
   *
   * Example:
   *
   * ```jsx
   *   var App = React.createClass({
   *       render: function () {
   *         return (
   *            <Draggable handle=".handle">
   *              <div>
   *                  <div className="handle">Click me to drag</div>
   *                  <div>This is some other content</div>
   *              </div>
   *           </Draggable>
   *         );
   *       }
   *   });
   * ```
   */
  handle: _react.PropTypes.string,

  /**
   * `cancel` specifies a selector to be used to prevent drag initialization.
   *
   * Example:
   *
   * ```jsx
   *   var App = React.createClass({
   *       render: function () {
   *           return(
   *               <Draggable cancel=".cancel">
   *                   <div>
   *             <div className="cancel">You can't drag from here</div>
   *            <div>Dragging here works fine</div>
   *                   </div>
   *               </Draggable>
   *           );
   *       }
   *   });
   * ```
   */
  cancel: _react.PropTypes.string,

  /**
   * `grid` specifies the x and y that dragging should snap to.
   *
   * Example:
   *
   * ```jsx
   *   var App = React.createClass({
   *       render: function () {
   *           return (
   *               <Draggable grid={[25, 25]}>
   *                   <div>I snap to a 25 x 25 grid</div>
   *               </Draggable>
   *           );
   *       }
   *   });
   * ```
   */
  grid: _react.PropTypes.arrayOf(_react2.default.PropTypes.number),

  /**
   * `start` specifies the x and y that the dragged item should start at
   *
   * Example:
   *
   * ```jsx
   *   var App = React.createClass({
   *       render: function () {
   *           return (
   *               <Draggable start={{x: 25, y: 25}}>
   *                   <div>I start with left: 25px; top: 25px;</div>
   *               </Draggable>
   *           );
   *       }
   *   });
   * ```
   */
  start: _react.PropTypes.object,

  /**
   * Called when dragging starts.
   *
   * Example:
   *
   * ```js
   *  function (event, ui) {}
   * ```
   *
   * `event` is the Event that was triggered.
   * `ui` is an object:
   *
   * ```js
   *  {
   *    position: {top: 0, left: 0}
   *  }
   * ```
   */
  onStart: _react.PropTypes.func,

  /**
   * Called while dragging.
   *
   * Example:
   *
   * ```js
   *  function (event, ui) {}
   * ```
   *
   * `event` is the Event that was triggered.
   * `ui` is an object:
   *
   * ```js
   *  {
   *    position: {top: 0, left: 0}
   *  }
   * ```
   */
  onDrag: _react.PropTypes.func,

  /**
   * Called when dragging stops.
   *
   * Example:
   *
   * ```js
   *  function (event, ui) {}
   * ```
   *
   * `event` is the Event that was triggered.
   * `ui` is an object:
   *
   * ```js
   *  {
   *    position: {top: 0, left: 0}
   *  }
   * ```
   */
  onStop: _react.PropTypes.func,

  /**
   * A workaround option which can be passed if
   * onMouseDown needs to be accessed,
   * since it'll always be blocked (due to that
   * there's internal use of onMouseDown)
   *
   */
  onMouseDown: _react.PropTypes.func,

  /**
   * Defines the bounderies around the element
   * could be dragged. This property could be
   * object or a string. If used as object
   * the bounderies should be defined as:
   *
   * {
   *   left: LEFT_BOUND,
   *   right: RIGHT_BOUND,
   *   top: TOP_BOUND,
   *   bottom: BOTTOM_BOUND
   * }
   *
   * The only acceptable string
   * property is: "parent".
   */
  bound: _react.PropTypes.any
};
ReactDragTool.defaultProps = {
  axis: 'both',
  handle: null,
  cancel: null,
  grid: null,
  bound: false,
  start: {
    x: 0,
    y: 0
  },
  onStart: emptyFunction,
  onDrag: emptyFunction,
  onStop: emptyFunction,
  onMouseDown: emptyFunction
};
;

exports.default = ReactDragTool;