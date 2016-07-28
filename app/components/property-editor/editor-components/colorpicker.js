import React, { Component, PropTypes } from "react";
import { SketchPicker } from "react-color";

import { EYEDROPPER } from "../../../assets/icons";
import styles from "./colorpicker.css";

export default class ColorPicker extends Component {
  static propTypes = {
    currentElement: PropTypes.object,
    onChangeColor: PropTypes.func,
    currentStyles: PropTypes.object
  }

  static contextTypes = {
    store: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = { pickerIsOpen: false };
  }

  getRGBAValues({ opacity = 1, color = "#ffffff" }) {
    const removedHash = color.replace(/^#/, "");

    return {
      r: parseInt(removedHash.slice(0, 2), 16),
      g: parseInt(removedHash.slice(2, 4), 16),
      b: parseInt(removedHash.slice(4), 16),
      a: opacity
    };
  }

  handlePickerClose = (ev) => {
    const findClassRecursively = (el) => {
      const classes = el.classList ? Array.prototype.slice.call(el.classList) : [];
      const hasClass = classes.indexOf("color-picker-element") > -1;

      if (hasClass) {
        return true;
      }

      if (!el.parentNode) {
        return false;
      }

      return findClassRecursively(el.parentNode);
    };

    if (!findClassRecursively(ev.target)) {
      ev.preventDefault();
      ev.stopPropagation();
      document.removeEventListener("mousedown", this.handlePickerClose, true);

      this.setState({ pickerIsOpen: false });
    }
  }

  handlePickerOpen = () => {
    document.addEventListener("mousedown", this.handlePickerClose, true);

    this.setState({ pickerIsOpen: true });
  }

  handleChangeComplete = (color) => {
    this.props.onChangeColor(color.hex, color.hsl.a);
  }

  render() {
    const { currentStyles } = this.props;
    const rgba = this.getRGBAValues(currentStyles);

    return (
      <div className={styles.colorWrapper}>
        <div
          onClick={this.handlePickerOpen}
          className={styles.colorPickerTemplateBox}
          style={{ background: currentStyles.color || currentStyles.backgroundColor || "#fff" }}
        >
        </div>
        <button
          onClick={this.handlePickerOpen}
          className={styles.dropper}
          dangerouslySetInnerHTML={{ __html: EYEDROPPER }}
        >
        </button>
        <div
          className={
            `${styles.pickerWrapper}
             ${this.state.pickerIsOpen ? "" : styles.hidden}
             color-picker-element`
            }
        >
          <SketchPicker
            color={rgba}
            onChangeComplete={this.handleChangeComplete}
          />
        </div>
      </div>
    );
  }
}
