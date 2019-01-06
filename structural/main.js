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

  function layout() {
    let width = $(window).width();
    let height = $(window).height();
    let canvas = $("#mainCanvas").get(0);
    let textField = $("#currentJson");
    // For canvas use HTML properties since using CSS properties scales the
    // canvas
    canvas.height = (height - 30) * PIXEL_RATIO;
    canvas.width = (width * 0.7) * PIXEL_RATIO;

    // textField.height(height-10);
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