class Model {
  constructor(json) {
    if (json) {
      this.updateFromJson(json);
    } else {
      this.points = [];
      this.maxPointId = 0;
    }
  }

  updateFromJson(json) {
    let parsed = JSON.parse(json);
    this.points = parsed.points;
    // find max
    this.maxPointId = Math.max.apply(null, parsed.points.map(p => p.id));
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
    return JSON.stringify(output);
  }
  
  jsonPoint(p) {
    return p;
  }
}