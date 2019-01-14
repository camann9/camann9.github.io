class CurrentElement {
  constructor(model) {
    this.model = model;
    this.viewConfig = model.viewConfig;
    this.area = null;
    this.canvas = $("#currentElementCanvas").get(0);
    this.selection = null;
    this.lineStart = null;
  }
  
  drawDot(pos) {
    // Input is in page coords
    
    let canvasContext = this.canvas.getContext("2d");
    this.clear();
    // Draw new point and store location
    this.area = this.viewConfig.drawDotViewCoord(canvasContext, this.viewConfig.pageCoordToView(pos), null, null, "green");
  }
  
  drawSelection(selection) {
    this.selection = selection;
    this.redrawSelection();
  }
  
  redrawSelection() {
    this.clear();
    if (!this.selection) {
      return;
    }
    
    let canvasContext = this.canvas.getContext("2d");
    if (this.selection.type == "point") {
      let point = this.model.points[this.selection.id];
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
  
  onModeChange() {
    this.lineStart = null;
    this.selection = null;
    this.clear();
  }
}