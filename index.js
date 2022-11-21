const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("drawing-area");

const rectBtn = document.getElementById("btn-rect");
const lineBtn = document.getElementById("btn-line");
const ellipseBtn = document.getElementById("btn-ellipse");
const clearBtn = document.getElementById("btn-clear");

let selectedElement = false;

const drawRectangle = () => {
  const rectangle = document.createElementNS(svgNS, "rect");
  rectangle.classList.add("moveble");
  rectangle.setAttribute("x", 0);
  rectangle.setAttribute("y", 0);
  rectangle.setAttribute("height", "200");
  rectangle.setAttribute("width", "200");

  // add listeners for moving the rectangle
  svg.addEventListener("mousedown", startDrag);
  svg.addEventListener("mousemove", drag);
  svg.addEventListener("mouseup", endDrag);
  svg.addEventListener("mouseleave", endDrag);

  function startDrag(event) {
    if (event.target.classList.contains("moveble")) {
      selectedElement = event.target;
      console.log(selectedElement);
    }
  }

  function drag(event) {
    if (selectedElement) {
      event.preventDefault();
      var coord = getMousePosition(event);
      selectedElement.setAttributeNS(null, "x", coord.x);
      selectedElement.setAttributeNS(null, "y", coord.y);
    }
  }

  function getMousePosition(event) {
    var CTM = svg.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  function endDrag(event) {
    selectedElement = null;
  }

  svg.appendChild(rectangle);
};

const drawLine = () => {
  const line = document.createElementNS(svgNS, "line");
  line.setAttribute("x1", "10");
  line.setAttribute("y1", "10");
  line.setAttribute("x2", "200");
  line.setAttribute("y2", "200");
  line.setAttribute("stroke", "black");

  svg.appendChild(line);
};

const drawEllipse = () => {
  const ellipse = document.createElementNS(svgNS, "ellipse");
  ellipse.setAttribute("cx", "100");
  ellipse.setAttribute("cy", "50");
  ellipse.setAttribute("rx", "100");
  ellipse.setAttribute("ry", "50");

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