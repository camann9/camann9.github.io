$(function() {

  var PIXEL_RATIO = (function() {
    var ctx = document.createElement("canvas").getContext("2d"), dpr = window.devicePixelRatio || 1, bsr = ctx.webkitBackingStorePixelRatio
        || ctx.mozBackingStorePixelRatio
        || ctx.msBackingStorePixelRatio
        || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
  })();

  let running = false;
  let runStart = 0;
  let viewport = new Viewport(100, 100, -10, -10, 10, PIXEL_RATIO);

  function layout() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvas = $("#mainCanvas").get(0);
    // For canvas use HTML properties (for the interior size of the canvas)
    // and CSS properties (for the display size on the page) which will result
    // in non-blurry rendering
    let canvasDisplayHeight = (height - 30);
    let canvasDisplayWidth = (width * 0.7);
    canvas.height = canvasDisplayHeight * PIXEL_RATIO;
    canvas.width = canvasDisplayWidth * PIXEL_RATIO;
    canvas.style.height = canvasDisplayHeight + "px";
    canvas.style.width = canvasDisplayWidth + "px";
    viewport.setDisplaySize(canvasDisplayWidth * PIXEL_RATIO,
        canvasDisplayHeight * PIXEL_RATIO);

    // Text field is simple, just use CSS properties
    let textField = $("#currentJson");
    textField.height(canvasDisplayHeight);
    textField.width(width - canvasDisplayWidth - 50);

    // The input fields for measures need to be in the lower right hand corner of
    // the canvas
    let measureInputFields = $("#measureInputFieldsContainer");
    let measureInputFieldsPosition = $("#mainCanvas").offset();
    measureInputFieldsPosition.top += canvasDisplayHeight - measureInputFields.height();
    measureInputFieldsPosition.left += canvasDisplayWidth - measureInputFields.width();
    measureInputFields.offset(measureInputFieldsPosition);

    // Repaint canvas after layout
    paint(true);
  }

  function paint(ignoreRunning) {
    // Abort repaint loop
    if (!running && !ignoreRunning) {
      return;
    }
    if (running) {
      requestAnimationFrame(paint);
    }

    let canvas = $("#mainCanvas").get(0);
    let canvasContext = canvas.getContext("2d");
    viewport.clear(canvasContext);
    viewport.drawAxes(canvasContext);
    let msSinceStart = performance.now() - runStart;
    canvasContext.font = '40pt Arial'
    canvasContext.fillText(msSinceStart, 100, 100);
  }

  $('body').keydown(function(event) {
    if ($("#currentJson").is(":focus")) {
      // Nothing to do if user focuses on text area
      // We want to let them enter stuff
      return;
    }
    event.preventDefault();
    if (event.key == " ") {
      running = !running;
      if (running) {
        runStart = performance.now();
        requestAnimationFrame(function() {
          paint(false);
        });
      }
    }
  });

  $(window).resize(function() {
    requestAnimationFrame(layout);
  });
  layout();
})