import React, { Component } from "react";
import { ipcRenderer } from "electron";
import { autorun } from "mobx";

import { ElementTypes } from "../../../constants";
import elements from "../../../elements";
import { IMAGE } from "../../../assets/icons";
import commonStyles from "../index.css";
import styles from "./image.css";

const defaultImageSource = elements[ElementTypes.IMAGE].props.src;

export default class ImageMenu extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      currentElement: null
    };
  }

  componentDidMount() {
    autorun(() => {
      const { currentElement } = this.context.store;

      window.clearTimeout(this.stateTimeout);

      if (!currentElement) {
        this.stateTimeout = window.setTimeout(() => {
          this.setState({ currentElement });
        }, 400);

        return;
      }

      if (currentElement.type === ElementTypes.IMAGE) {
        this.setState({ currentElement });
      }
    });
  }

  onImageUpload = (ev) => {
    const imageObj = ev.target.files && ev.target.files[0];

    if (imageObj) {
      const { path, type, name } = imageObj;

      ipcRenderer.once("image-encoded", (event, encodedImageString) => {
        if (!encodedImageString) {
          this.setState({ uploadError: true });
        }

        this.context.store.updateElementProps({
          src: `data:${type};base64, ${encodedImageString}`,
          imageName: name,
          style: {
            opacity: 1
          }
        });
      });

      ipcRenderer.send("encode-image", path);
    }
  }

  onSourceChange = (ev) => {
    const imageSrc = ev.target.value;

    if (imageSrc) {
      this.context.store.updateElementProps({
        src: imageSrc,
        imageName: null,
        style: {
          opacity: 1
        }
      });
    }
  }


  render() {
    const { currentElement } = this.state;

    let srcValue = "";
    let fileName = "";

    if (currentElement) {
      const { src, imageName } = currentElement.props;

      // If not the default source or we don't have an imageName show src
      if (src !== defaultImageSource && !imageName) {
        srcValue = src;
      }

      if (imageName) {
        fileName = imageName;
      }
    }

    return (
      <div className={commonStyles.wrapper}>
        <h3 className={commonStyles.heading}>Image</h3>
        <hr className={commonStyles.hr} />
        <p className={commonStyles.subHeading}>
          Image source
        </p>
        <input
          className={`globalInput`}
          type="text"
          name="imagesSource"
          onChange={this.onSourceChange}
          value={srcValue}
        />
        <p className={commonStyles.subHeading}>File Upload</p>
        { fileName ?
          <p className={styles.uploadedFile}>
            <span
              className={styles.uploadedFileIcon}
              dangerouslySetInnerHTML={{ __html: IMAGE }}
            >
            </span>
            <span className={styles.uploadedFileName}>
              {fileName}
            </span>
          </p>
          : ""
        }
        <label className={`globalButton ${styles.fileUpload}`}>
          {fileName ?
            `Replace this file...` :
            `Choose a file...`
          }
          <input
            className={styles.visuallyHidden}
            type="file"
            name="imageFile"
            accept="image/x-png, image/gif, image/jpeg"
            onChange={this.onImageUpload}
          />
        </label>
      </div>
    );
  }
}
