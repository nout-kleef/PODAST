// does it have something to do with displaying the images?
// place it in this document!

let imageWidth = 128;
let imageHeight = 120;
let imageMargin = 10;
let headerHeight = 25;
let headerMargin = 5;

let getFullWidth = function() {return 2 * (imageWidth + 2 * imageMargin)};
let getFullHeight = function() {return headerHeight + headerMargin + imageHeight + 2 * imageMargin};

// called once, when page is ready
function setup() {
	init();
	let canvas = createCanvas(getFullWidth(), getFullHeight());
	canvas.parent("canvasHolder");
	frameRate(15);
	// prevent antialiasing
	let ctx = document.getElementById("defaultCanvas0").getContext("2d");
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
}

// called Math.min(frameRate(), 60) times / second
function draw() {
	background(51);
	// display headers
	textSize(headerHeight * 0.6);
	textAlign(CENTER);
	noStroke();
	fill(217);
	text("input", imageMargin + imageWidth * 0.5, headerHeight * 0.8);
	text("output", imageMargin * 3 + imageWidth * 1.5, headerHeight * 0.8);
	// display images
	inputImage.show();
	outputImage.show();
}