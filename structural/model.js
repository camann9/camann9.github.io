class Model {
  constructor(json) {
    // Set initial values. This will be updated if required
    this.viewport = new Viewport(100, 100, -10, 10, 10, PIXEL_RATIO);
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
  
  findClosestPoint(pos, maxDist) {
    if (this.points.length == 0) {
      return null;
    }
    let closest = this.points[0];
    let shortestDist = this.getDist(closest, pos);
    this.points.forEach((p) => {
      let dist = this.getDist(p, pos);
      if (dist < shortestDist) {
        shortestDist = dist;
        closest = p;
      } 
    });
    if (this.getDist(closest, pos) > maxDist) {
      return null;
    }
    return closest;
  }
  
  getDist(p1, p2) {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
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