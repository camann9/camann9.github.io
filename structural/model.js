class Model {
  constructor(json) {
    // Set initial values. This will be updated if required
    this.viewport = new Viewport(100, 100, -10, -10, 10, PIXEL_RATIO);
    this.points = [];
    this.maxPointId = 0;
    this.updateFromJson(json ? json : "{}");
  }

  updateFromJson(json) {
    let parsed = JSON.parse(json);
    if (parsed.points) {
      this.points = parsed.points;
      // find max
      this.maxPointId = Math.max.apply(null, parsed.points.map(p => p.id));
    }
    
    if (parsed.viewport) {
      let v = parsed.viewport;
      this.viewport.setStartAndScale(v.startX, v.startY, v.scale);
    }
  }
  
  addPoint(pos) {
    // Copy and modify
    let point = Object.assign({}, pos);
    point.id = ++this.maxPointId;
    this.points.push(point);
  }
  
  toJson() {
    let output = {};
    output.points = this.points.map(p => this.jsonPoint(p));
    output.viewport = {
        startX: this.viewport.startX,
        startY: this.viewport.startY,
        scale: this.viewport.scale
    };
    return JSON.stringify(output);
  }
  
  jsonPoint(p) {
    return p;
  }
}