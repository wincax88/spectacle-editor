import React, { Component } from "react";
import { BRINGTOFRONT, BRINGFORWARD, SENDBACKWARD, SENDTOBACK } from "../../../../assets/icons";

import styles from "./index.css";

class Arrange extends Component {
  static propTypes = {
    scale: React.PropTypes.number,
    height: React.PropTypes.number,
    width: React.PropTypes.number
  };

  static contextTypes = {
    store: React.PropTypes.object
  };

  onClickFront = () => {
    this.context.store.setCurrentElementToFrontOrBack(true);
  }

  onClickForward = () => {
    this.context.store.incrementCurrentElementIndexBy(1);
  }

  onClickBackward = () => {
    this.context.store.incrementCurrentElementIndexBy(-1);
  }

  onClickBack = () => {
    this.context.store.setCurrentElementToFrontOrBack();
  }

  render() {
    const scale = 1 / this.props.scale;
    const heightOffset = ((this.props.height * scale) - this.props.height) / 2;
    const yScale = this.props.height + heightOffset + (20 * scale);
    const xScale = (this.props.width / 2) - (100 * scale);

    const containerStyles = {
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      bottom: `${yScale}px`,
      left: `${xScale}px`
    };

    return (
      <div className={styles.arrangeContainer} style={containerStyles}>
        <div className={styles.arrange}>
          <button
            className={styles.arrangeButton}
            onClick={this.onClickFront}
          >
            <i
              className={styles.arrangeIcon}
              dangerouslySetInnerHTML={{ __html: BRINGTOFRONT }}
              title="Bring to front"
            />
          </button>
          <button
            className={styles.arrangeButton}
            onClick={this.onClickForward}
          >
            <i
              className={styles.arrangeIcon}
              dangerouslySetInnerHTML={{ __html: BRINGFORWARD }}
              title="Bring forward"
            />
          </button>
          <button
            className={styles.arrangeButton}
            onClick={this.onClickBackward}
          >
            <i
              className={styles.arrangeIcon}
              dangerouslySetInnerHTML={{ __html: SENDBACKWARD }}
              title="Send backward"
            />
          </button>
          <button
            className={styles.arrangeButton}
            onClick={this.onClickBack}
          >
            <i
              className={styles.arrangeIcon}
              dangerouslySetInnerHTML={{ __html: SENDTOBACK }}
              title="Send to back"
            />
          </button>
        </div>
      </div>
    );
  }
}

export default Arrange;
