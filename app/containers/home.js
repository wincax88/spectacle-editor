import { ipcRenderer } from "electron";
import React, { Component, PropTypes } from "react";
import { autorun } from "mobx";
import { observer } from "mobx-react";

import SlidesStore from "../stores/slides-store";
import FileStore from "../stores/file-store";
import Provider from "../components/utils/provider";
import PropertyEditor from "../components/property-editor";
import Upload from "../components/upload";
import MenuBar from "../components/menu-bar";
import SlideList from "../components/slide-list";
import Canvas from "../components/canvas";
import LoginMenu from "../components/login-menu";
import defaultTheme from "../themes/default";
import { fileActions, editActions } from "../menu-actions";
import styles from "./home.css";
import { BLACKLIST_CURRENT_ELEMENT_DESELECT } from "../constants";

const fileStore = new FileStore();
const slideStore = new SlidesStore(fileStore);

ipcRenderer.on("file", (event, message) => {
  fileActions[message](slideStore, fileStore);
});

ipcRenderer.on("edit", (event, message) => {
  editActions[message](slideStore, fileStore);
});

@observer
class Home extends Component {
  // MOCKED FOR NOW
  // TODO: Remove when theming and styling is solved
  static childContextTypes = {
    styles: PropTypes.object
  };

  // MOCKED FOR NOW
  // TODO: Remove when theming and styling is solved
  getChildContext() {
    return {
      styles: defaultTheme()
    };
  }

  componentDidMount() {
    autorun(() => {
      if (fileStore.fileName) {
        // Don't show path info or `.json` extension
        document.title = fileStore.fileName.split("/").pop().slice(0, -5);
      }

      if (fileStore.isDirty) {
        document.title += "* - Edited";
      }
    });

    document.addEventListener("mousedown", (ev) => {
      const findClassRecursively = (el) => {
        const classes = el.classList ? Array.prototype.slice.call(el.classList) : [];
        const isClass = classes.indexOf(BLACKLIST_CURRENT_ELEMENT_DESELECT) > -1;

        if (isClass) {
          return true;
        }

        if (!el.parentNode) {
          return false;
        }

        return findClassRecursively(el.parentNode);
      };

      if (!findClassRecursively(ev.target)) {
        slideStore.setCurrentElementIndex(null);
      }
    });
  }

  render() {
    const wrapperStyles = {};

    if (slideStore.isDragging) {
      wrapperStyles.cursor = "-webkit-grabbing";
      wrapperStyles.pointerEvents = "none";
    }

    return (
      <Provider store={slideStore}>
        <div className={styles.home} style={wrapperStyles}>
          <MenuBar />
          <LoginMenu />
          <Upload />
          <div className={styles.container}>
            <SlideList />
            <PropertyEditor />
            <Canvas />
          </div>
        </div>
      </Provider>
    );
  }
}

export default Home;
