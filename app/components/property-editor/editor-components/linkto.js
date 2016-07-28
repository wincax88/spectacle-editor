import React, { Component } from "react";
import styles from "./linkto.css";

const normalizeUrl = (url) => {
  if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
    return url;
  }

  return `http://${url}`;
};

export default class LinkTo extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  }

  static propTypes = {
    currentElement: React.PropTypes.object
  }

  onUrlChange = (ev) => {
    const url = ev.target.value;

    const { style } = this.context.store.currentElement.props;

    if (url) {
      this.context.store.updateElementProps({
        href: url,
        style: { ...style, textDecoration: "underline" }
      });

      return;
    }

    this.context.store.updateElementProps({
      href: null,
      style: { ...style, textDecoration: "none" }
    });
  }

  onBlurUrl = () => {
    if (this.props.currentElement.props.href) {
      const formattedUrl = normalizeUrl(this.props.currentElement.props.href);

      this.context.store.updateElementProps({ href: formattedUrl });
    }
  }

  render() {
    return (
      <input
        className={styles.inputBox}
        placeholder="http://"
        type="text"
        onChange={this.onUrlChange}
        onBlur={this.onBlurUrl}
        value={this.props.currentElement.props.href || ""}
      />
    );
  }
}
