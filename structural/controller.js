class Controller {
  constructor(model, simulationState, currentElement, viewport, view) {
    this.model = model;
    this.simulationState = simulationState;
    this.currentElement = currentElement;
    this.viewport = viewport;
    this.view = view;
    this.mode = null;
    this.mousePos = null;
    this.selection = null;
    this.selectionType = null;
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
      if (!this.mode) {
        // We're not in any mode so ignore input
        return;
      }
      if (!this.view.advanceFocus()) {
        return;
      }
    } else if(event.key == "Enter") {
      if (!(this.mode == "point")) {
        return;
      }
      let pos = this.getPosFromInputFields();
      if (pos == null) {
        return;
      }
      this.model.addPoint(pos);
      this.view.paint();
      this.updateModelStorage(true);
      // Prepare input field for next element
      this.view.selectFirstInputField();
    } else if(event.key == " " || event.key == "Escape") {
      this.mode = null;
      this.clearSelection();
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
  
  onClick() {
    if (!this.mode) {
      // Select point
      let pos = this.getPosFromMouseEvent(event);
      let modelPos = this.viewport.pageCoordToModel(pos);
      let maxDist = this.viewport.getMaxDistForSelection();
      let point = this.model.findClosestPoint(modelPos, maxDist);
      if (point) {
        this.selection = point;
        this.selectionType = "point";
        // Highlight selected point
        this.currentElement.drawSelectedPoint(point);
      }
    } else if (this.mode == "point") {
      this.model.addPoint(this.viewport.pageCoordToModel(this.getPosFromMouseEvent(event)));
      // Prepare input field for next element
      this.view.selectFirstInputField();
    }
    this.view.paint();
    this.updateModelStorage(true);
  }

  onJsonChange() {
    try {
      this.model.updateFromJson($('#currentJson').val());
    } catch(ex) {
      console.log(ex);
      $('#currentJson').addClass("incorrect");
      return;
    }
    this.updateModelStorage(false);
    this.view.paint();
  }
  
  updateModelStorage(updateText) {
    // Populate side bar with model data and store model in cookie
    let modelJson = this.model.toJson();
    if (updateText) {
      $('#currentJson').val(modelJson);
    }
    $('#currentJson').removeClass("incorrect");
    Cookies.set('model', btoa(modelJson));
  }
  
  onMousemove(event) {
    this.mousePos = this.getPosFromMouseEvent(event);
    this.view.updateMousePos(this.viewport.pageCoordToModel(this.mousePos));
    if (this.mode == "point") {
      this.currentElement.drawDot(this.mousePos);
    }
  }
  
  onWheel(event) {
    var delta = event.originalEvent.deltaY;

    if (delta > 0) {
      this.viewport.zoom(1 / 1.25, this.mousePos);
    } else {
      this.viewport.zoom(1.25, this.mousePos);
    }
    this.updateModelStorage(true);
    this.view.paint();

    // Prevent default
    return false;
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
  
  clearSelection() {
    this.currentElement.clear();
    this.selection = null;
    this.selectionType = null;
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
  }
}