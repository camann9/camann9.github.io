class Controller {
  constructor(model, simulationState, currentElement, viewport, view) {
    this.model = model;
    this.simulationState = simulationState;
    this.currentElement = currentElement;
    this.viewport = viewport;
    this.view = view;
    this.mode = null;
    this.mousePos = null;
  }
  
  onKeydown(event) {
    if ($("#currentJson").is(":focus")) {
      // Nothing to do if user focuses on text area
      // We want to let them enter stuff
      return;
    }
    
    if (event.key == "s") {
      event.preventDefault();
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
    } else if(event.key == " " || event.key == "Escape") {
      this.mode = null;
      this.currentElement.clear();
    }
  }
  
  static getModelFromCookie() {
    let modelBase64 = Cookies.get('model');
    if(!!modelBase64) {
      return new Model(atob(modelBase64));
    }
    return new Model();
  }
  
  onClick() {
    if (this.mode == null) {
      return;
    }
    if (this.mode == "point") {
      this.model.addPoint(this.viewport.pageCoordToModel(this.getPosFromMouseEvent(event)));
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
  
  getPosFromMouseEvent(event) {
    let canvasOffset = $('#mainCanvas').offset();
    let x = event.pageX - canvasOffset.left;
    let y = event.pageY - canvasOffset.top;
    return {x: x, y: y};
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
    $('#currentJson').change($.proxy(this.onJsonChange, this));
  }
}