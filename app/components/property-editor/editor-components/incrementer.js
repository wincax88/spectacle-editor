import React, { Component } from "react";
import { CARET } from "../../../assets/icons";
import styles from "./incrementer.css";
import { get } from "lodash";

export default class Incrementer extends Component {
  static propTypes = {
    propertyName: React.PropTypes.string,
    currentElement: React.PropTypes.object
  }

  static contextTypes = {
    store: React.PropTypes.object
  }

  updateStore(updatedValue = 0) {
    const { currentElement } = this.context.store;
    const { style } = currentElement.props;
    const updatedStyleProp = {};

    updatedStyleProp[this.props.propertyName] = updatedValue;

    const updatedStyles = { ...style, ...updatedStyleProp };

    this.context.store.updateElementProps({ style: updatedStyles });
  }

  handleIncrement = (num) => {
    const { propertyName, currentElement } = this.props;
    const property = currentElement.props.style[propertyName];

    return () => {
      this.updateStore(property + num);
    };
  }

  handleChange = (ev) => {
    const value = parseInt(ev.target.value.match(/[0-9]*/)[0], 10);
    const result = isNaN(value) ? "" : value;

    this.updateStore(result);
  }

  handleCursorPosition(ev) {
    const { value } = ev.target;
    const numLength = value.length;

    ev.target.setSelectionRange(0, numLength);
  }

  render() {
    const { currentElement, propertyName } = this.props;
    const property = currentElement ?
      get(currentElement.props.style, propertyName) : 0;

    return (
      <div className={styles.incrementerWrapper}>
        <input type="text"
          onFocus={this.handleCursorPosition}
          value={property || ""}
          onChange={this.handleChange}
        />
        <span className={styles.caretContainer}>
          <div
            onClick={this.handleIncrement(1)}
            className={`${styles.caretBox} ${styles.incrementUp}`}
            dangerouslySetInnerHTML={{ __html: CARET }}
          >
          </div>
          <div
            onClick={this.handleIncrement(-1)}
            className={`${styles.caretBox} ${styles.incrementDown}`}
            dangerouslySetInnerHTML={{ __html: CARET }}
          >
          </div>
        </span>
      </div>
    );
  }
}
