class Model {
  constructor(json) {
    // Set initial values. This will be updated if required
    this.viewConfig = new ViewConfig(100, 100, -10, 10, 10, PIXEL_RATIO);
    this.points = {};
    this.maxPointId = 0;
    this.updateFromJson(json ? json : "{}");
  }

  updateFromJson(json) {
    let parsed = JSON.parse(json);
    if (parsed.points && parsed.points.length > 0) {
      this.points = {};
      parsed.points.forEach((p) => {this.points[p.id] = p;});
      // find max
      this.maxPointId = Math.max.apply(null, Object.keys(this.points));
    }
    
    if (parsed.viewConfig) {
      let v = parsed.viewConfig;
      this.viewConfig.setStartAndScale(v.startX, v.startY, v.scale);
    }
  }
  
  addPoint(pos) {
    // Copy and modify
    let point = Object.assign({}, pos);
    point.id = ++this.maxPointId;
    this.points[point.id] = point;
  }
  
  setPoint(id, pos) {
    let point = Object.assign({}, pos);
    point.id = id;
    this.points[id] = point;
  }
  
  removePoint(id) {
    delete this.points[id];
  }
  
  findClosestPoint(pos, maxDist) {
    let closest = null;
    let shortestDist = Number.MAX_SAFE_INTEGER;
    Object.values(this.points).forEach((p) => {
      if (closest == null
          || this.getDist(p, pos) < shortestDist) {
        shortestDist = this.getDist(p, pos);
        closest = p;
      }
    });
    if (!closest) {
      return null;
    }
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
    output.points = [];
    Object.values(this.points).forEach((p) => {
      output.points.push(this.jsonPoint(p));
    });
    output.viewConfig = {
        startX: this.viewConfig.startX,
        startY: this.viewConfig.startY,
        scale: this.viewConfig.scale
    };
    return JSON.stringify(output);
  }
  
  jsonPoint(p) {
    return p;
  }
}