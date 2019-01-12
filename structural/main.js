var PIXEL_RATIO = (function() {
  var ctx = document.createElement("canvas").getContext("2d"), dpr = window.devicePixelRatio || 1, bsr = ctx.webkitBackingStorePixelRatio
      || ctx.mozBackingStorePixelRatio
      || ctx.msBackingStorePixelRatio
      || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

  return dpr / bsr;
})();

$(function() {
  let model = Controller.getModelFromCookie();
  let simulationState = new SimulationState();
  let viewConfig = model.viewConfig;
  let currentElement = new CurrentElement(model);
  let view = new View(model, currentElement, simulationState);
  let controller = new Controller(model, simulationState, currentElement, viewConfig, view);
  
  controller.installHandlers();

  $(window).resize(function() {
    requestAnimationFrame(view.layout.bind(view));
  });
  view.displayTab("properties");
  view.hideProperties();
  view.switchMeasureInputView(null);
  view.layout();
  controller.onModelChange(true);
})