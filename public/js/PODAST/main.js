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
	// select new input image
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
			inputImage.build();
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
	// update text fields
	$("#plaintext").on("keyup change", function() {
		const plaintextBinary = toASCII($("#plaintext").val());
		$("#plaintextBinary").val(plaintextBinary);
	});
	$("#extractedBinary").on("keyup change", extractedUpdate);
	function extractedUpdate() {
		const extracted = fromASCII($("#extractedBinary").val());
		$("#extracted").val(extracted);
	}
	// buttons
	$("#encrypt").on("click", function() {
		const plaintextBinary = $("#plaintextBinary").val();
		const privateKey = inputImage.encrypt(plaintextBinary, firstPixelIndex, pointerBits, dataBits);
		// update private key
		$("#privateKey").val(privateKey);
	});
	$("#decrypt").on("click", function() {
		const privateKey = $("#privateKey").val();
		const extractedBinary = outputImage.decrypt(privateKey);
		$("#extractedBinary").val(extractedBinary);
		extractedUpdate();
	});
});

$("#defaultCanvas0").ready(function() {
	// make pictures downloadable
	$("#defaultCanvas0").on("click", function() {
		// check images
		if(inRect({mouseX, mouseY}, inputImage.topLeft, inputImage.dimensions)) {
			inputImage.download();
		} else if(inRect({mouseX, mouseY}, outputImage.topLeft, outputImage.dimensions)) {
			outputImage.download();
		}
	});
});

function inRect(point, topLeft, dimensions) {
	return point.mouseX >= topLeft.x && point.mouseX <= topLeft.x + dimensions.width && point.mouseY >= topLeft.y && point.mouseY <= topLeft.y + dimensions.height;
}

function toASCII(text) {
	let binaryString = "";
	for(var i = 0; i < text.length; i++) {
		binaryString += addLeadingZeroes(decimalToBinary(text.charAt(i).charCodeAt(0)), 8)
	}
	return binaryString;
}

function fromASCII(binaryString) {
	let text = "";
	for(var i = 0; i < binaryString.length; i += 8) {
		const byte = binaryString.slice(i, i + 8);
		text += String.fromCharCode(binaryToDecimal(byte));
	}
	return text;
}