class Viewport {
  constructor(width, height, startX, startY, scale, pixelScale) {
    this.width = width;
    this.height = height;
    this.startX = startX;
    this.startY = startY;
    this.scale = scale;
    this.pixelScale = pixelScale;
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
  
  zoom(amount, mousePos) {
    this.scale *= amount;
    // keep the model location at the cursor position constant
    let modelCoord = this.pageCoordToModel(mousePos);
    let deltaX = modelCoord.x - this.startX;
    let deltaY = modelCoord.y - this.startY;
    this.startX += deltaX * amount;
    this.startY += deltaY * amount;
  }
  
  clear(context) {
    context.clearRect(0, 0, this.width, this.height);
  }
  
  clearAreaViewCoord(context, area) {
    context.clearRect(area.x, area.y, area.width, area.height);
  }
  
  drawDot(context, pos, color) {
    this.drawDotViewCoord(context, this.modelCoordToView(pos), color);
  }
  
  drawDotViewCoord(context, pos, color) {
    let radius = this.pixelScale * 2;
    context.beginPath();
    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color == null ? 'black' : color;
    context.fill();
    // Clear some additional area to make sure we don't get artifacts
    return {x: pos.x - radius * 2, y: pos.y - radius * 2, width: radius * 4, height: radius * 4};
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
    return {x: this.xToModel(pos.x), y: this.yToModel(pos.y)};
  }
  
  modelCoordToView(pos) {
    return {x: this.xToView(pos.x), y: this.yToView(pos.y)};
  }
  
  pageCoordToView(pos) {
    return {x: this.pixelScale * pos.x, y: this.pixelScale * pos.y};
  }
}