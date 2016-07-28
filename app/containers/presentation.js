import { ipcRenderer } from "electron";
import React, { Component, PropTypes } from "react";
import { Viewer } from "spectacle-editor-viewer";

class Presentation extends Component {
  static propTypes = {
    screenCapture: PropTypes.bool
  };

  constructor(props) {
    super(props);

    ipcRenderer.on("update", (event, data) => {
      this.setState({
        currentSlideIndex: data.currentSlideIndex,
        presentation: {
          content: {
            slides: data.slides
          }
        }
      });
    });

    this.state = {
      presentation: null
    };
  }

  componentDidUpdate() {
    if (this.props.screenCapture) {
      setTimeout(() => {
        ipcRenderer.send("ready-to-screencap", {
          currentSlideIndex: this.state.currentSlideIndex,
          numberOfSlides: this.state.presentation.content.slides.length
        });
      }, 100);
    }
  }

  render() {
    return (
      <div>
        {this.props.screenCapture && <style>
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
        }
        {this.state.presentation && <Viewer presentation={this.state.presentation} />}
      </div>
    );
  }
}

export default Presentation;
