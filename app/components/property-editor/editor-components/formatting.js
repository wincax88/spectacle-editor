import React, { Component } from "react";
import { QUOTE, UNDERLINE } from "../../../assets/icons";
import styles from "./formatting.css";

export default class Formatting extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  }

  static propTypes = {
    style: React.PropTypes.object,
    currentElement: React.PropTypes.object
  }

  toggleUnderlineStyles = (isUnderlined) => () => {
    let textDecoration;
    if (isUnderlined) {
      textDecoration = "none";
    } else {
      textDecoration = "underline";
    }
    const { style } = this.context.store.currentElement.props;
    const updatedStyles = {
      ...style,
      textDecoration
    };

    this.context.store.updateElementProps({ style: updatedStyles });
  }

  toggleQuoteStyles = (currentQuote) => () => {
    let toggleQuote;
    if (currentQuote) {
      toggleQuote = false;
    } else {
      toggleQuote = true;
    }

    this.context.store.updateElementProps({
      isQuote: toggleQuote,
      listType: null
    });
  }

  render() {
    const { currentElement } = this.props;
    const currentTextDecoration = currentElement.props.style.textDecoration;
    const isUnderlined = currentTextDecoration === "underline";
    const isQuote = currentElement.props.isQuote;

    const quoteButtonClass = isQuote ?
      `${styles.formattingButtonSelected} ${styles.formattingButton}` :
      styles.formattingButton;

    const underlineButtonClass = isUnderlined ?
      `${styles.formattingButtonSelected} ${styles.formattingButton} ${styles.borderRight}` :
      `${styles.formattingButton} ${styles.borderRight}`;

    return (
      <div className={styles.formattingWrapper}>
        <button
          onClick={this.toggleUnderlineStyles(isUnderlined)}
          className={underlineButtonClass}
          dangerouslySetInnerHTML={{ __html: UNDERLINE }}
        >
        </button>
        <button
          onClick={this.toggleQuoteStyles(isQuote)}
          className={quoteButtonClass}
          dangerouslySetInnerHTML={{ __html: QUOTE }}
        >
        </button>
      </div>
    );
  }
}
