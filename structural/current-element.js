class CurrentElement {
  constructor(model) {
    this.model = model;
    this.viewport = model.viewport;
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
  
  drawSelection(selection) {
    if (!selection) {
      this.clear();
      return;
    }
    let canvasContext = this.canvas.getContext("2d");
    this.clear();
    
    if (selection.type == "point") {
      let point = this.model.points[selection.id];
      // Draw new point and store location
      let pointViewCoord = this.viewport.modelCoordToView(point);
      this.area = this.viewport.drawDotViewCoord(canvasContext, pointViewCoord, "red");
    }
  }
  
  clear() {
    if (this.area) {
      let canvasContext = this.canvas.getContext("2d");
      this.viewport.clearAreaViewCoord(canvasContext, this.area);
    }
  }
}