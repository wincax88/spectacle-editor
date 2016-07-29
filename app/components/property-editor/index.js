import React, { Component } from "react";
import { observer } from "mobx-react";
import { autorun } from "mobx";

import styles from "./index.css";
import SlideMenu from "./contextual-menus/slides";
import TextMenu from "./contextual-menus/text";
import ImageMenu from "./contextual-menus/image";
import PlotlyMenu from "./contextual-menus/plotly";
import { ElementTypes, BLACKLIST_CURRENT_ELEMENT_DESELECT } from "../../constants";

@observer
class PropertyEditor extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      hasMenu: false,
      contextualMenu: null
    };
  }

  componentDidMount() {
    autorun(() => {
      if (this.context.store.currentElement) {
        this.setState({
          hasMenu: true,
          contextualMenu: this.context.store.currentElement.type
        });

        return;
      }

      this.setState({ hasMenu: false, contextualMenu: null });
    });
  }

  render() {
    const moveMenu = this.state.hasMenu ? styles.slidesInactive : "";
    const { contextualMenu } = this.state;

    return (
      <div className={`${styles.editor} ${BLACKLIST_CURRENT_ELEMENT_DESELECT}`}>
        <div className={`${styles.menu} ${moveMenu}`}>
          <SlideMenu />
        </div>
        <div className={`${styles.menu} ${styles.contextMenu}
           ${(ElementTypes.TEXT === contextualMenu) ?
          styles.contextMenuActive : ""}`}
        >
          <TextMenu />
        </div>
        <div className={`${styles.menu} ${styles.contextMenu}
           ${(ElementTypes.IMAGE === contextualMenu) ?
          styles.contextMenuActive : ""}`}
        >
          <ImageMenu />
        </div>
        <div className={`${styles.menu} ${styles.contextMenu}
           ${(ElementTypes.PLOTLY === contextualMenu) ?
          styles.contextMenuActive : ""}`}
        >
          <PlotlyMenu />
        </div>
      </div>
    );
  }
}

export default PropertyEditor;
