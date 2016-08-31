import React, { Component } from "react";
import { autorun } from "mobx";

import { ElementTypes } from "../../../constants";
import commonStyles from "../index.css";

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

      if (currentElement.type === ElementTypes.PLOTLY) {
        this.setState({ currentElement });
      }
    });
  }

  onInputKeyPress = (ev) => {
    if (ev.which === 13) {
      this.inputElement.blur();
    }
  };

  onSourceBlur = ({ target: { value } }) => {
    if (!value) {
      return;
    }

    this.context.store.updateElementProps({
      src: normalizeUrl(value)
    });
  }

  render() {
    const { currentElement } = this.state;

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
              onInput={this.onSourceInput}
              onBlur={this.onSourceBlur}
            />
          </div>
        )}
      </div>
    );
  }
}
