class Model {
  constructor(json) {
    // Set initial values. This will be updated if required
    this.viewConfig = new ViewConfig(100, 100, -10, 10, 10, PIXEL_RATIO, false);
    this.maxId = 0;
    this.updateFromJson(json ? json : "{}");
  }

  updateFromJson(json) {
    let parsed = JSON.parse(json);
    this.points = {};
    this.lines = {};
    if (parsed.points) {
      this.points = {};
      parsed.points.forEach((p) => {this.points[p.id] = p;});
    }
    let maxPointId = 0;
    if (Object.keys(this.points).length != 0) {
      maxPointId = Math.max.apply(null, Object.keys(this.points));
    }
    
    if (parsed.lines) {
      this.lines = {};
      parsed.lines.forEach((l) => {this.lines[l.id] = l;});
    }
    let maxLineId = 0;
    if (Object.keys(this.lines).length != 0) {
      maxLineId = Math.max.apply(null, Object.keys(this.lines));
    }
    this.maxId = Math.max(maxPointId, maxLineId);
    
    if (parsed.viewConfig) {
      let v = parsed.viewConfig;
      this.viewConfig.setStartAndScale(v.startX, v.startY, v.scale);
      this.viewConfig.setDisplayIds(v.displayIds);
    }
  }
  
  addPoint(pos) {
    // Copy and modify
    let point = Object.assign({}, pos);
    point.id = ++this.maxId;
    this.points[point.id] = point;
  }
  
  setPoint(id, pos) {
    let point = Object.assign({}, pos);
    point.id = id;
    this.points[id] = point;
  }
  
  removePoint(id) {
    delete this.points[id];
    // Remove lines that include this point
    let linesToDelete = 
        Object.values(this.lines)
            .filter((l) => l.start == id || l.end == id)
            .map((l) => l.id);
    linesToDelete.forEach((id) => {delete this.lines[id]});
  }
  
  addLine(startEnd) {
    // Copy and modify
    let line = Object.assign({}, startEnd);
    line.id = ++this.maxId;
    this.lines[line.id] = line;
  }

  setLine(id, line) {
    let lineWithId = Object.assign({}, line);
    line.id = id;
    this.lines[id] = lineWithId;
  }
  
  
  findClosestPoint(pos, maxDist) {
    return this.findClosest(pos, maxDist, this.points, this.getDist.bind(this));
  }
  
  findClosestLine(pos, maxDist) {
    return this.findClosest(pos, maxDist, this.lines, this.getLineDist.bind(this));
  }
  
  findClosest(pos, maxDist, input, distMethod) {
    let closest = null;
    let shortestDist = Number.MAX_SAFE_INTEGER;
    Object.values(input).forEach((p) => {
      let dist = distMethod(p, pos);
      if (dist != null && closest == null) {
        shortestDist = dist;
        closest = p;
      } else if(dist != null && dist < shortestDist) {
        shortestDist = dist;
        closest = p;
      }
    });
    if (!closest) {
      return null;
    }
    if (distMethod(closest, pos) > maxDist) {
      return null;
    }
    return closest;
  }
  
  getDist(p1, p2) {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  getLineDist(line, point) {
    let p1 = this.points[line.start];
    let p2 = this.points[line.end];
    if (!p1 || !p2) {
      return;
    }
    
    let distP1 = this.getDist(point, p1);
    let distP2 = this.getDist(point, p2);
    let endpointDist = this.getDist(p1, p2);
    if (distP1 > endpointDist || distP2 > endpointDist) {
      // User didn't click between endpoints so didn't select line
      return null;
    }
    
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let lineDist = Math.abs(dy * point.x - dx * point.y + p2.x * p1.y - p2.y * p1.x) / Math.sqrt(dx * dx + dy * dy);
    return lineDist;
  }
  
  toJson() {
    let output = {};
    output.points = [];
    Object.values(this.points).forEach((p) => {
      output.points.push(this.jsonPoint(p));
    });
    output.lines = [];
    Object.values(this.lines).forEach((l) => {
      output.lines.push(this.jsonLine(l));
    });
    output.viewConfig = {
        startX: this.viewConfig.startX,
        startY: this.viewConfig.startY,
        scale: this.viewConfig.scale,
        displayIds: this.viewConfig.displayIds
    };
    return JSON.stringify(output);
  }
  
  jsonPoint(p) {
    return p;
  }
  
  jsonLine(l) {
    return l;
  }
}