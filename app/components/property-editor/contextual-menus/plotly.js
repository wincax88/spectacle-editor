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

  onSourceChange = (ev) => {
    const plotlySrc = ev.target.value;

    if (plotlySrc) {
      this.context.store.updateElementProps({
        src: plotlySrc
      });
    }
  }

  onSourceBlur = (ev) => {
    const plotlySrc = ev.target.value;

    if (!plotlySrc) {
      return;
    }

    const normalizedUrl = normalizeUrl(plotlySrc);

    if (plotlySrc !== normalizedUrl) {
      this.context.store.updateElementProps({
        src: normalizedUrl
      });
    }
  }

  render() {
    const { currentElement } = this.state;

    let srcValue = "";

    if (currentElement) {
      const { src } = currentElement.props;

      // If not the default source or we don't have an imageName show src
      if (src !== defaultPlotlySrc) {
        srcValue = src;
      }
    }

    return (
      <div className={commonStyles.wrapper}>
        <h3 className={commonStyles.heading}>Plotly</h3>
        <hr className={commonStyles.hr} />
        <p className={commonStyles.subHeading}>
          Embed Url
        </p>
        <input
          className={`globalInput`}
          type="text"
          name="imagesSource"
          onChange={this.onSourceChange}
          onBlur={this.onSourceBlur}
          value={srcValue}
        />
      </div>
    );
  }
}
