import React, { Component } from "react";
import { BRINGTOFRONT, BRINGFORWARD, SENDBACKWARD, SENDTOBACK } from "../../../../assets/icons";

import styles from "./index.css";

class Arrange extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  }

  onTouchFront = (ev) => {
    ev.preventDefault();
    this.onClickFront(ev.touches[0]);
  }

  onClickFront = () => {
    this.context.store.setCurrentElementToFrontOrBack(true);
  }

  onTouchForward = (ev) => {
    ev.preventDefault();
    this.onClickForward(ev.touches[0]);
  }

  onClickForward = () => {
    this.context.store.incrementCurrentElementIndexBy(1);
  }

  onTouchBackward = (ev) => {
    ev.preventDefault();
    this.onClickBackward(ev.touches[0]);
  }

  onClickBackward = () => {
    this.context.store.incrementCurrentElementIndexBy(-1);
  }

  onTouchBack = (ev) => {
    ev.preventDefault();
    this.onClickBack(ev.touches[0]);
  }

  onClickBack = () => {
    this.context.store.setCurrentElementToFrontOrBack();
  }

  render() {
    return (
      <div className={styles.arrangeContainer}>
        <div className={styles.arrange}>
          <button
            className={styles.arrangeButton}
            onClick={this.onClickFront}
            onTouchStart={this.onTouchFront}
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
            onTouchStart={this.onTouchForward}
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
            onTouchStart={this.onTouchBackward}
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
            onTouchStart={this.onTouchBack}
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
