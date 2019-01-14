class Controller {
  constructor(model, simulationState, currentElement, viewConfig, view) {
    this.model = model;
    this.simulationState = simulationState;
    this.currentElement = currentElement;
    this.viewConfig = viewConfig;
    this.view = view;
    this.mode = null;
    this.mousePos = null;
    this.selection = null;
  }
  
  onKeydown(event) {
    let oldMode = this.mode;
    
    if ($("#currentJson").is(":focus")) {
      // Nothing to do if user focuses on text area
      // We want to let them enter stuff
      return;
    }
    
    if (event.key == "s") {
      this.simulationState.running = !this.simulationState.running;
      if (this.simulationState.running) {
        this.simulationState.runStart = performance.now();
        requestAnimationFrame($.proxy(this.paint, this));
      }
    } else if(event.key == "p") {
      this.mode = "point";
      if(this.mousePos) {
        this.currentElement.drawDot(this.mousePos);
      }
    } else if(event.key == "l") {
      this.mode = "line";
    } else if(event.key == ",") {
      if (!this.view.advanceFocus()) {
        return;
      }
      this.onModelChange(true);
    } else if(event.key == "Enter") {
      if (this.mode == "point" || this.mode == "line") {
        this.placeObjectFromMeasureFields();
      } else if (this.selection) {
        // Trigger change on currently selected object
        this.onPropertyChange();
      }
    } else if(event.key == " " || event.key == "Escape") {
      this.mode = null;
      this.clearSelection();
    } else if(event.key == "d") {
      this.removeSelected();
      this.onModelChange(true);
    } else if(event.key == "i") {
      this.model.viewConfig.toggleDisplayIds();
      this.onModelChange(true);
    } else {
      return;
    }
    
    // If we're no longer in selection mode we need to clear the selection
    if (oldMode != this.mode) {
      this.onModeChange();
    }
    // If we treated the event (not "else" case) then we prevent default
    event.preventDefault();
  }
  
  static getModelFromCookie() {
    let modelBase64 = Cookies.get('model');
    if(!!modelBase64) {
      return new Model(atob(modelBase64));
    }
    return new Model();
  }
  
  onModeChange() {
    this.clearSelection();
    this.currentElement.onModeChange();
    this.view.onModeChange(this.mode);
  }
  
  onClick(event) {
    if (!this.mode) {
      this.select(event);
    } else if (this.mode == "point") {
      this.model.addPoint(this.viewConfig.pageCoordToModel(this.getNewPointFromEvent(event)));
      // Prepare input field for next element
      this.view.selectFirstInputField();
      this.onModelChange(true);
    } else if (this.mode == "line") {
      let point = this.getExistingPointFromEvent(event);
      if (!point) {
        return;
      }
      if (!!this.currentElement.lineStart) {
        this.model.addLine({start: this.currentElement.lineStart, end: point.id});
        // Prepare input field for next element
        this.currentElement.resetLine();
        this.view.selectFirstInputField();
        this.onModelChange(true);
      } else {
        this.currentElement.lineStart = point.id;
      }
    }
  }

  onJsonChange() {
    try {
      this.model.updateFromJson($('#currentJson').val());
    } catch(ex) {
      console.log(ex);
      $('#currentJson').addClass("incorrect");
      return;
    }
    this.onModeChange();
    this.onModelChange(false);
  }
  
  onMousemove(event) {
    this.mousePos = this.getPosFromMouseEvent(event);
    this.view.updateMousePos(this.viewConfig.pageCoordToModel(this.mousePos));
    if (this.mode == "point") {
      this.currentElement.drawDot(this.mousePos);
    } else if (this.mode == "line") {
      this.currentElement.drawLine(this.mousePos);
    }
  }
  
  onWheel(event) {
    var delta = event.originalEvent.deltaY;

    if (delta > 0) {
      this.viewConfig.zoom(1 / 1.25, this.mousePos);
    } else {
      this.viewConfig.zoom(1.25, this.mousePos);
    }
    this.onModelChange(true);

    // Prevent default
    return false;
  }
  
  onPropertyChange() {
    if (!this.selection) {
      return;
    }
    if (this.selection.type == "point") {
      let newPoint = this.getPointFromPropertyFields();
      this.model.setPoint(this.selection.id, newPoint);
    } else if (this.selection.type == "line") {
      let newLine = this.getLineFromPropertyFields();
      if (newLine) {
        this.model.setLine(this.selection.id, newLine);
      }
    }
    this.onModelChange(true);
  }
  
  onModelChange(updateJson) {
    // Populate side bar with model data, store model in cookie, and update view
    let modelJson = this.model.toJson();
    if (updateJson) {
      $('#currentJson').val(modelJson);
    }
    $('#currentJson').removeClass("incorrect");
    this.updateModelStorage(modelJson);
    this.view.paint();
    this.currentElement.drawSelection(this.selection);
  }
  
  updateModelStorage(modelJson) {
    Cookies.set('model', btoa(modelJson));
  }
  
  getPosFromMouseEvent(event) {
    let canvasOffset = $('#mainCanvas').offset();
    let x = event.pageX - canvasOffset.left;
    let y = event.pageY - canvasOffset.top;
    return {x: x, y: y};
  }
  
  getNewPointFromEvent(event) {
    let point = this.getPosFromMouseEvent(event);
    let pointFromMeasures = this.getPointFromMeasureFields();
    // Overwrite x/y with mouse pos
    Object.assign(pointFromMeasures, point);
    return pointFromMeasures;
  }
  
  getPointFromMeasureFields() {
    return this.getPointFromInputFields("measure");
  }
  
  getPointFromPropertyFields() {
    return this.getPointFromInputFields("prop");
  }
  
  getPointFromInputFields(fieldType) {
    let canvasOffset = $('#mainCanvas').offset();
    let point = {};
    point.x = parseFloat($("#" + fieldType + "PointX").val());
    point.y = parseFloat($("#" + fieldType + "PointY").val());
    point.support = $("#" + fieldType + "PointSupport").val();
    if (isNaN(point.x) || isNaN(point.y)) {
      return null;
    }
    return point;
  }
  
  getLineFromMeasureFields() {
    return this.getLineFromInputFields("measure");
  }
  
  getLineFromPropertyFields() {
    return this.getLineFromInputFields("prop");
  }
  
  getLineFromInputFields(fieldType) {
    let canvasOffset = $('#mainCanvas').offset();
    let line = {};
    line.start = parseInt($("#" + fieldType + "LineStart").val());
    line.end = parseInt($("#" + fieldType + "LineEnd").val());
    // The two points need to be integers
    if (isNaN(line.start) || isNaN(line.end)) {
      return null;
    }
    // The two points need to be different
    if (line.start == line.end) {
      return null;
    }
    // The two points need to be valid
    if (!this.model.points[line.start] || !this.model.points[line.end]) {
      return null;
    }
    return line;
  }
  
  removeSelected() {
    if (this.selection) {
      if (this.selection.type == "point") {
        this.model.removePoint(this.selection.id);
      }
    }
    this.onModeChange();
  }
  
  clearSelection() {
    this.selection = null;
    this.currentElement.clear();
    this.view.hideProperties();
  }
  
  select(event) {
    // Select point
    let point = this.getExistingPointFromEvent(event);
    if (point) {
      this.selection = {id: point.id, type: "point"};
      // Highlight selected point and show properties
      this.currentElement.drawSelection(this.selection);
      this.view.showProperties("point", point);
      return
    }
    // Select line if we haven't found a point
    let line = this.getExistingLineFromEvent(event);
    if (line) {
      this.selection = {id: line.id, type: "line"};
      // Highlight selected point and show properties
      this.currentElement.drawSelection(this.selection);
      this.view.showProperties("line", line);
      return
    }
  }
  
  getExistingPointFromEvent(event) {
    let pos = this.getPosFromMouseEvent(event);
    let modelPos = this.viewConfig.pageCoordToModel(pos);
    let maxDist = this.viewConfig.getMaxDistForSelection();
    return this.model.findClosestPoint(modelPos, maxDist);
  }
  
  getExistingLineFromEvent(event) {
    let pos = this.getPosFromMouseEvent(event);
    let modelPos = this.viewConfig.pageCoordToModel(pos);
    let maxDist = this.viewConfig.getMaxDistForSelection();
    return this.model.findClosestLine(modelPos, maxDist);
  }
  
  placeObjectFromMeasureFields() {
    if (!this.mode) {
      return;
    }
    if (this.mode == "point") {
      let pos = this.getPointFromMeasureFields();
      if (pos == null) {
        return;
      }
      this.model.addPoint(pos);
    } else if (this.mode == "line") {
      let startEnd = this.getLineFromMeasureFields();
      if (startEnd == null) {
        return;
      }
      this.model.addLine(startEnd);
    }
    this.onModelChange(true);
    // Prepare input field for next element
    this.view.selectFirstInputField();
  }
  
  paint() {
    // Only repaint if simulation is running (since that means
    // that the model might have changed).
    if (this.simulationState.running) {
      this.view.paint();
      requestAnimationFrame($.proxy(this.paint, this));
    }
  }
  
  installHandlers() {
    $('body').keydown($.proxy(this.onKeydown, this));
    $('#currentElementCanvas').mousemove($.proxy(this.onMousemove, this));
    $('#currentElementCanvas').click($.proxy(this.onClick, this));
    $('#currentElementCanvas').on('wheel', $.proxy(this.onWheel, this));
    $('#currentJson').change($.proxy(this.onJsonChange, this));
    $('#propertiesTab').find("input,select").change($.proxy(this.onPropertyChange, this));
    $('#propertiesButton').click(() => {this.view.displayTab("properties")});
    $('#jsonButton').click(() => {this.view.displayTab("json")});
  }
}