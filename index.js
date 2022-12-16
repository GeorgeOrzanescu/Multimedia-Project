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
 * Function that performs that performs SVG downloading
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
 * @param {Event} event
 */
function deleteShape(event) {
  if (event.key === "d") {
    if (hoveredElement.id.includes("shape")) {
      hoveredElement.remove();
    }
  }
}

/**
 * Function that handles drawing rectangles
 */
const drawRectangle = () => {
  const rectangle = document.createElementNS(svgNS, "rect");
  const id = "shape" + Math.random();

  rectangle.classList.add("moveble");
  rectangle.setAttribute("id", id);
  rectangle.setAttribute("x", 0);
  rectangle.setAttribute("y", 0);
  rectangle.setAttribute("height", "200");
  rectangle.setAttribute("width", "200");

  // add current picked color
  rectangle.setAttribute("fill", selectedColor);

  // // add listeners for moving the rectangle
  // svg.addEventListener("mousedown", startDrag);
  // svg.addEventListener("mousemove", drag);
  // svg.addEventListener("mouseup", endDrag);
  // svg.addEventListener("mouseleave", endDrag);

  // function startDrag(event) {
  //   if (event.target.classList.contains("moveble")) {
  //     selectedElement = event.target;
  //   }
  // }

  // function drag(event) {
  //   if (selectedElement) {
  //     event.preventDefault();
  //     let coord = getMousePosition(event);
  //     selectedElement.setAttributeNS(null, "x", coord.x);
  //     selectedElement.setAttributeNS(null, "y", coord.y);
  //   }
  // }

  function getMousePosition(event) {
    let CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  // function endDrag() {
  //   selectedElement = null;
  // }

  // ------------
  // ... existing code for creating the rectangle element

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

  // function startAction(event) {
  //   if (event.target.classList.contains("moveble")) {
  //     // start dragging if the mouse is clicked on the rectangle
  //     isDragging = true;
  //     selectedElement = event.target;
  //   } else {
  //     // start resizing if the mouse is clicked on the SVG outside the rectangle
  //     isResizing = true;
  //     selectedElement = hoveredElement;
  //     // store the initial size and position of the rectangle
  //     initialWidth = parseInt(rectangle.getAttribute("width"));
  //     initialHeight = parseInt(rectangle.getAttribute("height"));
  //     initialX = parseInt(rectangle.getAttribute("x"));
  //     initialY = parseInt(rectangle.getAttribute("y"));
  //   }
  // }

  function performAction(event) {
    if (isDragging) {
      // perform dragging if the flag is set
      event.preventDefault();
      let coord = getMousePosition(event);
      selectedElement.setAttributeNS(null, "x", coord.x);
      selectedElement.setAttributeNS(null, "y", coord.y);
    } else if (isResizing) {
      // perform resizing if the flag is set
      event.preventDefault();
      let coord = getMousePosition(event);

      // calculate the new size of the rectangle based on the mouse movement
      let newWidth = initialWidth + coord.x - initialX;
      let newHeight = initialHeight + coord.y - initialY;

      // update the width and height attributes of the rectangle
      selectedElement.setAttribute("width", newWidth);
      selectedElement.setAttribute("height", newHeight);
    }
  }

  function startAction(event) {
    if (event.target.classList.contains("moveble")) {
      // check if the mouse is clicked on the corners of the rectangle to initiate resizing
      let rect = event.target.getBoundingClientRect();
      let x = event.clientX;
      let y = event.clientY;
      let topLeft =
        x >= rect.left &&
        x <= rect.left + 10 &&
        y >= rect.top &&
        y <= rect.top + 10;
      let topRight =
        x >= rect.right - 10 &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.top + 10;
      let bottomLeft =
        x >= rect.left &&
        x <= rect.left + 10 &&
        y >= rect.bottom - 10 &&
        y <= rect.bottom;
      let bottomRight =
        x >= rect.right - 10 &&
        x <= rect.right &&
        y >= rect.bottom - 10 &&
        y <= rect.bottom;
      if (topLeft || topRight || bottomLeft || bottomRight) {
        // start resizing if the mouse is clicked on the corners of the rectangle
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

  line.classList.add("moveble");
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
    if (event.target.classList.contains("moveble")) {
      selectedElement = event.target;
    }
  }

  function drag(event) {
    if (selectedElement) {
      event.preventDefault();
      let coord = getMousePosition(event);
      selectedElement.setAttributeNS(null, "x1", coord.x);
      selectedElement.setAttributeNS(null, "y1", coord.y);
    }
  }

  function getMousePosition(event) {
    let CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  function endDrag(event) {
    selectedElement = null;
  }

  svg.appendChild(line);
};

const drawEllipse = () => {
  const ellipse = document.createElementNS(svgNS, "ellipse");
  const id = "shape" + Math.random();

  ellipse.classList.add("moveble");
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
    if (event.target.classList.contains("moveble")) {
      selectedElement = event.target;
    }
  }

  function drag(event) {
    if (selectedElement) {
      event.preventDefault();
      let coord = getMousePosition(event);
      selectedElement.setAttributeNS(null, "cx", coord.x);
      selectedElement.setAttributeNS(null, "cy", coord.y);
    }
  }

  function getMousePosition(event) {
    let CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  function endDrag(event) {
    selectedElement = null;
  }

  svg.appendChild(ellipse);
};

rectBtn.addEventListener("click", () => {
  console.log("Drawing rectangle");
  drawRectangle();
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

// autosave the SVG every 10 seconds
setInterval(() => {
  console.log("Autosaving SVG");
  let serializer = new XMLSerializer();
  let sourceData = serializer.serializeToString(svg);
  window.localStorage.setItem("drawing", sourceData);
}, 10000);
