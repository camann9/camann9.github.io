class View {
  constructor(model, simulationState, viewport) {
    this.model = model;
    this.simulationState = simulationState;
    this.viewport = viewport;
  }
  
  paint() {
    let canvas = $("#mainCanvas").get(0);
    let canvasContext = canvas.getContext("2d");
    this.viewport.clear(canvasContext);
    this.viewport.drawAxes(canvasContext);
    this.drawModel(canvasContext);
  }
  
  selectFirstInputField() {
    // First first visible child of input field container
    let subContainer = $("#measureInputFieldsContainer").children(":visible");
    // Then select fiest input element in that container
    subContainer.children("input").first().select();
  }
  
  advanceFocus() {
    if ($("#xPos").is(":focus")) {
      $("#yPos").select();
      return true;
    } else if ($("#yPos").is(":focus")) {
      $("#xPos").select();
      return true;
    } else {
      // Nothing to do
      return false;
    }
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
}