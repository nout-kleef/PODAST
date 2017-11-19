// does it have something to do with displaying the images?
// place it in this document!

let imageWidth = 240;
let imageHeight = 120;
let imageMargin = 15;
let headerHeight = 50;
let headerMargin = 20;

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
	inputImage.show();
	outputImage.show();
}