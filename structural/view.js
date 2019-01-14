class View {
  constructor(model, currentElement, simulationState) {
    this.model = model;
    this.currentElement = currentElement;
    this.simulationState = simulationState;
    this.viewConfig = model.viewConfig;
  }
  
  paint() {
    let canvas = $("#mainCanvas").get(0);
    let canvasContext = canvas.getContext("2d");
    this.viewConfig.clear(canvasContext);
    this.viewConfig.drawAxes(canvasContext);
    this.drawModel(canvasContext);
    this.currentElement.redrawSelection();
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
    let firstChild = subContainer.children("input,select").first();
    firstChild.focus();
    firstChild.select();
  }
  
  advanceFocus() {
    let focussed = $(":focus");
    if (focussed.length == 0) {
      return false;
    }
    let next = focussed.nextAll("input,select").first();
    if (next.length == 0) {
      // wrap
      next = focussed.parent().children("input,select").first();
    }
    next.focus();
    // Select so user can overwrite text
    next.select();
    // Consume event so we don't get a comma in input box
    return true;
  }
  
  drawModel(canvasContext) {
    Object.values(this.model.points).forEach((p) => {
      this.viewConfig.drawDot(canvasContext, p, p.id, p.support, "black");
    });
    Object.values(this.model.lines).forEach((l) => {
      let p1 = this.model.points[l.start];
      let p2 = this.model.points[l.end];
      if (!!p1 && !!p2) {
        this.viewConfig.drawLineModelCoord(canvasContext, p1, p2, l.id, "black");
      }
    });
  }
  
  updateMousePos(pos) {
    let focussed = $(':focus');
    
    // Update everything. Either of them are going to be hidden but updating both doesn't hurt
    $("#measurePointX").val(pos.x);
    $("#measurePointY").val(pos.y);
    $("#mousePosX").val(pos.x);
    $("#mousePosY").val(pos.y);
 
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
      $("#propPointSupport").val(data.support);
    } else if (name == "line") {
      $("#propLineStart").val(data.start);
      $("#propLineEnd").val(data.end);
    }
    this.selectFirstPropertyField();
  }
  
  displayTab(name) {
    $("#tabButtons").children().removeClass("activeTabButton");
    $("#tabContainer").children().addClass("hidden");
    $("#" + name + "Button").addClass("activeTabButton");
    $("#" + name + "Tab").removeClass("hidden");
  }
  
  onModeChange(mode) {
    let modeMap = {line: "#lineFields", point: "#pointFields", null: "#mousePosFields"};
    let id = modeMap[mode];
    $("#measureInputFieldsContainer").children().addClass("hidden");
    $(id).removeClass("hidden");
    if (!!mode) {
      this.selectFirstInputField();
    }
    // Rearrange input fields
    this.layout();
  }
  
  setCanvasHeightWidth(canvas, displayWidth, displayHeight) {
    // For canvas use HTML properties (for the interior size of the canvas)
    // and CSS properties (for the display size on the page) which will result
    // in non-blurry rendering
    canvas.width = displayWidth * PIXEL_RATIO;
    canvas.height = displayHeight * PIXEL_RATIO;
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
    this.viewConfig.setDisplaySize(displayWidth * PIXEL_RATIO,
        displayHeight * PIXEL_RATIO);
  }

  layout() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasDisplayWidth = (width * 0.7);
    let canvasDisplayHeight = (height - 30);
    
    let canvasContainer = $("#canvasContainer");
    canvasContainer.width(canvasDisplayWidth);
    canvasContainer.height(canvasDisplayHeight);
    let mainCanvas = $("#mainCanvas");
    this.setCanvasHeightWidth(mainCanvas.get(0), canvasDisplayWidth, canvasDisplayHeight);
    let currentElementCanvas = $("#currentElementCanvas");
    this.setCanvasHeightWidth(currentElementCanvas.get(0), canvasDisplayWidth, canvasDisplayHeight);
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
    
    this.paint();
  }
}