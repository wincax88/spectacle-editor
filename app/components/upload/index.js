import React, { Component } from "react";
import { observer } from "mobx-react";
import moment from "moment";

import { create, patch } from "../../api/presentation";

import styles from "./index.css";

@observer
class UploadButton extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      uploadFlyoutVisible: false,
      privacy: "public",
      fileName: ""
    };
  }

  onClickUpload = () => {
    this.setState({
      uploadFlyoutVisible: true
    });
  }

  onPublish = (ev) => {
    ev.preventDefault();

    const { fileName, privacy } = this.state;

    if (!fileName) {
      this.setState({
        publishError: "Oops! Please fill out a name for your presentation."
      });

      return;
    }

    const presJSON = this.context.store.serialize();
    const { domainUrl, csrfToken } = this.context.store.api;

    const isPublic = privacy !== "private";

    create(domainUrl, csrfToken, presJSON, isPublic, fileName)
      .then((responseJSON) => {
        // TODO: better error handling, for instance if a session expired.
        if (responseJSON.errors) {
          this.setState({
            publishError: responseJSON.errors.pop().message
          });

          return;
        }

        this.context.store.api.setPresentation(responseJSON);
        this.setState({ uploadFlyoutVisible: false });
      })
      .catch(() => {
        this.setState({
          publishError: "Oh no! Something went wrong with publishing. Please try again in a moment."
        });
      });
  }

  onCancel = (ev) => {
    ev.preventDefault();

    this.setState({ uploadFlyoutVisible: false });
  }

  onChangeFileName = (ev) => {
    this.setState({
      fileName: ev.target.value
    });
  }

  onChangePrivacy = (ev) => {
    this.setState({
      privacy: ev.target.value
    });
  }

  onClickShare = () => {
    this.setState({
      shareFlyoutVisible: true
    });
  }

  onClickSync = () => {
    const presJSON = this.context.store.serialize();
    const { domainUrl, fid, csrfToken } = this.context.store.api;

    patch(domainUrl, fid, csrfToken, presJSON)
      .then((responseJSON) => {
        // TODO: better error handling, for instance if a session expired.
        if (responseJSON.errors) {
          this.setState({
            syncError: true
          });

          return;
        }

        this.context.store.api.setPresentation(responseJSON);
        this.setState({ syncError: false });
      })
      .catch(() => {
        this.setState({
          syncError: true
        });
      });
  }

  renderError(err) {
    if (!err) {
      return;
    }

    return (
      <div className={styles.errorMessage}>
        <span className={`${styles.errorMessageIcon} octicon octicon-alert`}></span>
        <span>
          {err}
        </span>
      </div>
    );
  }

  renderButtons(fid, info, user) {
    if (!fid || !info.dateModified) {
      return (
        <button className={styles.uploadBtn} onClick={this.onClickUpload} disabled={!user} >
          <i className={`ionicons ion-ios-cloud-upload-outline ${styles.uploadIcon}`}></i>
          Upload
        </button>
      );
    }
    return (
      <div>
        <div>
          <button className={styles.uploadBtn} onClick={this.onClickShare} disabled={!user} >
            <i className={`ionicons ion-ios-cloud-upload-outline ${styles.uploadIcon}`}></i>
            Share
            {info.worldReadable ?
              info.webUrl :
              `${info.webUrl}?share_key=${info.shareKey}`
            }
          </button>
        </div>
        <div>
          <button className={styles.uploadBtn} onClick={this.onClickSync} disabled={!user} >
            <i className={`ionicons ion-ios-cloud-upload-outline ${styles.uploadIcon}`}></i>
            Sync
          </button>
          Last synced {moment(info.dateModified).calendar()}
        </div>
      </div>
    );
  }

  render() {
    const { user, presInfo, fid } = this.context.store.api;
    const { fileName: filePath } = this.context.store.fileStore;
    const { uploadFlyoutVisible, privacy, fileName, publishError } = this.state;

    const defaultFileName = filePath && filePath.split("\\").pop().split("/").pop().slice(0, -5);

    return (
      <div className={styles.upload}>
        {this.renderButtons(fid, presInfo, user)}
        {!fid && user &&
          <div className={`${styles.flyout} ${uploadFlyoutVisible && styles.visible}`}>
            <p className={styles.flyoutHeading}>Upload presentation to plot.ly</p>
            {this.renderError(publishError)}
            <form>
              <label className={styles.flyoutLabel}>
                Name
                <input
                  type="text"
                  className={styles.flyoutInput}
                  value={fileName || defaultFileName}
                  onChange={this.onChangeFileName}
                />
              </label>
              <p className={styles.flyoutRadioHeading}>Privacy Settings</p>
              <label className={styles.flyoutRadio}>
                <input
                  type="radio"
                  name="uploadPrivacySettings"
                  value="public"
                  checked={privacy === "public"}
                  onChange={this.onChangePrivacy}
                />
                Public
              </label>
              <label className={styles.flyoutRadio}>
                <input
                  type="radio"
                  name="uploadPrivacySettings"
                  value="private"
                  checked={privacy === "private"}
                  onChange={this.onChangePrivacy}
                />
                 Private
              </label>
              <button type="button" className={styles.flyoutBtnPublish} onClick={this.onPublish}>
                Publish
              </button>
              <button type="button" className={styles.flyoutClose} onClick={this.onCancel}>
                Cancel
              </button>
            </form>
          </div>
        }
      </div>
    );
  }
}

export default UploadButton;
