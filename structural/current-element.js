class CurrentElement {
  constructor(viewport) {
    this.viewport = viewport;
    this.area = null;
    this.canvas = $("#currentElementCanvas").get(0);
  }
  
  drawDot(pos) {
    // Input is in page coords
    
    let canvasContext = this.canvas.getContext("2d");
    this.clear();
    // Draw new point and store location
    this.area = this.viewport.drawDotViewCoord(canvasContext, this.viewport.pageCoordToView(pos), "green");
  }
  
  drawSelectedPoint(point) {
    // Input is in model coords
    
    let canvasContext = this.canvas.getContext("2d");
    this.clear();
    // Draw new point and store location
    this.area = this.viewport.drawDotViewCoord(canvasContext, this.viewport.modelCoordToView(point), "red");
  }
  
  clear() {
    if (this.area) {
      let canvasContext = this.canvas.getContext("2d");
      this.viewport.clearAreaViewCoord(canvasContext, this.area);
    }
  }
}