import React, { Component, PropTypes } from "react";
import { findDOMNode } from "react-dom";
import { Motion, spring } from "react-motion";
import { omit, defer } from "lodash";

import {
  SpringSettings,
  BLACKLIST_CURRENT_ELEMENT_DESELECT
} from "../../../../constants";
import { getPointsToSnap, snap } from "../../../../utils";
import styles from "./index.css";
import ResizeNode from "../../resize-node";
import Arrange from "../arrange";

export default class ImageElement extends Component {
  static propTypes = {
    elementIndex: PropTypes.number,
    component: PropTypes.shape({
      ComponentClass: React.PropTypes.any.isRequired,
      props: PropTypes.object
    }),
    selected: PropTypes.bool,
    mousePosition: PropTypes.array,
    scale: PropTypes.number,
    showGridLine: PropTypes.func,
    hideGridLine: PropTypes.func
  };

  static contextTypes = {
    store: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      isPressed: false,
      mouseStart: [0, 0],
      delta: [0, 0]
    };
  }

  componentDidMount() {
    defer(() => {
      if (this.currentElementComponent && !this.context.store.isDragging) {
        const { width, height } = this.currentElementComponent.getBoundingClientRect();

        this.setState({ // eslint-disable-line react/no-did-mount-set-state
          width,
          height
        });
      }
    });
  }

  shouldComponentUpdate() {
    // This is needed because of the way the component is passed down
    // React isn't re-rendering this when the contextual menu updates the store
    return true;
  }

  getCursorTypes(el) {
    if (el === this.leftResizeNode || el === this.rightResizeNode) {
      return "ew-resize";
    }

    if (el === this.topLeftNode || el === this.bottomRightNode) {
      return "nwse-resize";
    }

    if (el === this.topRightNode || el === this.bottomLeftNode) {
      return "nesw-resize";
    }

    if (el === this.topResizeNode || el === this.bottomResizeNode) {
      return "ns-resize";
    }
  }

  changeNodeVisibility = (visibilityType = "visible", currentNode) => {
    const dragNodes = [
      this.leftResizeNode,
      this.rightResizeNode,
      this.topLeftNode,
      this.bottomRightNode,
      this.topRightNode,
      this.bottomLeftNode,
      this.topResizeNode,
      this.bottomResizeNode
    ];

    dragNodes.forEach((node) => {
      if (node !== currentNode) {
        const { style } = node;

        style.visibility = visibilityType;
      }
    });
  }

  handleTouchStartResize = (ev) => {
    ev.preventDefault();
    this.handleMouseDownResize(ev.touches[0]);
  }

  handleMouseDownResize = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    const { currentTarget, pageX, pageY } = ev;

    const verticalResize =
      currentTarget !== this.topResizeNode &&
      currentTarget !== this.bottomResizeNode;
    const isLeftSideDrag =
      currentTarget === this.leftResizeNode ||
      currentTarget === this.topLeftNode ||
      currentTarget === this.bottomLeftNode;
    const isTopDrag =
      currentTarget === this.topResizeNode ||
      currentTarget === this.topLeftNode ||
      currentTarget === this.topRightNode;
    const horizontalResize =
      currentTarget !== this.leftResizeNode &&
      currentTarget !== this.rightResizeNode;

    const { width, height } = this.currentElementComponent.getBoundingClientRect();
    const componentProps = this.props.component.props;
    const componentLeft = componentProps.style && componentProps.style.left;
    const componentTop = componentProps.style && componentProps.style.top;
    const left = componentLeft || 0;
    const top = componentTop || 0;

    this.gridLines = this.context.store.gridLines;

    this.changeNodeVisibility("hidden", currentTarget);
    this.context.store.updateElementResizeState(true, this.getCursorTypes(currentTarget));

    this.setState({
      verticalResize,
      isTopDrag,
      isLeftSideDrag,
      horizontalResize,
      width,
      height,
      top,
      left,
      resizeLastX: pageX,
      resizeLastY: pageY
    });

    window.addEventListener("mousemove", this.handleMouseMoveResize);
    window.addEventListener("touchmove", this.handleTouchMoveResize);
    window.addEventListener("mouseup", this.handleMouseUpResize);
    window.addEventListener("touchend", this.handleTouchEndResize);
  }

  handleTouchMoveResize = (ev) => {
    ev.preventDefault();
    this.handleMouseMoveResize(ev.touches[0]);
  }

  handleMouseMoveResize = (ev) => {
    ev.preventDefault();

    const { pageX, pageY } = ev;
    const {
      isLeftSideDrag,
      resizeLastX,
      resizeLastY,
      isTopDrag,
      horizontalResize,
      verticalResize
    } = this.state;

    let { height, width, left, top } = this.state;
    let verticalSnap = false;
    let horizontalSnap = false;
    let lineX;
    let lineY;

    const createSnapCallback = (isVertical, length, offset) => (line, index) => {
      if (line === null) {
        this.props.hideGridLine(isVertical);

        if (isVertical) {
          lineX = null;
          verticalSnap = false;
        } else {
          lineY = null;
          horizontalSnap = false;
        }

        return;
      }

      let pointToAlignWithLine;

      if (index === 0) {
        pointToAlignWithLine = offset;
      }

      if (
        index === 1 ||
        (!isLeftSideDrag && index === 0 && isVertical) ||
        (!isTopDrag && index === 0 && !isVertical)
      ) {
        pointToAlignWithLine = Math.ceil(offset + length / 2);
      }

      if (
        index === 2 ||
        (!isLeftSideDrag && index === 1 && isVertical) ||
        (!isTopDrag && index === 1 && !isVertical)
      ) {
        pointToAlignWithLine = Math.ceil(offset + length);
      }

      const distance = pointToAlignWithLine - line;

      if (isVertical) {
        lineX = line;
      } else {
        lineY = line;
      }

      if (Math.abs(distance) < 15) {
        if (isVertical) {
          if (isLeftSideDrag) {
            left -= distance;
            width += distance;
          } else {
            width -= distance;
          }
          verticalSnap = distance;
        } else {
          if (isTopDrag) {
            top -= distance;
            height += distance;
          } else {
            height -= distance;
          }
          horizontalSnap = distance;
        }
      }
    };

    if (verticalResize || this.shiftHeld) {
      const snapPoints = getPointsToSnap(
        left,
        width,
        (Math.max(pageX, resizeLastX) - Math.min(pageX, resizeLastX)) / 2
      );

      if (isLeftSideDrag) {
        snapPoints.pop();
      } else {
        snapPoints.shift();
      }

      snap(
        this.gridLines.vertical,
        snapPoints,
        createSnapCallback(true, width, left)
      );
    }

    if (horizontalResize || this.shiftHeld) {
      const snapPoints = getPointsToSnap(
        top,
        height,
        (Math.max(pageY, resizeLastY) - Math.min(pageY, resizeLastY)) / 2
      );

      if (isTopDrag) {
        snapPoints.pop();
      } else {
        snapPoints.shift();
      }

      snap(
        this.gridLines.horizontal,
        snapPoints,
        createSnapCallback(false, height, top)
      );
    }

    if (this.shiftHeld && typeof horizontalSnap === "number" && typeof verticalSnap === "number") {
      verticalSnap = Math.abs(verticalSnap) >= Math.abs(horizontalSnap);
      horizontalSnap = Math.abs(horizontalSnap) > Math.abs(verticalSnap);

      if (verticalSnap) {
        this.props.showGridLine(lineX, true);
        this.props.hideGridLine();
      }

      if (horizontalSnap) {
        this.props.showGridLine(lineY);
        this.props.hideGridLine(true);
      }
    } else {
      verticalSnap = verticalSnap !== false && true;
      horizontalSnap = horizontalSnap !== false && true;

      this.props.showGridLine(lineX, true);
      this.props.showGridLine(lineY);
    }

    const delta = [];
    let nextState = {};
    let newWidth = width;

    if (verticalResize || this.shiftHeld) {
      if (isLeftSideDrag) {
        delta[0] = resizeLastX - pageX;
        left = verticalSnap || (horizontalSnap && this.shiftHeld) ? left : left - delta[0];
      } else {
        delta[0] = pageX - resizeLastX;
      }

      newWidth = verticalSnap || (horizontalSnap && this.shiftHeld) ? width : delta[0] + width;

      if (newWidth >= 0) {
        nextState = {
          left,
          width: newWidth,
          resizeLastX: verticalSnap || (horizontalSnap && this.shiftHeld) ? resizeLastX : pageX
        };
      }
    }

    if (horizontalResize || this.shiftHeld) {
      const { component: { props } } = this.props;

      if (isTopDrag) {
        delta[1] = resizeLastY - pageY;

        if (!horizontalSnap && (!this.shiftHeld || !verticalSnap)) {
          top = this.shiftHeld ?
            top - ((delta[1] + (props.height * newWidth) / props.width) - height)
            :
            top - delta[1];
        }
      } else {
        delta[1] = pageY - resizeLastY;
      }

      let newHeight = this.shiftHeld ?
        (delta[1] + (props.height * newWidth) / props.width)
        :
        (delta[1] + height);

      newHeight = horizontalSnap || (this.shiftHeld && verticalSnap) ? height : newHeight;

      if (newHeight >= 0) {
        nextState = {
          ...nextState,
          top,
          height: newHeight,
          resizeLastY: horizontalSnap || (this.shiftHeld && verticalSnap) ? resizeLastY : pageY
        };
      }
    }

    if (Object.keys(nextState).length) {
      this.setState(nextState);
    }
  }

  handleTouchEndResize = (ev) => {
    ev.preventDefault();
    this.handleMouseUpResize(ev.touches[0]);
  }

  handleMouseUpResize = (ev) => {
    ev.preventDefault();
    window.removeEventListener("mousemove", this.handleMouseMoveResize);
    window.removeEventListener("mouseup", this.handleMouseUpResize);
    window.removeEventListener("touchmove", this.handleTouchMoveResize);
    window.removeEventListener("touchend", this.handleTouchEndResize);

    this.props.hideGridLine(true);
    this.props.hideGridLine(false);

    this.context.store.updateElementResizeState(false);
    this.changeNodeVisibility();

    const { width, left, top, height } = this.state;
    const propStyles = { ...this.props.component.props.style, width, left, top, height };

    this.context.store.updateElementProps({ style: propStyles });
  }

  handleKeyDown = (ev) => {
    if (ev.shiftKey) {
      window.addEventListener("keyup", this.handleKeyUp);
      this.shiftHeld = true;
    }
  }

  handleKeyUp = (ev) => {
    if (!ev.shiftKey) {
      window.removeEventListener("keyup", this.handleKeyUp);
      this.shiftHeld = false;
    }
  }

  handleTouchStart = (ev) => {
    ev.preventDefault();
    this.handleMouseDown(ev.touches[0]);
  }

  handleTouchMove = (ev) => {
    ev.preventDefault();
    this.handleMouseMove(ev.touches[0]);
  }

  handleMouseMove = ({ pageX, pageY, offsetX, offsetY, target: { id } }) => {
    const {
      mouseStart: [x, y],
      mouseOffset: [mouseOffsetX, mouseOffsetY],
      originalPosition: [originalX, originalY],
      width,
      height
    } = this.state;

    const newDelta = [pageX - x, pageY - y];

    // Note: This doesn't handle the case of the mouse being off the slide and part of the element
    // still on the slide. AKA no gridlines or snapping will occur when mouse is outside of the
    // slide.
    if (id === "slide") {
      const createSnapCallback = (isVertical, length, originalPoint) => (line, index) => {
        if (line === null) {
          this.props.hideGridLine(isVertical);

          return;
        }

        this.props.showGridLine(line, /* isVertical */ isVertical);

        // Index 0 = starting edge, 1 = middle, 2 = ending edge
        const offset = originalPoint + (length / 2 * index);

        // Set either x or y
        newDelta[isVertical ? 0 : 1] = line - offset;
      };

      snap(
        this.gridLines.horizontal,
        getPointsToSnap(offsetY, height, mouseOffsetY),
        createSnapCallback(false, height, originalY)
      );

      snap(
        this.gridLines.vertical,
        getPointsToSnap(offsetX, width, mouseOffsetX),
        createSnapCallback(true, width, originalX)
      );
    } else {
      this.props.hideGridLine(true);
      this.props.hideGridLine(false);
    }

    this.setState({
      delta: newDelta
    });
  }

  handleMouseDown = (ev) => {
    ev.preventDefault();

    this.clickStart = new Date().getTime();
    this.context.store.setCurrentElementIndex(this.props.elementIndex);

    const { pageX, pageY, target } = ev;
    const boundingBox = target.getBoundingClientRect();
    const mouseOffset = [Math.floor(boundingBox.left - pageX), Math.floor(boundingBox.top - pageY)];
    const originalPosition = [
      this.props.component.props.style.left,
      this.props.component.props.style.top
    ];

    const { width, height } = this.currentElementComponent.getBoundingClientRect();

    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("touchend", this.handleMouseUp);

    // Do this preemptively so that dragging doesn't take the performance hit
    this.gridLines = this.context.store.gridLines;

    // Only do drag if we hold the mouse down for a bit
    this.mouseClickTimeout = setTimeout(() => {
      this.clickStart = null;
      this.mouseClickTimeout = null;

      this.context.store.updateElementDraggingState(true, true);

      // Make the cursor dragging everywhere
      document.body.style.cursor = "-webkit-grabbing";

      // TODO: handle elements that aren't absolutely positioned?
      this.setState({
        delta: [0, 0],
        mouseStart: [pageX, pageY],
        isPressed: true,
        mouseOffset,
        originalPosition,
        width,
        height
      });

      window.addEventListener("touchmove", this.handleTouchMove);
      window.addEventListener("mousemove", this.handleMouseMove);
    }, 150);
  }

  handleMouseUp = () => {
    if (this.mouseClickTimeout || this.mouseClickTimeout === 0) {
      clearTimeout(this.mouseClickTimeout);
      window.removeEventListener("mouseup", this.handleMouseUp);
      window.removeEventListener("touchend", this.handleMouseUp);

      this.mouseClickTimeout = null;

      // this.props.onDropElement(this.props.elementType);
      const timeSinceMouseDown = new Date().getTime() - this.clickStart;

      // Give the user the remainder of the 250ms to do a double click
      setTimeout(() => {
        this.clickStart = null;
      }, 250 - timeSinceMouseDown);

      return;
    }

    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener("touchend", this.handleMouseUp);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);

    // Reset the cursor dragging to auto
    document.body.style.cursor = "auto";

    this.props.hideGridLine(false);
    this.props.hideGridLine(true);

    this.context.store.updateElementDraggingState(false);
    this.context.store.updateElementProps({
      style: {
        left: this.state.delta[0] + this.props.component.props.style.left,
        top: this.state.delta[1] + this.props.component.props.style.top
      }
    });

    this.setState({
      delta: [0, 0],
      mouseStart: [0, 0],
      isPressed: false
    });
  }

  render() {
    const {
      elementIndex,
      selected,
      component: { ComponentClass, props },
      mousePosition,
      scale
    } = this.props;

    const {
      width,
      height,
      isPressed,
      delta: [x, y],
      left,
      top
    } = this.state;

    const currentlySelected = selected || elementIndex === this.context.store.currentElementIndex;

    if (currentlySelected) {
      window.addEventListener("keydown", this.handleKeyDown);
    } else {
      window.removeEventListener("keydown", this.handleKeyDown);
      window.removeEventListener("keyup", this.handleKeyUp);
    }

    const extraClasses = currentlySelected ? ` ${styles.selected}` : "";
    const wrapperStyle = {};
    const motionStyles = {};
    let elementStyle = props.style ? { ...props.style } : {};
    const { isDragging, isResizing, cursorType } = this.context.store;

    if (currentlySelected && isResizing) {
      this.currentElementComponent.style.cursor = cursorType;
    } else if (currentlySelected && this.currentElementComponent && !isDragging) {
      this.currentElementComponent.style.cursor = "move";
    }

    if (isDragging) {
      wrapperStyle.pointerEvents = "none";
    }

    if (mousePosition || props.style && props.style.position === "absolute") {
      wrapperStyle.position = "absolute";

      const mouseX = mousePosition && mousePosition[0] ? mousePosition[0] : null;
      motionStyles.left = spring(
        mouseX && mouseX || props.style && props.style.left || 0,
        SpringSettings.DRAG
      );
      const mouseY = mousePosition && mousePosition[1] ? mousePosition[1] : null;
      motionStyles.top = spring(
        mouseY && mouseY || props.style && props.style.top || 0,
        SpringSettings.DRAG
      );

      motionStyles.width = spring((width && width || 0), SpringSettings.RESIZE);
      motionStyles.height = spring((height && height || 0), SpringSettings.RESIZE);

      if (mousePosition) {
        wrapperStyle.whiteSpace = "nowrap";
      }

      if (scale) {
        wrapperStyle.transform = `scale(${scale})`;
      }
    }

    elementStyle = { ...elementStyle, position: "relative", left: 0, top: 0 };

    if (currentlySelected && isPressed) {
      motionStyles.left = spring((props.style && props.style.left || 0) + x, SpringSettings.DRAG);
      motionStyles.top = spring((props.style && props.style.top || 0) + y, SpringSettings.DRAG);
    }

    if (currentlySelected && isResizing) {
      const componentStylesLeft = props.style && props.style.left || 0;
      const componentStylesTop = props.style && props.style.top || 0;

      motionStyles.top = spring(
        top === undefined ? componentStylesTop : top,
        SpringSettings.RESIZE
      );
      motionStyles.left = spring(
        left === undefined ? componentStylesLeft : left,
        SpringSettings.RESIZE
      );
      motionStyles.height = spring(height, SpringSettings.RESIZE);
      motionStyles.width = spring(width, SpringSettings.RESIZE);
    }

    return (
        <Motion
          style={motionStyles}
        >
          {computedStyles => {
            const computedDragStyles = omit(computedStyles, "width", "height");
            let computedResizeStyles = omit(computedStyles, "top", "left");

            if (!currentlySelected || !isResizing) {
              computedResizeStyles = {};
            }

            return (
              <div
                className={
                  `${styles.canvasElement} ${extraClasses} ${BLACKLIST_CURRENT_ELEMENT_DESELECT}`
                }
                ref={component => {this.currentElementComponent = component;}}
                style={{ ...wrapperStyle, ...computedDragStyles }}
                onMouseDown={this.handleMouseDown}
                onTouchStart={this.handleTouchStart}
              >
                {currentlySelected &&
                  <ResizeNode
                    cornerTopLeft
                    ref={component => {this.topLeftNode = findDOMNode(component);}}
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
                {currentlySelected &&
                  <ResizeNode
                    ref={component => {this.leftResizeNode = findDOMNode(component);}}
                    alignLeft
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
                {currentlySelected &&
                  <ResizeNode
                    ref={component => {this.bottomLeftNode = findDOMNode(component);}}
                    cornerBottomLeft
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
                {currentlySelected &&
                  <ResizeNode
                    ref={component => {this.topResizeNode = findDOMNode(component);}}
                    alignTop
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
                {currentlySelected && !isResizing && !isDragging &&
                  <Arrange />
                }
                  <ComponentClass
                    ref={component => {this.image = findDOMNode(component);}}
                    {...props}
                    className={styles.image}
                    style={{ ...elementStyle, ...computedResizeStyles, zIndex: elementIndex }}
                  />
                {currentlySelected &&
                  <ResizeNode
                    cornerTopRight
                    ref={component => {this.topRightNode = findDOMNode(component);}}
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
                {currentlySelected &&
                  <ResizeNode
                    alignRight
                    ref={component => {this.rightResizeNode = findDOMNode(component);}}
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
                {currentlySelected &&
                  <ResizeNode
                    ref={component => {this.bottomRightNode = findDOMNode(component);}}
                    cornerBottomRight
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
                {currentlySelected &&
                  <ResizeNode
                    ref={component => {this.bottomResizeNode = findDOMNode(component);}}
                    alignBottom
                    handleMouseDownResize={this.handleMouseDownResize}
                    onTouch={this.handleTouchStartResize}
                    component={this.props.component}
                  />
                }
              </div>
          );}}
        </Motion>
    );
  }
}
