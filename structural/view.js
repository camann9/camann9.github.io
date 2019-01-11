class View {
  constructor(model, simulationState) {
    this.model = model;
    this.simulationState = simulationState;
    this.viewport = model.viewport;
  }
  
  paint() {
    let canvas = $("#mainCanvas").get(0);
    let canvasContext = canvas.getContext("2d");
    this.viewport.clear(canvasContext);
    this.viewport.drawAxes(canvasContext);
    this.drawModel(canvasContext);
  }
  
  selectFirstInputField() {
    this.selectFirstField("measureInputFieldsContainer");
  }
  
  selectFirstPropertyField() {
    this.selectFirstField("propertiesTab");
  }
  
  selectFirstField(type) {
    // First first visible child of input field container
    let subContainer = $("#" + type).children(":visible");
    // Then select first input element in that container
    subContainer.children("input").first().select();
  }
  
  advanceFocus() {
    let focussed = $(":focus");
    if (focussed.length == 0) {
      return false;
    }
    let next = focussed.nextAll("input").first();
    if (next.length == 0) {
      // wrap
      next = focussed.parent().children("input").first();
    }
    next.select();
    // Consume event so we don't get a comma in input box
    return true;
  }
  
  drawModel(canvasContext) {
    Object.values(this.model.points).forEach((p) => {
      this.viewport.drawDot(canvasContext, p);
    });
  }
  
  updateMousePos(pos) {
    let focussed = $(':focus');
    $("#xPos").val(pos.x);
    $("#yPos").val(pos.y);
    // Re-select field if it's currently focussed so user can enter text
    if (focussed.length > 0
        && focussed.parent().parent('#measureInputFieldsContainer').length > 0) {
      focussed.select();
    }
  }
  
  hideProperties() {
    this.showProperties("no");
  }
  
  showProperties(name, data) {
    $("#propertiesTab").children().addClass("hidden");
    $("#" + name + "Properties").removeClass("hidden");
    if (name == "point") {
      $("#propPointX").val(data.x);
      $("#propPointY").val(data.y);
    }
    this.selectFirstPropertyField();
  }
  
  displayTab(name) {
    $("#tabButtons").children().removeClass("activeTabButton");
    $("#tabContainer").children().addClass("hidden");
    $("#" + name + "Button").addClass("activeTabButton");
    $("#" + name + "Tab").removeClass("hidden");
  }
}