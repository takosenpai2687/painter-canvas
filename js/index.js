let painter;
let colorpicker;

// document ready event
$(document).ready(() => {
    // call resize once
    resize();
    // initialize canvas instances
    painter = new Painter();
    colorpicker = new ColorPicker();
    // get current focused color on colorpicker
    const hex = colorpicker.getColor();
    // set color to painter
    painter.setColor(hex);
    // display current color
    $(".color").css("background", painter.color);
    $(".color-icon").css("background", painter.color);
    // display current mode
    $(`.mode[value="${painter.mode}"]`).addClass("active");
    // display current thickness
    $("#thickness").html(`${painter.thickness} px`);
});

// adjust canvas size upon window resize
$(window).on("resize", resize);

// onchange event for thickness slider
$(".slider").on("input change", (e) => {
    painter.setThickness(e.target.value);
    $("#thickness").html(`${painter.thickness} px`);
});

// onchange event for color multiplier
$("#color-mult").on("input change", (e) => {
    colorpicker.mult = e.target.value;
    $(".color-icon").css("background", colorpicker.getColor());
});

// onclick event for switching modes
$(".mode").bind("click", (e) => {
    painter.setMode(parseInt(e.target.value));
    $(".mode").removeClass("active");
    $(e.target).addClass("active");
});

// onclick event for openinng color picker
$(".color").on("click", () => {
    $(".color-container").css("display", "block");
});

// onclick event for setting color confirm button
$("#btn-setColor").on("click", () => {
    var color = $(".color-icon").css("background");
    color = rgb2hex(color);
    $(".color").css("background", color);
    painter.setColor(color);
    $(".color-container").css("display", "none");
});

// onclick event for undo button
$("#btn-undo").on("click", () => {
    painter.undo();
    restoreCtx();
});

// onclick event for redo button
$("#btn-redo").on("click", () => {
    painter.redo();
    restoreCtx();
});

// resize function called upon window resize
function resize() {
    // resize canvas if applicable
    if (painter) {
        painter.resize();
        painter.reDraw(painter.undoStack);
    }
    // resize DOM elements
    $(".content-wrapper").css("height", `${window.innerHeight - 30 * 2}px`);
    $(".canvas-container").css("height", `${window.innerHeight - 30 * 2}px`);
    $(".toolbar").css("height", `${window.innerHeight - 30 * 2}px`);
}

// restore ctx settings called after undo/redo
function restoreCtx() {
    var color = $(".color").css("background");
    color = rgb2hex(color);
    painter.setColor(color);
    var thickness = $("#thickness")[0].value;
    painter.setThickness(thickness);
}

// retrieve hex color value given a css rgba string
function rgb2hex(rgb) {
    rgb = rgb.match(/rgb\((\d+), (\d+), (\d+)\)/i);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
