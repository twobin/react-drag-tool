'use strict';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

function classNames() {
  let classes = '';

  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i];
    if (!arg) continue;

    const argType = typeof arg;

    if ('string' === argType || 'number' === argType) {
      classes += ' ' + arg;
    } else if (Array.isArray(arg)) {
      classes += ' ' + classNames.apply(null, arg);
    } else if ('object' === argType) {
      for (const key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes += ' ' + key;
        }
      }
    }
  }
  return classes.substr(1);
}

const emptyFunction = function () {};
const CX = classNames;

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
  return typeof func === 'function' ||
    Object.prototype.toString.call(func) === '[object Function]';
}

// @credits https://gist.github.com/rogozhnikoff/a43cfed27c41e4e68cdc
function findInArray(array, callback) {
  for (let i = 0, length = array.length, element = null; i < length; i += 1) {
    element = array[i];

    if (callback.apply(callback, [element, i, array])) {
      return element;
    }
  }
}

function matchesSelector(el, selector) {
  const method = findInArray([
    'matches',
    'webkitMatchesSelector',
    'mozMatchesSelector',
    'msMatchesSelector',
    'oMatchesSelector'
  ], function (method) {
    return isFunction(el[method]);
  });

  return el[method].call(el, selector);
}

// @credits:
// http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
/* Conditional to fix node server side rendering of component */
let isTouchDevice = false;
if (typeof window === 'undefined') {
    // Do Node Stuff
  let isTouchDevice = false;
} else {
  // Do Browser Stuff
  let isTouchDevice = 'ontouchstart' in window // works on most browsers
    || 'onmsgesturechange' in window; // works on ie10 on ms surface
  // Check for IE11
  try {
    document.createEvent('TouchEvent');
  } catch (e) {
    isTouchDevice = false;
  }

}

// look ::handleDragStart
//function isMultiTouch(e) {
//  return e.touches && Array.isArray(e.touches) && e.touches.length > 1
//}

/**
 * simple abstraction for dragging events names
 * */
const dragEventFor = (function () {
  const eventsFor = {
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
})();

/**
 * get {pageX, pageY} positions of control
 * */
function getControlPosition(e) {
  const position = (e.touches && e.touches[0]) || e;

  return {
    pageX: position.pageX,
    pageY: position.pageY
  };
}

function getBoundPosition(pageX, pageY, bound, target) {
  if (bound) {
    if ((typeof bound !== 'string' && bound.toLowerCase() !== 'parent') &&
        (typeof bound !== 'object')) {
      console.warn('Bound should either "parent" or an object');
    }

    const par = target.parentNode;
    const topLimit = bound.top || 0;
    const leftLimit = bound.left || 0;
    const rightLimit = bound.right || par.offsetWidth;
    const bottomLimit = bound.bottom || par.offsetHeight;
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
  if (!el) { return; }

  if (el.addEventListener) {
    el.addEventListener(event, handler, false);
  } else if (el.attachEvent) {
    el.attachEvent('on' + event, handler);
  } else {
    el['on' + event] = handler;
  }
}

function removeEvent(el, event, handler) {
  if (!el) { return; }

  if (el.removeEventListener) {
    el.removeEventListener(event, handler, false);
  } else if (el.detachEvent) {
    el.detachEvent('on' + event, handler);
  } else {
    el['on' + event] = null;
  }
}

class ReactDragTool extends Component {
  static displayName = 'redrag';

  static propTypes = {
    /**
     * `axis` determines which axis the draggable can move.
     *
     * 'both' allows movement horizontally and vertically.
     * 'x' limits movement to horizontal axis.
     * 'y' limits movement to vertical axis.
     *
     * Defaults to 'both'.
     */
    axis: PropTypes.oneOf(['both', 'x', 'y']),

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
    handle: PropTypes.string,

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
    cancel: PropTypes.string,

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
    grid: PropTypes.arrayOf(React.PropTypes.number),

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
    start: PropTypes.object,

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
    onStart: PropTypes.func,

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
    onDrag: PropTypes.func,

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
    onStop: PropTypes.func,

    /**
     * A workaround option which can be passed if
     * onMouseDown needs to be accessed,
     * since it'll always be blocked (due to that
     * there's internal use of onMouseDown)
     *
     */
    onMouseDown: PropTypes.func,

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
    bound: PropTypes.any
  };

  static defaultProps = {
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
    onMouseDown: emptyFunction,
  };

  constructor(props) {
    super(props);

    this.state = {
      // Whether or not currently dragging
      dragging: false,

      // Start top/left of this.getDOMNode()
      startX: 0,
      startY: 0,

      // Offset between start top/left and mouse top/left
      offsetX: 0,
      offsetY: 0,

      // Current top/left of this.getDOMNode()
      pageX: this.props.start.x,
      pageY: this.props.start.y,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.start !== nextProps.start) {
      this.setState({
        pageX: nextProps.start.x,
        pageY: nextProps.start.y,
      });
    }
  }

  componentWillUnmount() {
    // Remove any leftover event handlers
    removeEvent(document, dragEventFor.move, this.handleDrag);
    removeEvent(document, dragEventFor.end, this.handleDragEnd);
  }

  handleDragStart = (e) => {
    // todo: write right implementation to prevent multitouch drag
    // prevent multi-touch events
    // if (isMultiTouch(e)) {
    //     this.handleDragEnd.apply(e, arguments);
    //     return
    // }
    // e.preventDefault();

    // Short circuit if handle or cancel prop was provided
    // and selector doesn't match
    if ((this.props.handle && !matchesSelector(e.target, this.props.handle)) ||
      (this.props.cancel && matchesSelector(e.target, this.props.cancel))) {
      return;
    }

    // Make it possible to attach event handlers on top of this one
    this.props.onMouseDown(e);

    const node = ReactDOM.findDOMNode(this);

    const dragPoint = getControlPosition(e);

    // Initiate dragging
    this.setState({
      dragging: true,
      offsetX: parseInt(dragPoint.pageX, 10),
      offsetY: parseInt(dragPoint.pageY, 10),
      startX: parseInt(node.style.left, 10) || 0,
      startY: parseInt(node.style.top, 10) || 0
    });

    // Call event handler
    if (this.props.onStart) {
      this.props.onStart(e, createUIEvent(this));
    }

    // Add event handlers
    addEvent(document, dragEventFor.move, this.handleDrag);
    addEvent(document, dragEventFor.end, this.handleDragEnd);
  };

  handleDrag = (e) => {
    // Prevent the default behavior
    e.preventDefault();

    const dragPoint = getControlPosition(e);

    // Calculate top and left
    let pageX = (this.state.startX +
        (dragPoint.pageX - this.state.offsetX));
    let pageY = (this.state.startY +
        (dragPoint.pageY - this.state.offsetY));
    const pos =
      getBoundPosition(pageX, pageY, this.props.bound, ReactDOM.findDOMNode(this));
    pageX = pos.pageX;
    pageY = pos.pageY;

    // Snap to grid if prop has been provided
    if (Array.isArray(this.props.grid)) {
      const directionX = pageX < parseInt(this.state.pageX, 10) ? -1 : 1;
      const directionY = pageY < parseInt(this.state.pageY, 10) ? -1 : 1;

      pageX = Math.abs(pageX - parseInt(this.state.pageX, 10)) >=
          this.props.grid[0]
          ? (parseInt(this.state.pageX, 10) +
            (this.props.grid[0] * directionX))
          : this.state.pageX;

      pageY = Math.abs(pageY - parseInt(this.state.pageY, 10)) >=
          this.props.grid[1]
          ? (parseInt(this.state.pageY, 10) +
            (this.props.grid[1] * directionY))
          : this.state.pageY;
    }

    // Update top and left
    this.setState({
      pageX: pageX,
      pageY: pageY
    });

    // Call event handler
    if (this.props.onDrag) {
      this.props.onDrag(e, createUIEvent(this));
    }
  };

  handleDragEnd = (e) => {
    // Short circuit if not currently dragging
    e.preventDefault();

    if (!this.state.dragging) {
      return;
    }

    // Turn off dragging
    this.setState({
      dragging: false
    });

    // Call event handler
    if (this.props.onStop) {
      this.props.onStop(e, createUIEvent(this));
    }

    // Remove event handlers
    removeEvent(document, dragEventFor.move, this.handleDrag);
    removeEvent(document, dragEventFor.end, this.handleDragEnd);
  };

  render() {
    const originalStyle = this.props.children.props.style;
    let style = {
      position: 'absolute',
      // Set top if vertical drag is enabled
      top: canDragY(this)
        ? this.state.pageY
        : this.state.startY,

        // Set left if horizontal drag is enabled
      left: canDragX(this)
        ? this.state.pageX
        : this.state.startX
    };

    for (let s in originalStyle) {
      style[s] = originalStyle[s];
    }

    let className = CX({
      'react-drag-tool': true,
      'react-drag-tool-dragging': this.state.dragging
    });
    const oldClass = this.props.children.props.className;

    if (oldClass) {
      className = oldClass + ' ' + className;
    }

    return React.cloneElement(
        React.Children.only(this.props.children), {
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
};

export default ReactDragTool;
