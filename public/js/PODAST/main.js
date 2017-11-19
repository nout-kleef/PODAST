// does it have something to do with the control of the PODAST algorithm?
// place it in this document!

let inputImage; // the image that is uploaded by user
let outputImage; // the resulting image after either encryption or decryption

let firstPixelIndex; // pixel at which insertion and decryption initiates
let pointerBits; // amount of ending bits per altered pixel, indicating the location of next altered pixel
let dataBits; // amount of bits just before the pointer bits, holding the data that is being hidden
/* // Example
 * let pointerBits = 4;
 * let dataBits = 3;
 * // x: [0, 1]
 * // p: pointer bit
 * // d: data bit
 * // ordering the pixel bits by significance (descending):
 * let pixel = [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, d, d, d, p, p, p, p];
 * // 			r  g  b  r  g  b  r  g  b  r  g  b  r  g  b  r  g  b  r  g  b  r  g  b
 */

function init() {
	inputImage = new PODASTImage(imageMargin, headerHeight + headerMargin + imageMargin, imageWidth, imageHeight, "input");
	outputImage = new PODASTImage(imageMargin * 3 + imageWidth, headerHeight + headerMargin + imageMargin, imageWidth, imageHeight, "output");
	$(".imageHolder").on("click", function() {
		// deselect all
		$(".imageHolder").removeClass("selected");
		// load image
		if(DEBUGGING >= 3) {
			console.log($("img", this).attr("src"));
		}
		loadImage($("img", this).attr("src"), img => {
			resizeCanvasForNewImage(img.width, img.height);
			img.loadPixels();
			inputImage = new PODASTImage(imageMargin, headerHeight + headerMargin + imageMargin, imageWidth, imageHeight, "input", img);
			outputImage.topLeft.x = imageMargin * 3 + imageWidth;
			outputImage.dimensions = {
				width: img.width,
				height: img.height
			};
		}, event => {
			if(DEBUGGING >= 2) {
				console.warn("Something went wrong loading selected image");
			}
		});
		// select clicked
		$(this).addClass("selected");
	});
}

function resizeCanvasForNewImage(newWidth, newHeight) {
	imageWidth = newWidth;
	imageHeight = newHeight;
	resizeCanvas(getFullWidth(), getFullHeight());
}

$(document).ready(function() {
	// initiate variables
	firstPixelIndex = parseInt($("#firstPixelIndex").val());
	pointerBits = parseInt($("#pointerBits").val());
	dataBits = parseInt($("#dataBits").val());
	// keep variables up to date
	$("#firstPixelIndex").on("keyup change", function() {
		firstPixelIndex = parseInt($("#firstPixelIndex").val());
	});
	$("#pointerBits").on("keyup change", function() {
		pointerBits = parseInt($("#pointerBits").val());
	});
	$("#dataBits").on("keyup change", function() {
		dataBits = parseInt($("#dataBits").val());
	});
});