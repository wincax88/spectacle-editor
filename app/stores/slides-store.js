import { ipcRenderer } from "electron";
import { observable, computed, transaction, asReference } from "mobx";
import Immutable from "seamless-immutable";
import { generate } from "shortid";
import { merge } from "lodash";

import ApiStore from "./api-store";
import elementMap from "../elements";
import { getGridLinesObj, getGridLineHashes } from "../utils";

// TODO: REMOVE. Useful for testing
const allColors = [
  "#EF767A", "#456990", "#49BEAA", "#49DCB1", "#EEB868", "#EF767A", "#456990",
  "#49BEAA", "#49DCB1", "#EEB868", "#EF767A"
];

export default class SlidesStore {
  // Default slides state
  // history will be an array of slides arrays
  @observable history = asReference(Immutable.from([{
    currentSlideIndex: 0,
    currentElementIndex: null,
    slides: [{
      // Default first slide
      id: generate(),
      props: {
        style: {
          backgroundColor: "#f3c"
        }
      },
      children: [],
      color: allColors[0]
    }, {
      id: generate(),
      props: {},
      children: [],
      color: allColors[1]
    }, {
      id: generate(),
      props: {},
      children: [],
      color: allColors[2]
    }, {
      id: generate(),
      props: {},
      children: [],
      color: allColors[3]
    }, {
      id: generate(),
      props: {},
      children: [],
      color: allColors[4]
    }
  ] }]));

  @observable historyIndex = 0;

  // Slide info
  @observable width = 0;
  @observable height = 0;
  @observable left = 0;
  @observable top = 0;
  @observable scale = 1;

  // Needed for handling cursor state and pointer events
  @observable isDragging = false;
  @observable cursorType = null;
  @observable isResizing = false;
  @observable isDraggingSlide = false;
  @observable isDraggingElement = false;
  @observable isDraggingNewElement = false;

  // TODO: move user to own store
  @observable user = null;

  // Returns a new mutable object. Functions as a cloneDeep.
  @computed get slides() {
    return this.history[this.historyIndex].slides.asMutable({ deep: true });
  }

  @computed get currentSlideIndex() {
    return this.history[this.historyIndex].currentSlideIndex;
  }

  @computed get currentElementIndex() {
    return this.history[this.historyIndex].currentElementIndex;
  }

  // Returns a new mutable object. Functions as a cloneDeep.
  @computed get currentSlide() {
    return this.slides[this.currentSlideIndex];
  }

  // Returns a new mutable object. Functions as a cloneDeep.
  @computed get currentElement() {
    return (this.currentElementIndex === 0 || this.currentElementIndex) ?
      this.currentSlide.children[this.currentElementIndex] :
      null;
  }

  @computed get undoDisabled() {
    return this.historyIndex === 0 || this.history.length <= 1;
  }

  @computed get redoDisabled() {
    return this.historyIndex >= this.history.length - 1;
  }

  @computed get currentState() {
    return this.history[this.historyIndex].asMutable({ deep: true });
  }

  @computed get gridLines() {
    return getGridLineHashes(
      getGridLinesObj(
        // Pass in elements to snap to
        this.currentSlide.children,
        // Start with slide edges and slide center lines
        [0, Math.floor(this.height / 2), this.height],
        [0, Math.floor(this.width / 2), this.width]
      ),
      // Ignore lines for the current element index
      // Or if we're dragging a new element, don't ignore any current elements
      this.isDraggingNewElement ? 100000 : this.currentElementIndex
    );
  }

  constructor(fileStore, slides) {
    this.fileStore = fileStore;
    this.api = new ApiStore();

    if (slides) {
      this.history = Immutable.from([{
        currentSlideIndex: 0,
        currentElementIndex: null,
        slides
      }]);
    }

    ipcRenderer.on("trigger-update", () => {
      ipcRenderer.send("update-presentation", {
        slides: this.slides,
        currentSlideIndex: this.currentSlideIndex
      });
    });
  }

  // TODO: Move user to own store
  setUser(userInfo) {
    this.user = userInfo;
  }

  setCanvasSize({ width, height, left, top, scale }) {
    transaction(() => {
      this.width = width;
      this.height = height;
      this.left = left;
      this.top = top;
      this.scale = scale;
    });
  }

  dropElement(elementType, extraProps) {
    const slideToAddTo = this.currentSlide;
    const newSlidesArray = this.slides;
    const element = elementMap[elementType];
    const mergedProps = merge(element.props, extraProps);

    slideToAddTo.children.push({
      ...element,
      props: mergedProps,
      id: generate()
    });

    newSlidesArray[this.currentSlideIndex] = slideToAddTo;

    this._addToHistory({
      currentSlideIndex: this.currentSlideIndex,
      currentElementIndex: slideToAddTo.children.length - 1,
      slides: newSlidesArray
    });
  }

  setCurrentElementIndex(newIndex) {
    const snapshot = this.currentState;
    snapshot.currentElementIndex = newIndex;

    transaction(() => {
      const left = this.history.slice(0, this.historyIndex);
      const right = this.history.slice(this.historyIndex + 1, this.history.length);
      this.history = left.concat([snapshot], right);
    });
  }

  setSelectedSlideIndex(newSlideIndex) {
    const snapshot = this.currentState;
    snapshot.currentElementIndex = null;
    snapshot.currentSlideIndex = newSlideIndex;

    transaction(() => {
      const left = this.history.slice(0, this.historyIndex);
      const right = this.history.slice(this.historyIndex + 1, this.history.length);
      this.history = left.concat([snapshot], right);
    });
  }

  moveSlide(currentIndex, newIndex) {
    const slidesArray = this.slides;

    slidesArray.splice(newIndex, 0, slidesArray.splice(currentIndex, 1)[0]);

    this._addToHistory({
      currentSlideIndex: newIndex,
      slides: slidesArray
    });
  }

  addSlide() {
    const slidesArray = this.slides;

    // TODO: Figure out new slide defaults/interface
    const newSlide = {
      id: generate(),
      props: {},
      children: [],
      color: allColors[6]
    };

    const index = this.currentSlideIndex + 1;
    slidesArray.splice(index, 0, newSlide);

    this._addToHistory({
      currentSlideIndex: index,
      currentElementIndex: null,
      slides: slidesArray
    });
  }

  deleteSlide() {
    const slidesArray = this.slides;
    const index = this.currentSlideIndex === 0 ? 0 : this.currentSlideIndex - 1;

    slidesArray.splice(this.currentSlideIndex, 1);

    this._addToHistory({
      currentSlideIndex: index,
      currentElementIndex: null,
      slides: slidesArray
    });
  }

  updateElementDraggingState(isDraggingElement, isDraggingNewElement = false) {
    transaction(() => {
      this.isDragging = isDraggingElement;
      this.isDraggingElement = isDraggingElement;
      this.isDraggingNewElement = isDraggingNewElement;
    });
  }

  updateElementResizeState(isResizingElement, cursor = null) {
    transaction(() => {
      this.cursorType = cursor;
      this.isResizing = isResizingElement;
    });
  }

  updateSlideDraggingState(isDraggingSlide) {
    transaction(() => {
      this.isDragging = isDraggingSlide;
      this.isDraggingSlide = isDraggingSlide;
    });
  }

  updateElementProps(props) {
    if (!this.currentElement) {
      return;
    }

    const newProps = merge(this.currentElement.props, props);
    const newState = this.currentState;
    newState.slides[this.currentSlideIndex].children[this.currentElementIndex].props = newProps;
    this._addToHistory(newState);
  }

  updateChildren(nextChild, slideIndex, elementIndex) {
    const newState = this.currentState;

    newState.slides[slideIndex].children[elementIndex].children = nextChild;
    this._addToHistory(newState);
  }

  undo() {
    // double check we're not trying to undo without history
    if (this.historyIndex === 0) {
      return;
    }

    this.historyIndex -= 1;

    if (this.historyIndex === 0 && this.fileStore.isDirty) {
      this.fileStore.setIsDirty(false);
    }
  }

  redo() {
    // Double check we've got a future to redo to
    if (this.historyIndex >= this.history.length - 1) {
      return;
    }

    this.historyIndex += 1;

    if (!this.fileStore.isDirty) {
      this.fileStore.setIsDirty(true);
    }
  }

  _addToHistory(snapshot) {
    // Only notify observers once all expressions have completed
    transaction(() => {
      // If we have a future and we do an action, remove the future.
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      // Wrap the new slides array in an array so they aren't concatted as individual slide objects
      this.history = this.history.concat([Immutable.from(snapshot)]);
      this.historyIndex += 1;

      // Cap history to 40 entries
      if (this.history.length > 40) {
        this.history = this.history.slice(1, this.history.length);
        this.historyIndex -= 1;
      }

      if (!this.fileStore.isDirty) {
        this.fileStore.setIsDirty(true);
      }
    });

    ipcRenderer.send("update-presentation", {
      slides: this.slides,
      currentSlideIndex: this.currentSlideIndex
    });
  }

  serialize() {
    return this.slides;
  }

  deserialize(newSlides) {
    const hydratedSlides = newSlides.map((slide) => ({
      ...slide,
      children: slide.children.map((childObj) => ({
        ...childObj,
        ComponentClass: elementMap[childObj.type].ComponentClass
      }))
    }));

    transaction(() => {
      this.historyIndex = 0;
      this.history = Immutable.from([{
        currentSlideIndex: 0,
        currentElementIndex: null,
        slides: hydratedSlides
      }]);
    });
  }
}
