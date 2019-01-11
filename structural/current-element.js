class CurrentElement {
  constructor(model) {
    this.model = model;
    this.viewConfig = model.viewConfig;
    this.area = null;
    this.canvas = $("#currentElementCanvas").get(0);
  }
  
  drawDot(pos) {
    // Input is in page coords
    
    let canvasContext = this.canvas.getContext("2d");
    this.clear();
    // Draw new point and store location
    this.area = this.viewConfig.drawDotViewCoord(canvasContext, this.viewConfig.pageCoordToView(pos), null, null, "green");
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
      let pointViewCoord = this.viewConfig.modelCoordToView(point);
      this.area = this.viewConfig.drawDotViewCoord(canvasContext, pointViewCoord, point.id, point.support, "red");
    }
  }
  
  clear() {
    if (this.area) {
      let canvasContext = this.canvas.getContext("2d");
      this.viewConfig.clearAreaViewCoord(canvasContext, this.area);
    }
  }
}