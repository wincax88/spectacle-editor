import React, { Component } from "react";
import { autorun } from "mobx";

import { ElementTypes } from "../../../constants";
import elements from "../../../elements";
import commonStyles from "../index.css";

const defaultPlotlySrc = elements[ElementTypes.PLOTLY].props.src;

const normalizeUrl = (url) => {
  let urlWithEmbedAndQuery = url;

  if (urlWithEmbedAndQuery.indexOf(".embed") === -1) {
    const queryIndex = urlWithEmbedAndQuery.indexOf("?");

    if (queryIndex === -1) {
      urlWithEmbedAndQuery =
        /\/$/.test(urlWithEmbedAndQuery) ?
         `${urlWithEmbedAndQuery.slice(0, -1)}.embed`
         :
         `${urlWithEmbedAndQuery}.embed`;
    } else {
      urlWithEmbedAndQuery =
      `${urlWithEmbedAndQuery.slice(0, queryIndex)}.embed${urlWithEmbedAndQuery.slice(queryIndex)}`;
    }
  }

  if (urlWithEmbedAndQuery.indexOf("link=") === -1) {
    urlWithEmbedAndQuery = urlWithEmbedAndQuery.indexOf(".embed?") > -1 ?
    `${urlWithEmbedAndQuery}&link=false`
    :
    `${urlWithEmbedAndQuery}?link=false`;
  }

  if (urlWithEmbedAndQuery.indexOf("http://") === 0 || urlWithEmbedAndQuery.indexOf("https://") === 0) {
    return urlWithEmbedAndQuery;
  }

  return `https://${urlWithEmbedAndQuery}`;
};

export default class PlotlyMenu extends Component {
  static contextTypes = {
    store: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      currentElement: null,
      src: null
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

      if (currentElement.type === ElementTypes.PLOTLY) {
        this.setState({ currentElement });
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.handleClick);
  }

  onInputKeyPress = (ev) => {
    if (ev.which === 13) {
      this.inputElement.blur();
    }
  }

  onSourceFocus = (ev) => {
    window.addEventListener("click", this.handleClick);
    ev.target.setSelectionRange(0, ev.target.value.length);

    const { currentSlideIndex, currentElementIndex } = this.context.store;
    this.currentSlideIndex = currentSlideIndex;
    this.currentElementIndex = currentElementIndex;
  }

  onSourceChange = ({ target: { value } }) => {
    this.setState({ src: value });
  }

  onSourceBlur = ({ target: { value } }) => {
    if (!value) {
      return;
    }

    this.context.store.updateElementProps(
      { src: normalizeUrl(value) },
      this.currentSlideIndex,
      this.currentElementIndex
    );

    this.setState({ src: null });
  }

  handleClick = (ev) => {
    if (ev.target !== this.inputElement) {
      this.inputElement.blur();
      window.removeEventListener("click", this.handleClick);
    }
  }

  render() {
    const { currentElement, src } = this.state;
    let inputValue = "";

    if (currentElement && defaultPlotlySrc !== currentElement.props.src) {
      inputValue = currentElement.props.src;
    }

    if (src) {
      inputValue = src;
    }

    return (
      <div className={commonStyles.wrapper}>
        {currentElement && (
          <div>
            <h3 className={commonStyles.heading}>Plotly</h3>
            <hr className={commonStyles.hr} />
            <p className={commonStyles.subHeading}>
              Embed Url
            </p>
            <input
              ref={(component) => {this.inputElement = component;}}
              onKeyPress={this.onInputKeyPress}
              className={`globalInput`}
              type="text"
              name="imagesSource"
              onFocus={this.onSourceFocus}
              onChange={this.onSourceChange}
              onBlur={this.onSourceBlur}
              value={inputValue}
            />
          </div>
        )}
      </div>
    );
  }
}
