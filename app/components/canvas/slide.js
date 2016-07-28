import React, { Component, PropTypes } from "react";
import { observer } from "mobx-react";

import CanvasElement from "./canvas-element";
import styles from "./slide.css";

@observer
class Slide extends Component {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    isOver: PropTypes.bool.isRequired
  };

  static contextTypes = {
    store: React.PropTypes.object
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      verticalGridLine: null,
      horizontalGridLine: null
    };
  }

  showGridLine = (location, isVertical) => {
    if (isVertical) {
      this.setState({ verticalGridLine: location });
    } else {
      this.setState({ horizontalGridLine: location });
    }
  }

  hideGridLine = (isVertical) => {
    if (isVertical) {
      this.setState({ verticalGridLine: null });
    } else {
      this.setState({ horizontalGridLine: null });
    }
  }

  render() {
    const { isOver } = this.props;
    const { store: { currentSlide, isDragging, isResizing, cursorType } } = this.context;
    const { verticalGridLine, horizontalGridLine } = this.state;

    let slideClass = styles.slide;

    if (isDragging) {
      slideClass += ` ${styles.isDragging}`;
    }

    if (isOver) {
      slideClass += ` ${styles.isOver}`;
    }

    return (
      <div className={slideClass}
        style={{ ...currentSlide.props.style, cursor: isResizing ? cursorType : "auto" }}
        id="slide"
      >
        {currentSlide && currentSlide.children.map((childObj, i) => (
          <CanvasElement
            key={childObj.id}
            component={childObj}
            elementIndex={i}
            isDragging={isDragging}
            showGridLine={this.showGridLine}
            hideGridLine={this.hideGridLine}
          />
        ))}
        {(verticalGridLine === 0 || verticalGridLine) &&
          <div
            className={`${styles.gridLine} ${styles.vertical}`}
            style={{ left: verticalGridLine }}
          />
        }
        {(horizontalGridLine === 0 || horizontalGridLine) &&
          <div
            className={`${styles.gridLine} ${styles.horizontal}`}
            style={{ top: horizontalGridLine }}
          />
        }
      </div>
    );
  }
}

export default Slide;
