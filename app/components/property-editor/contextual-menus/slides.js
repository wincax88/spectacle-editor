import React, { Component } from "react";
import { observer } from "mobx-react";
import { without } from "lodash";

import { ColorPicker } from "../editor-components/index.js";
import styles from "../index.css";

@observer
export default class SlideMenu extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  handleColorChange = (hex, opacity) => {
    const style = this.context.store.currentSlide.props.style;
    const updatedColor = {};

    if (style.backgroundColor !== hex) {
      updatedColor.backgroundColor = hex;
    }

    if (style.opacity !== opacity) {
      updatedColor.opacity = opacity;
    }

    if (updatedColor.opacity === undefined && updatedColor.backgroundColor === undefined) {
      return;
    }

    const updatedStyles = {
      ...style,
      ...updatedColor
    };

    this.context.store.updateSlideProps({ style: updatedStyles });
  }

  handleTransitionChange = (ev) => {
    const { value, checked } = ev.target;
    const currentTransitionArray = this.context.store.currentSlide.props.transition;
    let newTransitionArray;

    if (checked) {
      newTransitionArray = currentTransitionArray.concat([value]);
    } else {
      newTransitionArray = without(currentTransitionArray, value);
    }

    this.context.store.updateSlideProps({ transition: newTransitionArray });
  }

  render() {
    const { currentSlide: { props: { style, transition } } } = this.context.store;

    return (
      <div className={styles.wrapper}>
        <h3 className={styles.heading}>Slides</h3>
        <hr className={styles.hr} />
        <div className={styles.row}>
          <div className={`${styles.flexrow} ${styles.flexspacebetween}`}>
            <div>
              <div className={styles.subHeading}>
                Background Color
              </div>
              <ColorPicker currentStyles={style} onChangeColor={this.handleColorChange} />
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={`${styles.flexrow} ${styles.flexspacebetween}`}>
            <div>
              <div className={styles.subHeading}>
                Transition
              </div>
              <label className={styles.checkboxLabel} >
                <input
                  type="checkbox"
                  name="transitions"
                  value="slide"
                  onChange={this.handleTransitionChange}
                  checked={transition.includes("slide")}
                />
                Slide
              </label>
              <label className={styles.checkboxLabel} >
                <input
                  type="checkbox"
                  name="transitions"
                  value="zoom"
                  onChange={this.handleTransitionChange}
                  checked={transition.includes("zoom")}
                />
                Zoom
              </label>
              <label className={styles.checkboxLabel} >
                <input
                  type="checkbox"
                  name="transitions"
                  value="fade"
                  onChange={this.handleTransitionChange}
                  checked={transition.includes("fade")}
                />
                Fade
              </label>
              <label className={styles.checkboxLabel} >
                <input
                  type="checkbox"
                  name="transitions"
                  value="spin"
                  onChange={this.handleTransitionChange}
                  checked={transition.includes("spin")}
                />
                Spin
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
