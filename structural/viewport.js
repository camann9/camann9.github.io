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
  
  clear(context) {
    context.clearRect(0, 0, this.width, this.height);
  }
  
  drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    // Straddle pixels
    context.moveTo(x1 + 0.5, y1 + 0.5);
    context.lineTo(x2 + 0.5, y2 + 0.5);
    context.stroke();
  }
  
  drawAxes(context) {
    let x0View = this.xToView(0);
    let y0View = this.yToView(0);
    
    // y axis
    this.drawLine(context, x0View, 0, x0View, this.height);
    // x axis
    this.drawLine(context, 0, y0View, this.width, y0View);
  }

  
  xToView(x) {
    return x * this.scale - this.startX;
  }
  
  yToView(y) {
    return y * this.scale - this.startY;
  }

  xToModel(x) {
    return (x + this.startX) / this.scale;
  }
  
  yToModel(y) {
    return (y + this.startY) / this.scale;
  }
}