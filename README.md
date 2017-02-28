# react-drag-tool

react drag and drop tools

[![npm version](https://badge.fury.io/js/react-drag-tool.png)](https://badge.fury.io/js/react-drag-tool)
[![build status](https://travis-ci.org/twobin/react-drag-tool.svg)](https://travis-ci.org/twobin/react-drag-tool)
[![npm downloads](https://img.shields.io/npm/dt/react-drag-tool.svg?style=flat-square)](https://www.npmjs.com/package/react-drag-tool)

## usage

```
$ npm i -S react-drag-tool
```

## docs

### react-drag-tool

```
import DragTool from 'react-drag-tool';

```

### props

```
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
```
