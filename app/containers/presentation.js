import { ipcRenderer } from "electron";
import React, { Component } from "react";
import { Viewer } from "spectacle-editor-viewer";

class Presentation extends Component {
  constructor(props) {
    super(props);

    ipcRenderer.on("update", (event, data) => {
      this.setState({
        presentation: {
          content: {
            slides: data
          }
        }
      });
    });

    this.state = {
      presentation: null
    };
  }

  render() {
    return (
      <div>
        <style>
        {`
          body {
            transform: scale(0.25);
            height: 700px;
            width: 1000px;
            top: -262.5px;
            left: -375px;
          }
        `}
        </style>
        {this.state.presentation && <Viewer presentation={this.state.presentation} />}
      </div>
    );
  }
}

export default Presentation;
