import React, { Component } from "react";
import { map } from "lodash";

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

    const nextChildren = map(this.editor.childNodes, (child) =>
      child.innerText.replace(/\n$/, "")
    );

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
    const superKey = process.platform === "darwin" ? ev.metaKey : ev.ctrlKey;
    // undo super+z, stop propagation so as not to trigger global undo
    if (superKey && ev.which === 90 && !ev.shiftKey) {
      ev.preventDefault();
      ev.stopPropagation();

      document.execCommand("undo");
    }

    // undo super+shift+z, stop propagation so as not to trigger global redo
    if (superKey && ev.which === 90 && ev.shiftKey) {
      ev.preventDefault();
      ev.stopPropagation();

      document.execCommand("redo");
    }

    // delete prevented so that content editable child element is not deleted
    if (ev.which === 8 && ev.target.innerText.length <= 1) {
      ev.preventDefault();
    }

    // shift+enter new line when not in list mode doesn't work properly, disabled
    if (ev.which === 13 && ev.shiftKey && !this.props.componentProps.listType) {
      ev.preventDefault();
    }

    // escape will finalze edit.
    if (ev.which === 27) {
      ev.preventDefault();
      this.handleBlur();
    }
  }

  renderEditor(contentToRender) {
    const {
      classNames,
      style,
      currentlySelected
    } = this.props;

    return (
      <div
        ref={(component) => {this.editor = component;}}
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
            {element.split("\n").map((line, k) => (
                <span
                  className={classNames.line}
                  key={k}
                >
                  {line === "" ? <br /> : line}
                </span>
              )
            )}
          </p>)
        )}
      </div>
    );
  }

  renderList(type, text) {
    const { currentlySelected, classNames, style } = this.props;
    let ListTag = "ol";

    if (type === "unordered") {
      ListTag = "ul";
    }

    return (
      <ListTag
        ref={(component) => {this.editor = component;}}
        className={`${classNames.content}`}
        onBlur={this.handleBlur}
        style={style}
        contentEditable={currentlySelected ? "true" : "false"}
        suppressContentEditableWarning
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        onInput={this.handleInput}
      >
        {text.map((li, i) => (
          <li
            className={
             `${classNames.line}`
            }
            style={style}
            key={`list-item-${i}`}
          >
           {li.split("\n").map((str, k) => <div key={k}>{str === "" ? <br /> : str}</div>)}
          </li>
        ))}
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
