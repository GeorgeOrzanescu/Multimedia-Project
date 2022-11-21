/**
 * Class for SVG Line
 */
class Line {
  /**
   * Create line starting at point
   * @param {Vector} pos
   */
  constructor(pos) {
    this.el = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.el.classList.add("line");
    this.el.setAttribute("stroke", "black");
    this.el.setAttribute("stroke-width", "2");
    this.setPosition(pos);
  }

  /**
   * Position the line with coordinates
   * @param {Vector} pos
   */
  setPosition(pos) {
    this.el.setAttribute("x1", pos.x1);
    this.el.setAttribute("y1", pos.y1);
    this.el.setAttribute("x2", pos.x2);
    this.el.setAttribute("y2", pos.y2);
  }

  /**
   * Get position of the line
   * @returns {Vector}
   */
  getPosition() {
    return {
      x1: this.el.getAttribute("x1"),
      y1: this.el.getAttribute("y1"),
      x2: this.el.getAttribute("x2"),
      y2: this.el.getAttribute("y1"),
    };
  }

  /**
   * Rotate the line from its origin
   * @param {Vector} angle
   */
  setRotate(angle) {
    let newPos = (pos = this.getPosition());
    newPos.x2 = pos - radius * Math.cos(angle);
    newPos.y2 = pos - radius * Math.sin(angle);
    this.setPosition(newPos);
  }

  /**
   * Returns the HTMLElement for the line
   * @returns {HTMLElement}
   */
  getHtmlEl() {
    return this.el;
  }
}

/**
 * Class representing Graph container
 */
class Graph {
  /**
   * Bind svg Element to class
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.el = element;

    /**
     * List of all child elements
     */
    this.elements = [];

    // Default mode
    this.mode = "line";

    // Set size for svg
    // this.setSize();

    // Bind events
    this.el.onmousedown = this.mouseDown.bind(this);
    this.el.onmouseup = this.mouseUp.bind(this);
    this.el.onmouseout = this.mouseUp.bind(this);
    this.el.onmousemove = this.mouseMove.bind(this);
  }

  /**
   * Set the draw mode
   * @param {String} mode
   */
  setMode(mode) {
    this.mode = mode;
  }

  /**
   * Callback for Mousedown event
   * @param {HTMLEvent} event
   */
  mouseDown(event) {
    this.drawStart = true;
    let line = new Line({
      x1: event.pageX,
      y1: event.pageY,
      x2: event.pageX,
      y2: event.pageY,
    });
    this.current = line;
    this.el.appendChild(line.getHtmlEl());
  }

  /**
   * Callback for mouseUp
   * @param {HTMLEvent} event
   */
  mouseUp(event) {
    this.drawStart = false;
    this.current = null;
  }

  /**
   * Callback for mouseMove
   * @param {HTMLEvent} event
   */
  mouseMove(event) {
    if (this.drawStart && this.current) {
      let pos = this.current.getPosition();
      pos.x2 = event.pageX;
      pos.y2 = event.pageY;
      this.current.setPosition(pos);
    }
  }

  //   setSize() {
  //     this.el.setAttribute("width", window.innerWidth);
  //     this.el.setAttribute("height", window.innerHeight);
  //   }
}

window.onload = () => {
  window.graph = new Graph(document.getElementById("drawing-area"));
};
