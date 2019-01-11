class ViewConfig {
  constructor(width, height, startX, startY, scale, pixelScale, displayIds) {
    this.width = width;
    this.height = height;
    this.startX = startX;
    this.startY = startY;
    this.scale = scale;
    this.pixelScale = pixelScale;
    this.displayIds = displayIds;
  }
  
  setDisplaySize(width, height) {
    this.width = width;
    this.height = height;
  }
  
  setStartAndScale(startX, startY, scale) {
    this.startX = startX;
    this.startY = startY;
    this.scale = scale;
  }
  
  setDisplayIds(displayIds) {
    this.displayIds = displayIds;
  }
  
  toggleDisplayIds() {
    this.displayIds = !this.displayIds;
  }
  
  zoom(amount, mousePos) {
    let modelCoord = this.pageCoordToModel(mousePos);
    this.scale *= amount;
    // keep the model location at the cursor position constant
    let deltaX = modelCoord.x - this.startX;
    let deltaY = modelCoord.y - this.startY;
    this.startX += deltaX * (1 - 1 / amount);
    this.startY += deltaY * (1 - 1/ amount);
  }
  
  clear(context) {
    context.clearRect(0, 0, this.width, this.height);
  }
  
  clearAreaViewCoord(context, area) {
    context.clearRect(area.x, area.y, area.width, area.height);
  }
  
  drawDot(context, pos, id, supportType, color) {
    this.drawDotViewCoord(context, this.modelCoordToView(pos), id, supportType, color);
  }
  
  drawDotViewCoord(context, pos, id, supportType, color) {
    let radius = this.pixelScale * 2;
    context.beginPath();
    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color == null ? 'black' : color;
    context.fill();
    let textMeasurements = context.measureText(id);
    if (this.displayIds && !!id) {
      context.font = (this.pixelScale * 10) + 'pt sans serif';
      context.fillText(id, pos.x + radius, pos.y);
    }
    // Clear some additional area to make sure we don't get artifacts
    return {x: pos.x - radius * 2, y: pos.y - radius * 6, width: radius * 6 + textMeasurements.width, height: radius * 12};
  }
  
  drawLineViewCoord(context, x1, y1, x2, y2) {
    context.beginPath();
    // Straddle pixels
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }
  
  drawAxes(context) {
    let x0View = this.xToView(0);
    let y0View = this.yToView(0);
    
    // y axis
    this.drawLineViewCoord(context, x0View, 0, x0View, this.height);
    // x axis
    this.drawLineViewCoord(context, 0, y0View, this.width, y0View);
  }
  
  xToView(x) {
    return (x - this.startX) * this.scale;
  }
  
  yToView(y) {
    return (this.startY - y) * this.scale;
  }

  xToModel(x) {
    return x / this.scale + this.startX;
  }
  
  yToModel(y) {
    return -y / this.scale + this.startY;
  }
  
  pageCoordToModel(pos) {
    return this.viewCoordToModel(this.pageCoordToView(pos));
  }
  
  viewCoordToModel(pos) {
    let point = Object.assign({}, pos);
    point.x = this.xToModel(pos.x);
    point.y = this.yToModel(pos.y);
    return point;
  }
  
  modelCoordToView(pos) {
    let point = Object.assign({}, pos);
    point.x = this.xToView(pos.x);
    point.y = this.yToView(pos.y);
    return point;
  }
  
  pageCoordToView(pos) {
    let point = Object.assign({}, pos);
    point.x = this.pixelScale * pos.x;
    point.y = this.pixelScale * pos.y;
    return point;
  }
  
  getMaxDistForSelection() {
    return 8 * 1 / this.scale;
  }
}