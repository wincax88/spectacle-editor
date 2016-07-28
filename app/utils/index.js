import { sortBy, sortedUniq, invert } from "lodash";

import { ElementTypes, SNAP_DISTANCE } from "../constants";

export const getParagraphStyles = (obj) => (
  {
    color: "#3d3d3d",
    fontFamily: "openSans",
    fontSize: 45,
    fontStyle: "normal",
    fontWeight: 400,
    minWidth: 20,
    opacity: 1,
    textAlign: "center",
    textDecoration: "none",
    ...obj
  }
);

export const getElementDimensions = ({ type, props }) => {
  if (type === ElementTypes.TEXT) {
    return {
      width: props.style.width,
      height: props.style.height
    };
  }

  return {
    width: props.width,
    height: props.height
  };
};

export const getElementLocation = ({ props }) => ({
  top: props.style.top,
  left: props.style.left
});

// Gridlines include slide edges and center before element lines (left, middle, right)
export const generateGridLinesArray = (gridLinesArray, excludeElementIndex, max) => {
  // If our exclude index is null, we don't have a current element selected so all grid lines are
  // available for snapping
  if (excludeElementIndex !== null) {
    const gridIndex = 3 + (excludeElementIndex * 3);

    // Get all gridLines except for the ones at the element index (left, middle, right)
    gridLinesArray.splice(gridIndex, 3);
  }

  // Return a sorted array of uniq gridLines
  // Filter out any values higher than the max
  return sortedUniq(sortBy(gridLinesArray)).filter((num) => num <= max && num >= 0);
};

// Called with an array of sorted uniq integers
export const generateClosestHash = (arr) => (
  arr.reduce((hash, num, index, originalArray) => {
    const next = originalArray[index + 1];

    // If we're at the last element in the array, set it and return.
    if (!next) {
      hash[num] = num; // eslint-disable-line no-param-reassign

      return hash;
    }

    const halfWayPoint = num + Math.floor((originalArray[index + 1] - num) / 2);

    for (let i = num; i < halfWayPoint; i++) {
      hash[i] = num; // eslint-disable-line no-param-reassign
    }

    for (let j = halfWayPoint; j < next; j++) {
      hash[j] = next; // eslint-disable-line no-param-reassign
    }

    return hash;
  }, {})
);

export const getGridLinesObj = (elements, horizontalInitial, verticalInitial) => (
  elements.reduce((gridObj, element) => {
    const { width, height } = getElementDimensions(element);
    const { top, left } = getElementLocation(element);

    // TODO: don't use grid lines of elements off the canvas e.g.
    // TODO: Set all grid lines of elements off the slide to 0

    // horizontal top edge, center line, bottom edge
    gridObj.horizontal.push(Math.floor(top));
    gridObj.horizontal.push(Math.floor(top + (height / 2)));
    gridObj.horizontal.push(Math.floor(top + height));

    // vertical left edge, center line, right edge
    gridObj.vertical.push(Math.floor(left));
    gridObj.vertical.push(Math.floor(left + (width / 2)));
    gridObj.vertical.push(Math.floor(left + width));

    return gridObj;
  }, {
    // Start with slide edges and slide center lines
    horizontal: horizontalInitial,
    vertical: verticalInitial
  })
);

export const getGridLineHashes = (gridLinesObj, excludeElementIndex) => ({
  horizontal: generateClosestHash(
    generateGridLinesArray(
      gridLinesObj.horizontal,
      excludeElementIndex,
      // Pass in the max, in this case the bottom edge of the slide.
      gridLinesObj.horizontal[2]
    )
  ),
  vertical: generateClosestHash(
    generateGridLinesArray(
      gridLinesObj.vertical,
      excludeElementIndex,
      // Pass in the max, in this case the right edge of the slide.
      gridLinesObj.vertical[2]
    )
  )
});

// NOTE: Because this depends on a hash with integer keys, all potentialLines must be integers
export const getNearestGridLine = (gridLinesHash, ...potentialLines) => {
  let line = gridLinesHash[Math.floor(potentialLines[0])];
  let distance = Math.abs(line - Math.floor(potentialLines[0]));
  let index = 0;

  for (let i = 1; i < potentialLines.length; i++) {
    const currentLine = gridLinesHash[Math.floor(potentialLines[i])];
    const currentDistance = Math.abs(currentLine - Math.floor(potentialLines[i]));

    if (currentDistance < distance) {
      line = currentLine;
      distance = currentDistance;
      index = i;
    }
  }

  return {
    line,
    distance,
    index
  };
};

export const getPointsToSnap = (offset, length, mouseOffset) => {
  const effectiveStart = offset + mouseOffset;
  const effectiveMiddle = effectiveStart + Math.floor(length / 2);
  const effectiveEnd = effectiveStart + length;

  return [effectiveStart, effectiveMiddle, effectiveEnd];
};

export const snap = (gridLines, potentialLines, snapFunction) => {
  const {
    line, distance, index
  } = getNearestGridLine(
    gridLines,
    ...potentialLines
  );

  if (distance < SNAP_DISTANCE) {
    snapFunction(line, index);

    return;
  }

  snapFunction(null);
};

export const verifyFileContent = (fileContent, cb) => {
  if (!fileContent ||
    !fileContent.content ||
    !fileContent.content.presentation ||
    !fileContent.content.presentation.slides) {
    return cb(new Error("Empty file"));
  }

  if (!Array.isArray(fileContent.content.presentation.slides)) {
    return cb(new Error("content.slides must be an array"));
  }

  const slideError = fileContent.content.presentation.slides.some((slide) => {
    if (!slide.id || !slide.children || !slide.props) {
      cb(new Error("Invalid Slide"));

      return true;
    }

    if (!Array.isArray(slide.children)) {
      cb(new Error("Slide children must be an array"));

      return true;
    }

    return slide.children.some((child) => {
      if (!child.type || !invert(ElementTypes)[child.type]) {
        cb(new Error("Slide child must have a valid type"));

        return true;
      }

      if (!child.id || !child.props) {
        cb(new Error("Invalid slide child"));

        return true;
      }

      return false;
    });
  });

  if (!slideError) {
    return cb();
  }
};
