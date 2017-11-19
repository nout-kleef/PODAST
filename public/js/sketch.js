// does it have something to do with displaying the images?
// place it in this document!

let imageWidth = 240;
let imageHeight = 120;
let imageMargin = 15;
let headerHeight = 50;
let headerMargin = 10;

// called once, when page is ready
function setup() {
	init();
	const fullWidth = 2 * (imageWidth + 2 * imageMargin);
	const fullHeight = headerHeight + headerMargin + imageHeight + 2 * imageMargin;
	let canvas = createCanvas(fullWidth, fullHeight);
	canvas.parent("canvasHolder");
	frameRate(15);
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