class Viewport {
  constructor(width, height, startX, startY, scale) {
    this.width = width;
    this.height = height;
    this.startX = startX;
    this.startY = startY;
    this.height = scale;
  }
  
  setDisplaySize(width, height) {
    this.width = width;
    this.height = height;
  }
}