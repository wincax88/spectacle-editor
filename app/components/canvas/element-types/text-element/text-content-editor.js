import React, { Component } from "react";

export default class TextContentEditor extends Component {
  static propTypes = {
    isEditing: React.PropTypes.bool,
    currentlySelected: React.PropTypes.bool,
    placeholderText: React.PropTypes.array,
    classNames: React.PropTypes.object,
    componentProps: React.PropTypes.object,
    style: React.PropTypes.object,
    children: React.PropTypes.array,
    stopEditing: React.PropTypes.func
  }

  static contextTypes = {
    store: React.PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = { content: null };
  }

  componentWillMount() {
    const { children, placeholderText } = this.props;

    this.setState({
      contentToRender: children && children || placeholderText
    });
  }

  componentWillReceiveProps(nextProps) {
    const { children, placeholderText } = nextProps;

    this.setState({
      contentToRender: children && children || placeholderText
    });
  }

  handleInput = (ev) => {
    this.setState({ content: ev.target.textContent });
  }

  handleBlur = () => {
    this.editor.style.cursor = "move";
    this.props.stopEditing();
    this.isHighLighted = false;

    const { content } = this.state;
    const { placeholderText, children } = this.props;

    if (content === null || content.length === 0) {
      this.editor.childNodes[0].innerText = children && children[0] || placeholderText;
      return;
    }

    const nextChildren = Array.prototype.map.call(this.editor.childNodes, (child) => (
      child.innerText || ""
    ));

    this.context.store.updateChildren(
      nextChildren,
      this.currentSlide,
      this.currentElement
    );
  }

  handleClick = (ev) => {
    const { isEditing, placeholderText, currentlySelected } = this.props;
    const { content, contentToRender } = this.state;
    const sel = window.getSelection();
    const range = document.createRange();

    if (!isEditing) {
      ev.preventDefault();

      return;
    }

    if (!currentlySelected) {
      this.props.stopEditing();

      return;
    }

    if (content === null && contentToRender[0] === placeholderText[0]) {
      this.editor.childNodes[0].innerText = "";
    }

    if (!this.props.children) {
      ev.preventDefault();

      range.selectNodeContents(this.editor.childNodes[0]);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (!this.isHighLighted) {
      this.isHighLighted = true;
      const length = this.editor.childNodes.length;

      range.setStartBefore(this.editor.childNodes[0]);
      range.setEndAfter(this.editor.childNodes[length - 1]);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    this.editor.style.cursor = "text";
    this.currentSlide = this.context.store.currentSlideIndex;
    this.currentElement = this.context.store.currentElementIndex;
  }

  handleKeyDown = (ev) => {
    if (ev.which === 8 && ev.target.innerText.length <= 1) {
      ev.preventDefault();
    }

    if (ev.which === 13 && ev.shiftKey && !this.props.componentProps.listType) {
      ev.preventDefault();
    }
  }

  renderEditor(contentToRender) {
    const {
      classNames,
      componentProps,
      style,
      currentlySelected
    } = this.props;

    return (
      <div
        ref={(component) => {this.editor = component;}}
        {...componentProps}
        className={classNames.content}
        onBlur={this.handleBlur}
        style={{ ...style, whiteSpace: "pre-wrap" }}
        contentEditable={currentlySelected ? "true" : "false"}
        suppressContentEditableWarning
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        onInput={this.handleInput}
      >
        {contentToRender.map((element, i) =>
          (<p
            className={
              `${classNames.content}
               ${classNames.line}
               ${classNames.paragraph}`
            }
            style={style}
            key={i}
          >
            {element.replace(/\n$/, "").split("\n").map((line, k) => (
                <span
                  className={classNames.line}
                  key={k}
                >
                  {line}
                </span>
              )
            )}
          </p>)
        )}
      </div>
    );
  }

  renderList(type, text) {
    const { currentlySelected, componentProps, classNames, style } = this.props;
    let ListTag = "ol";

    if (type === "unordered") {
      ListTag = "ul";
    }

    return (
      <ListTag
        ref={(component) => {this.editor = component;}}
        {...componentProps}
        className={`${classNames.content}`}
        onBlur={this.handleBlur}
        style={style}
        contentEditable={currentlySelected ? "true" : "false"}
        suppressContentEditableWarning
        onClick={this.handleClick}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        onInput={this.handleInput}
      >
        {text.map((element, i) => (
          <li
            className={
             `${classNames.line}`
            }
            style={style}
            key={i}
          >
           {element.replace(/\n$/, "").split("\n").map((line, k) => <div key={k}>{line}</div>)}
          </li>)
        )}
      </ListTag>
    );
  }

  render() {
    const {
      componentProps
    } = this.props;

    return componentProps.listType ?
      this.renderList(componentProps.listType, this.state.contentToRender)
      :
      this.renderEditor(this.state.contentToRender);
  }
}
