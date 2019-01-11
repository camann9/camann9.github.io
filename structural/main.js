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
  let view = new View(model, simulationState);
  let currentElement = new CurrentElement(model);
  let controller = new Controller(model, simulationState, currentElement, viewConfig, view);
  
  function setCanvasHeightWidth(canvas, displayWidth, displayHeight) {
    // For canvas use HTML properties (for the interior size of the canvas)
    // and CSS properties (for the display size on the page) which will result
    // in non-blurry rendering
    canvas.width = displayWidth * PIXEL_RATIO;
    canvas.height = displayHeight * PIXEL_RATIO;
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
    viewConfig.setDisplaySize(displayWidth * PIXEL_RATIO,
        displayHeight * PIXEL_RATIO);
  }

  function layout() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasDisplayWidth = (width * 0.7);
    let canvasDisplayHeight = (height - 30);
    
    let canvasContainer = $("#canvasContainer");
    canvasContainer.width(canvasDisplayWidth);
    canvasContainer.height(canvasDisplayHeight);
    let mainCanvas = $("#mainCanvas");
    setCanvasHeightWidth(mainCanvas.get(0), canvasDisplayWidth, canvasDisplayHeight);
    let currentElementCanvas = $("#currentElementCanvas");
    setCanvasHeightWidth(currentElementCanvas.get(0), canvasDisplayWidth, canvasDisplayHeight);
    // The current element canvas is exactly on top of the main canvas
    mainCanvas.offset(canvasContainer.offset());
    currentElementCanvas.offset(canvasContainer.offset());

    // Tabs on right hand side
    let tabPane = $("#tabPane");
    tabPane.height(canvasDisplayHeight);
    tabPane.width(width - canvasDisplayWidth -30);

    // The input fields for measures need to be in the lower right hand corner of
    // the canvas
    let measureInputFields = $("#measureInputFieldsContainer");
    let measureInputFieldsPosition = $("#mainCanvas").offset();
    measureInputFieldsPosition.top += canvasDisplayHeight - measureInputFields.height();
    measureInputFieldsPosition.left += canvasDisplayWidth - measureInputFields.width();
    measureInputFields.offset(measureInputFieldsPosition);

    // Repaint canvas after layout
    view.paint();
  }

  controller.installHandlers();

  $(window).resize(function() {
    requestAnimationFrame(layout);
  });
  view.displayTab("properties");
  view.hideProperties();
  layout();
  controller.onModelChange(true);
})