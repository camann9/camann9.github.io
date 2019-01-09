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
  
  drawModel(canvasContext) {
    this.model.points.forEach((p) => {this.viewport.drawDot(canvasContext, p);});
  }
  
  updateMousePos(pos) {
    $("#xPos").val(pos.x);
    $("#yPos").val(pos.y);
  }
}