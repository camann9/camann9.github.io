class CurrentElement {
  constructor(viewport) {
    this.viewport = viewport;
    this.area = null;
    this.canvas = $("#currentElementCanvas").get(0);
  }
  
  drawDot(pos) {
    let canvasContext = this.canvas.getContext("2d");
    // Clear area of old location
    this.clear();
    // Draw new point and store location
    this.area = this.viewport.drawDotViewCoord(canvasContext, this.viewport.pageCoordToView(pos), "green");
  }
  
  clear() {
    if (this.area) {
      let canvasContext = this.canvas.getContext("2d");
      this.viewport.clearAreaViewCoord(canvasContext, this.area);
    }
  }
}