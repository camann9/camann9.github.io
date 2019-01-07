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
  let viewport = new Viewport(100, 100, -10, -10, 10);
  
  function layout() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvas = $("#mainCanvas").get(0);
    let textField = $("#currentJson");
    // For canvas use HTML properties (for the interior size of the canvas)
    // and CSS properties (for the display size on the page) which will result
    // in non-blurry rendering
    let canvasPixelHeight = (height - 30);
    let canvasPixelWidth = (width * 0.7);
    canvas.height = canvasPixelHeight * PIXEL_RATIO;
    canvas.width = canvasPixelWidth * PIXEL_RATIO;
    canvas.style.height = canvasPixelHeight+"px";
    canvas.style.width =canvasPixelWidth+"px";
    viewport.setDisplaySize(canvasPixelWidth, canvasPixelHeight);

    // Text field is simple, just use CSS properties
    textField.height(canvasPixelHeight);
    textField.width(width - canvasPixelWidth - 50);
  }

  function paint() {
    // Abort repaint loop
    if (!running) {
      return;
    }
    requestAnimationFrame(paint);

    let canvas = $("#mainCanvas").get(0);
    let canvasContext = canvas.getContext("2d");
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
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
      runStart = performance.now();
      requestAnimationFrame(paint);
    }
  });

  $(window).resize(function() {
    requestAnimationFrame(layout);
  });
  layout();
})