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
      this.view.selectFirstInputField();
    } else if(event.key == ",") {
      if (!this.view.advanceFocus()) {
        return;
      }
      this.onModelChange(true);
    } else if(event.key == "Enter") {
      if (this.mode == "point") {
        this.placeObjectFromInputFields();
      } else if (this.selection) {
        // Trigger change on current input field
        this.onPropertyChange();
      }
    } else if(event.key == " " || event.key == "Escape") {
      this.mode = null;
      this.clearSelection();
    } else if(event.key == "d") {
      this.removeSelected();
      this.onModelChange(true);
    } else {
      return;
    }
    
    // If we're no longer in selection mode we need to clear the selection
    if (!!this.mode) {
      this.clearSelection();
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
  
  onClick(event) {
    if (!this.mode) {
      this.select(event);
    } else if (this.mode == "point") {
      this.model.addPoint(this.viewConfig.pageCoordToModel(this.getPosFromMouseEvent(event)));
      // Prepare input field for next element
      this.view.selectFirstInputField();
      this.onModelChange(true);
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
    this.onModelChange(false);
  }
  
  onMousemove(event) {
    this.mousePos = this.getPosFromMouseEvent(event);
    this.view.updateMousePos(this.viewConfig.pageCoordToModel(this.mousePos));
    if (this.mode == "point") {
      this.currentElement.drawDot(this.mousePos);
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
      let newPoint = {x: $("#propPointX").val(), y: $("#propPointY").val()};
      this.model.setPoint(this.selection.id, newPoint);
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
  
  getPosFromInputFields() {
    let canvasOffset = $('#mainCanvas').offset();
    let x = parseFloat($("#xPos").val());
    let y = parseFloat($("#yPos").val());
    if (x == NaN || y == NaN) {
      return null;
    }
    return {x: x, y: y};
  }
  
  removeSelected() {
    if (this.selection) {
      if (this.selection.type == "point") {
        this.model.removePoint(this.selection.id);
      }
    }
    this.clearSelection();
  }
  
  clearSelection() {
    this.selection = null;
    this.currentElement.clear();
    this.view.hideProperties();
  }
  
  select(event) {
    // Select point
    let pos = this.getPosFromMouseEvent(event);
    let modelPos = this.viewConfig.pageCoordToModel(pos);
    let maxDist = this.viewConfig.getMaxDistForSelection();
    let point = this.model.findClosestPoint(modelPos, maxDist);
    if (point) {
      this.selection = {id: point.id, type: "point"};
      // Highlight selected point and show properties
      this.currentElement.drawSelection(this.selection);
      this.view.showProperties("point", point);
    }
  }
  
  placeObjectFromInputFields() {
    if (!(this.mode == "point")) {
      return;
    }
    let pos = this.getPosFromInputFields();
    if (pos == null) {
      return;
    }
    this.model.addPoint(pos);
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
    $('#propertiesTab').find("input").change($.proxy(this.onPropertyChange, this));
    $('#propertiesButton').click(() => {this.view.displayTab("properties")});
    $('#jsonButton').click(() => {this.view.displayTab("json")});
  }
}