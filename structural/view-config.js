class ViewConfig {
  constructor(width, height, startX, startY, scale, pixelScale, displayDetails) {
    this.width = width;
    this.height = height;
    this.startX = startX;
    this.startY = startY;
    this.scale = scale;
    this.pixelScale = pixelScale;
    this.displayDetails = displayDetails;
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
  
  setDisplayDetails(displayDetails) {
    this.displayDetails = displayDetails;
  }
  
  toggleDisplayDetails() {
    this.displayDetails = !this.displayDetails;
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
  
  drawDot(context, pos, label, supportType, color) {
    this.drawDotViewCoord(context, this.modelCoordToView(pos), label, supportType, color);
  }
  
  drawDotViewCoord(context, pos, label, supportType, color) {
    let radius = this.pixelScale * 2;
    context.beginPath();
    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color == null ? 'black' : color;
    context.fill();
    
    let textMeasurements = context.measureText(label);
    if (this.displayDetails && !!label) {
      context.font = (this.pixelScale * 10) + 'pt sans serif';
      context.fillText(label, pos.x + radius, pos.y);
    }
    if (!!supportType) {
      context.beginPath();
      if (supportType == "p") {
        this.drawPinnedSupport(context, pos, radius);
      } else if (supportType.startsWith("r")) {
        this.drawRollingSupport(context, pos, radius,supportType);
      }
      context.strokeStyle = color;
      context.stroke();
    }
    // Clear some additional area to make sure we don't get artifacts
    return {x: pos.x - radius * 12, y: pos.y - radius * 12, width: radius * 24 + textMeasurements.width, height: radius * 24};
  }
  
  drawLineModelCoord(context, p1, p2, label, color) {
    let p1View = this.modelCoordToView(p1);
    let p2View = this.modelCoordToView(p2);
    return this.drawLineViewCoord(context, p1View.x, p1View.y, p2View.x, p2View.y, label, color);
  }
  
  drawLineViewCoord(context, x1, y1, x2, y2, label, color) {
    context.fillStyle = color;
    context.strokeStyle = color;

    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    
    let textMeasurements = context.measureText(label);
    if (this.displayDetails && !!label) {
      context.font = (this.pixelScale * 10) + 'pt sans serif';
      context.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2);
    }

    // Compute dirty area
    let startX = Math.min(x1, x2) - 10;
    let startY = Math.min(y1, y2) - 10;
    let width = Math.abs(x1 - x2) + 20 + textMeasurements.width;
    let height = Math.abs(y1 - y2) + 20;
    return {x: startX, y: startY, width: width, height: height};
  }
  
  drawAxes(context) {
    let x0View = this.xToView(0);
    let y0View = this.yToView(0);
    
    // y axis
    this.drawLineViewCoord(context, x0View, 0, x0View, this.height, null, "black");
    // x axis
    this.drawLineViewCoord(context, 0, y0View, this.width, y0View, null, "black");
  }
  
  drawPinnedSupport(context, pos, radius) {
    // triangle
    context.moveTo(pos.x, pos.y);
    context.lineTo(pos.x - radius * 4, pos.y + radius * 3);
    context.lineTo(pos.x + radius * 4, pos.y + radius * 3);
    context.lineTo(pos.x, pos.y);
    
    // line underneath
    context.moveTo(pos.x - radius * 8, pos.y + radius * 3);
    context.lineTo(pos.x + radius * 8, pos.y + radius * 3);
  }
  
  drawRollingSupport(context, pos, radius, type) {
    // triangle
    this.moveTo(context, this.translateSupportPoint(pos, type, {x: 0, y: 0}));
    this.lineTo(context, this.translateSupportPoint(pos, type, {x: -radius * 4, y: radius * 3}));
    this.lineTo(context, this.translateSupportPoint(pos, type, {x: radius * 4, y: radius * 3}));
    this.lineTo(context, this.translateSupportPoint(pos, type, {x: 0, y: 0}));
    
    // two rollers
    this.circle(context, this.translateSupportPoint(pos, type, {x: -radius * 3, y: radius * 4}), radius);
    this.circle(context, this.translateSupportPoint(pos, type, {x: radius * 3, y: radius * 4}), radius);
    
    // line underneath
    this.moveTo(context, this.translateSupportPoint(pos, type, {x: -radius * 8, y: radius * 5}));
    this.lineTo(context, this.translateSupportPoint(pos, type, {x: radius * 8, y: radius * 5}));
  }
  
  moveTo(context, pos) {
    context.moveTo(pos.x, pos.y);
  }
  
  lineTo(context, pos) {
    context.lineTo(pos.x, pos.y);
  }
  
  circle(context, pos, radius) {
    // Arc starts at zero degrees (on the right) so we need to move pen there
    // before we start drawing
    context.moveTo(pos.x + radius, pos.y);
    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
  }
  
  translateSupportPoint(centerPoint, type, offset) {
    if (type == "rt") {
      offset.y = -offset.y;
    }
    if (type == "rr" || type == "rl") {
      let temp = offset.x;
      offset.x = offset.y;
      offset.y = temp;
      if (type == "rl") {
        offset.x = -offset.x;
      }
    }
    return {x: centerPoint.x + offset.x, y: centerPoint.y + offset.y};
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