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
  
  drawLine(pos) {
    // Input is in page coords
    
    // Only draw if we have a line start
    if (!this.lineStart) {
      return;
    }
    // Convert start and end point to view coords
    let startViewCoord = this.viewConfig.modelCoordToView(this.model.points[this.lineStart]);
    let endViewCoord = this.viewConfig.pageCoordToView(pos);
    
    // Draw
    let canvasContext = this.canvas.getContext("2d");
    this.clear();
    // Draw new point and store location
    this.area = this.viewConfig.drawLineViewCoord(canvasContext,
        startViewCoord.x, startViewCoord.y, endViewCoord.x, endViewCoord.y, null, "green");
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
    } else if (this.selection.type == "line") {
      let l = this.model.lines[this.selection.id];
      let p1 = this.model.points[l.start];
      let p2 = this.model.points[l.end];
      if (!p1 || !p2) {
        return;
      }
      // Draw new point and store location
      this.area = this.viewConfig.drawLineModelCoord(canvasContext, p1, p2, l.id, "red");
    }
  }
  
  clear() {
    if (this.area) {
      let canvasContext = this.canvas.getContext("2d");
      this.viewConfig.clearAreaViewCoord(canvasContext, this.area);
    }
  }
  
  resetLine() {
    this.lineStart = null;
    this.clear();
  }
  
  onModeChange() {
    this.resetLine();
    this.selection = null;
    this.clear();
  }
}