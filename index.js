/**
 * Define and initialize all elements required
 */
const svgNS = "http://www.w3.org/2000/svg";
let svg = document.getElementById("drawing-area");

// restore work from Local Storage
const autoSavedSVG = window.localStorage.getItem("drawing");
const autoSavedDoc = new DOMParser().parseFromString(
  autoSavedSVG,
  "image/svg+xml"
); // this returns a document type
svg.innerHTML = autoSavedDoc.documentElement.innerHTML;

const rectBtn = document.getElementById("btn-rect");
const lineBtn = document.getElementById("btn-line");
const ellipseBtn = document.getElementById("btn-ellipse");
const clearBtn = document.getElementById("btn-clear");
const downloadBtnAsSVG = document.getElementById("btn-download-svg");
const downloadBtnAsPNG = document.getElementById("btn-download-png");
const colorPicker = document.getElementById("color-names");

// this will store our selected svg element shape and the one hovered for deleting
let selectedElement = null;
let hoveredElement = null;
let selectedColor = "black";

// -----------------------------------------------------------------------

// event listener for downloading image as SVG
downloadBtnAsSVG.addEventListener("click", (event) => {
  event.preventDefault();
  downloadAsSVG();
});

// event listener for downloading image as PNG
downloadBtnAsPNG.addEventListener("click", (event) => {
  event.preventDefault();
  downloadAsPNG();
});

document.addEventListener("mouseover", (e) => {
  hoveredElement = e.target;
});

// add listeners for deleting the rectangle
document.addEventListener("keypress", deleteShape);

/**
 * Function that performs SVG downloading
 */
function downloadAsSVG() {
  let serializer = new XMLSerializer();
  let sourceData = serializer.serializeToString(svg);
  let svgBlob = new Blob([sourceData], {
    type: "image/svg+xml;charset=utf-8",
  });
  let svgURL = URL.createObjectURL(svgBlob);
  let downloadLink = document.createElement("a");
  downloadLink.href = svgURL;
  downloadLink.download = "svg";
  document.body.append(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

/**
 * Function that performs SVG downloading as PNG
 */
function downloadAsPNG() {
  let serializer = new XMLSerializer();
  let sourceData = serializer.serializeToString(svg);
  let svgBlob = new Blob([sourceData], {
    type: "image/svg+xml;charset=utf-8",
  });

  let svgURL = URL.createObjectURL(svgBlob);
  let canvas = document.createElement("canvas");
  let canvasWidth = 900;
  let canvasHeight = 600;

  let context = canvas.getContext("2d");

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  let image = new Image();
  // handler for the onload event on the image that will save
  image.onload = () => {
    context.drawImage(image, 0, 0);
    let imgURL = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = imgURL;
    downloadLink.download = "png";

    document.body.append(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  image.src = svgURL;
}

// event listener for color picker
colorPicker.addEventListener("change", (event) => {
  selectedColor = event.target.value;
});

/**
 *
 * @param {KeyboardEvent} event
 */
function deleteShape(event) {
  if (event.key === "d") {
    if (hoveredElement.id.includes("shape")) {
      hoveredElement.remove();
    }
  }
}

const testSVGShape = () => {
  const svgShape = document.createElementNS(svgNS, "svg")
  svgShape.setAttribute("width","200");
  svgShape.setAttribute("height","200");

  const rectangle = document.createElementNS(svgNS, "rect");
  const rectangleHandler = document.createElementNS(svgNS, "rect");

  const id = "shape" + Math.random();

  rectangle.classList.add("movable");
  rectangle.setAttribute("id", id);
  rectangle.setAttribute("x", "0");
  rectangle.setAttribute("y", "0");
  rectangle.setAttribute("height", "200");
  rectangle.setAttribute("width", "200");


  rectangleHandler.setAttribute("x","0");
  rectangleHandler.setAttribute("y", "0");
  rectangleHandler.setAttribute("height", "10");
  rectangleHandler.setAttribute("width", "10");
  rectangleHandler.setAttribute("fill", "red");

  svgShape.append(rectangle);
  svgShape.append(rectangleHandler);

  let isResizing = false;
  let initialMousePosition;

  rectangleHandler.addEventListener("mousedown", event => {
    isResizing = true;
    initialMousePosition = { x: event.clientX, y: event.clientY };
  });

  rectangleHandler.addEventListener("mousemove", event => {
    if (!isResizing) {
      return;
    }

    const currentMousePosition = { x: event.clientX, y: event.clientY };
    const dx = currentMousePosition.x - initialMousePosition.x;
    const dy = currentMousePosition.y - initialMousePosition.y;
    const currentWidth = parseInt(svgShape.getAttribute("width"));
    const currentHeight = parseInt(svgShape.getAttribute("height"));
    svgShape.setAttribute("width", currentWidth + dx);
    svgShape.setAttribute("height", currentHeight + dy);
    rectangle.setAttribute("width", currentWidth + dx);
    rectangle.setAttribute("height", currentHeight + dy);
    rectangleHandler.setAttribute("x", currentWidth + dx - 10);
    rectangleHandler.setAttribute("y", currentHeight + dy - 10);
    initialMousePosition = currentMousePosition;
  });


  rectangleHandler.addEventListener("mouseup", event => {
    isResizing = false;
  });



  svg.append(svgShape);
}

/**
 * Function that handles drawing rectangles
 */
const drawRectangle = () => {
  const rectangle = document.createElementNS(svgNS, "rect");
  const id = "shape" + Math.random();

  rectangle.classList.add("movable");
  rectangle.setAttribute("id", id);
  rectangle.setAttribute("x", "0");
  rectangle.setAttribute("y", "0");
  rectangle.setAttribute("height", "200");
  rectangle.setAttribute("width", "200");

  // add current picked color
  rectangle.setAttribute("fill", selectedColor);

  function getMousePosition(event) {
    let CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  // add listeners for moving and resizing the rectangle
  svg.addEventListener("mousedown", startAction);
  svg.addEventListener("mousemove", performAction);
  svg.addEventListener("mouseup", endAction);
  svg.addEventListener("mouseleave", endAction);

  // variables to store the initial size and position of the rectangle
  let initialWidth, initialHeight, initialX, initialY;

  // flag to track whether the mouse is being used for dragging or resizing
  let isDragging = false;
  let isResizing = false;

  function performAction(event) {
    if (isDragging) {
      // perform dragging if the flag is set
      event.preventDefault();
      let coordinates = getMousePosition(event);
      selectedElement.setAttributeNS(null, "x", coordinates.x);
      selectedElement.setAttributeNS(null, "y", coordinates.y);
    } else if (isResizing) {
      // perform resizing if the flag is set
      event.preventDefault();
      let coordinates = getMousePosition(event);

      // calculate the new size of the rectangle based on the mouse movement
      let newWidth = initialWidth + coordinates.x - initialX;
      let newHeight = initialHeight + coordinates.y - initialY;

      // update the width and height attributes of the rectangle
      selectedElement.setAttribute("width", newWidth );
      selectedElement.setAttribute("height", newHeight);
    }
  }

  function startAction(event) {
    if (event.target.classList.contains("movable")) {
      // check if the mouse is clicked on the corners of the rectangle to initiate resizing
      let rect = event.target.getBoundingClientRect();
      let x = event.clientX;
      let y = event.clientY;
      let topLeft =
        x >= rect.left &&
        x <= rect.left + 10 &&
        y >= rect.top &&
        y <= rect.top + 10;

      if (topLeft) {
        // start resizing if the mouse is clicked in the top left corner of the rectangle
        isResizing = true;
        selectedElement = event.target;
        // store the initial size and position of the rectangle
        initialWidth = parseInt(rectangle.getAttribute("width"));
        initialHeight = parseInt(rectangle.getAttribute("height"));
        initialX = parseInt(rectangle.getAttribute("x"));
        initialY = parseInt(rectangle.getAttribute("y"));
      } else {
        // start dragging if the mouse is clicked on the body of the rectangle
        isDragging = true;
        selectedElement = event.target;
      }
    }
  }

  function endAction() {
    // reset the flags and the selected element when the mouse is released
    isDragging = false;
    isResizing = false;
    selectedElement = null;
  }

  //---------------

  svg.appendChild(rectangle);
};

const drawLine = () => {
  const line = document.createElementNS(svgNS, "line");
  const id = "shape" + Math.random();

  line.classList.add("movable");
  line.setAttribute("id", id);
  line.setAttribute("x1", "10");
  line.setAttribute("y1", "10");
  line.setAttribute("x2", "200");
  line.setAttribute("y2", "200");
  line.setAttribute("stroke", "black");

  // add current picked color
  line.setAttribute("stroke", selectedColor);

  // add listeners for moving the rectangle
  svg.addEventListener("mousedown", startDrag);
  svg.addEventListener("mousemove", drag);
  svg.addEventListener("mouseup", endDrag);
  svg.addEventListener("mouseleave", endDrag);

  function startDrag(event) {
    if (event.target.classList.contains("movable")) {
      selectedElement = event.target;
    }
  }

  function drag(event) {
    if (selectedElement) {
      event.preventDefault();
      let coordinates = getMousePosition(event);
      selectedElement.setAttributeNS(null, "x1", coordinates.x);
      selectedElement.setAttributeNS(null, "y1", coordinates.y);
    }
  }

  function getMousePosition(event) {
    let CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  function endDrag() {
    selectedElement = null;
  }

  svg.appendChild(line);
};

const drawEllipse = () => {
  const ellipse = document.createElementNS(svgNS, "ellipse");
  const id = "shape" + Math.random();

  ellipse.classList.add("movable");
  ellipse.setAttribute("id", id);
  ellipse.setAttribute("cx", "100");
  ellipse.setAttribute("cy", "50");
  ellipse.setAttribute("rx", "100");
  ellipse.setAttribute("ry", "50");

  // add current picked color
  ellipse.setAttribute("fill", selectedColor);

  // add listeners for moving the rectangle
  svg.addEventListener("mousedown", startDrag);
  svg.addEventListener("mousemove", drag);
  svg.addEventListener("mouseup", endDrag);
  svg.addEventListener("mouseleave", endDrag);

  function startDrag(event) {
    if (event.target.classList.contains("movable")) {
      selectedElement = event.target;
    }
  }

  function drag(event) {
    if (selectedElement) {
      event.preventDefault();
      let coordinates = getMousePosition(event);
      selectedElement.setAttributeNS(null, "cx", coordinates.x);
      selectedElement.setAttributeNS(null, "cy", coordinates.y);
    }
  }

  function getMousePosition(event) {
    let CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  function endDrag() {
    selectedElement = null;
  }

  svg.appendChild(ellipse);
};

rectBtn.addEventListener("click", () => {
  console.log("Drawing rectangle");
  // drawRectangle();
  testSVGShape();
});

lineBtn.addEventListener("click", () => {
  console.log("Drawing line");
  drawLine();
});

ellipseBtn.addEventListener("click", () => {
  console.log("Drawing ellipse");
  drawEllipse();
});

const clearSVG = (source) => {
  while (source.firstChild) {
    source.removeChild(source.firstChild);
  }
};

clearBtn.addEventListener("click", () => {
  console.log("Clearing drawings");
  clearSVG(svg);
});

// auto save the SVG every 10 seconds
setInterval(() => {
  console.log("Auto-saving SVG");
  let serializer = new XMLSerializer();
  let sourceData = serializer.serializeToString(svg);
  window.localStorage.setItem("drawing", sourceData);
}, 10000);
