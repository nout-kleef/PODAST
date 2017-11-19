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

function init(i, p, d) {
	firstPixelIndex = i;
	pointerBits = p;
	dataBits = d;
	inputImage = new PODASTImage(imageMargin, headerHeight + headerMargin + imageMargin, imageWidth, imageHeight, "input");
	outputImage = new PODASTImage(imageMargin * 3 + imageWidth, headerHeight + headerMargin + imageMargin, imageWidth, imageHeight, "output");
}