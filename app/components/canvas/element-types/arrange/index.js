import React, { Component } from "react";
import { BRINGTOFRONT, BRINGFORWARD, SENDBACKWARD, SENDTOBACK } from "../../../../assets/icons";

import styles from "./index.css";

class Arrange extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  }

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
    return (
      <div className={styles.arrangeContainer}>
        <div className={styles.arrange}>
          <button className={styles.arrangeButton} onClick={this.onClickFront}>
            <i
              className={styles.arrangeIcon}
              dangerouslySetInnerHTML={{ __html: BRINGTOFRONT }}
              title="Bring to front"
            />
          </button>
          <button className={styles.arrangeButton} onClick={this.onClickForward}>
            <i
              className={styles.arrangeIcon}
              dangerouslySetInnerHTML={{ __html: BRINGFORWARD }}
              title="Bring forward"
            />
          </button>
          <button className={styles.arrangeButton} onClick={this.onClickBackward}>
            <i
              className={styles.arrangeIcon}
              dangerouslySetInnerHTML={{ __html: SENDBACKWARD }}
              title="Send backward"
            />
          </button>
          <button className={styles.arrangeButton} onClick={this.onClickBack}>
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
