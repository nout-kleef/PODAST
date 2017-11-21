function PODASTImage(x, y, w, h, type, img) {
	this.topLeft = {
		x: x,
		y: y
	};
	this.dimensions = {
		width: w,
		height: h
	};
	this.type = type === "output" ? "output" : "input";
	this.img = img;
	this.pixels;
	this.customImage;
}

PODASTImage.prototype.updateCustomImage = () => {
	let reader = new FileReader();
	// join the pixels into a Uint8Array
	// TODO: dont concat entire PODASTPixel instances, just the values
	const pixelValues = Uint8Array.from([].concat.apply([], this.pixels));
	reader.readAsBinaryString(this)
}

PODASTImage.prototype.encrypt = function(plaintext, i, p, d) {
	// copy self to new, encrypted image
	let newImage = new PODASTImage();
	Object.assign(newImage, this);
	// divide the plaintext binary into small portions, ready to be divided over the to be altered pixels
	let dataPortions = plaintext.match(new RegExp("[01]{1," + d + "}", "g")); // "0111001" --> ["01", "11", "00", "1"] (example I)
	// add bits indicator (see example II)
	dataPortions.push(addLeadingZeroes(decimalToBinary(dataPortions[dataPortions.length - 1].length), d));
	if(DEBUGGING >= 3) {
		console.log("data portions: ", dataPortions);
	}
	// hide each portion in a different pixel
	let pixelIndex = i;
	let previousPixel;
	const pixelsRange = Math.pow(2, p); // look for pixels 0 to pixelsRange pixels from current
	for(var m = 0; m < dataPortions.length; m++) {
		let currentPortion = dataPortions[m];
		let nextPortion;
		let relativeNextIndex;
		let currentPixel = this.pixels[pixelIndex];
		// update the data
		currentPixel.binaryData = currentPortion;
		if(m === dataPortions.length - 2) {
			/* This is the final iteration of actual data
			 * We need to check how many bits the last portion contains,
			 * because otherwise there is no way to tell if "01" or "1" was encrypted
			 * when we're decrypting a pixel.
			 * To solve this, we have to do perform 2 steps:
			 * 1: include a 00..(p times) terminator (0-terminator) in the final/nth pixel, to let the 
			 * 	decryption algorithm know it should not continue to the next pixel, because the entire 
			 * 	string has been decrypted.
			 * 2: in the nth pixel, we can use the freed up space (as we don't have to hide anything)
			 * 	for telling the algorithm which bits in the data part of the (n-1)th pixel are actual data,
			 * 	and which aren't.
			 * 	We do this by using the _value_ of the data part of the nth pixel to tell _how many_ bits
			 * 	in the (n-1)th pixel were actual data.
			 * 	For example: (example II)
			 * 		n-1: "01", n: "10" would mean: 2 ("10") of the data bits in (n-1) are actual data
			 * 		n-1: "10111", n: "01100" would mean: 4 ("00100") of the data bits in (n-1) are actual data,
			 * 			so the first 2 characters of "10111" should be discarded.
			 * 	That's why we add that final portion to the dataPortions element. (see note I)
			 */
		} else if(m === dataPortions.length - 1) {
		} else {
			nextPortion = dataPortions[m + 1];
			// find next pixel
			relativeNextIndex = getNextPixelIndex(nextPortion, pixelIndex, pixelsRange, p, d);
			if(relativeNextIndex === false) {
				if(DEBUGGING >= 1) {
					console.error("Could not encrypt with the following parameters; i: " + 
						i + ", p: " + p + ", d: " + d + ". Please retry with different parameters.");
				}
				return;
			}
			currentPixel.binaryPointer = addLeadingZeroes(decimalToBinary(relativeNextIndex), p);
		}
		pixelIndex += relativeNextIndex;
		previousPixel = currentPixel;
	}
};

PODASTImage.prototype.getNextPixelIndex = function(data, index, lookahead, p, d) {
	let response = false;
	for(var i = index; i < index + lookahead; i++) {
		if(this.pixels[i].isAltered()) {
			// can't alter it twice
			continue;
		} else {
			const currentPixelData = this.pixels[i].significanceArray.slice(-p-d, -p);
			if(currentPixelData === data || i === index + lookahead - 1) {
				if(i === index + lookahead - 1 && DEBUGGING >= 2) {
					console.info("Unable to find pixel that already contained the data we're trying to hide, using last pixel in range instead.");
				}
				response = i - index;
				break;
			}
		}
	}
	return response;
};

PODASTImage.prototype.build = function() {
	if(typeof this.img === "undefined" || this.img.pixels.length === 0) {
		if(DEBUGGING >= 2) {
			console.warn("Not ready to build image yet.");
		}
		return false;
	}
	this.pixels = [];
	let originalRgbaPixels = Array.from(this.img.pixels); // Uint8ClampedArray to Array
	while(originalRgbaPixels.length > 0) {
		const originalRgbaPixel = originalRgbaPixels.splice(0, 4);
		this.pixels.push(new PODASTPixel(originalRgbaPixel));
	}
};

PODASTImage.prototype.show = function() {
	if(typeof this.pixels === 'undefined' || this.pixels.length === 0) {
		if(typeof this.img !== 'undefined') {
			// show regular p5Image
			image(this.img, this.topLeft.x, this.topLeft.y);
		} else {
			// show box indicating where image can be shown
			noFill();
			stroke(127, 127, 0);
			strokeWeight(1);
			rect(this.topLeft.x, this.topLeft.y, this.dimensions.width, this.dimensions.height);
			// explanatory text
			textSize(headerHeight * 0.3);
			fill(217);
			noStroke();
			textAlign(CENTER);
			let str;
			if(this.type === "input") {
				str = "Upload an image to see it displayed here.";
			} else if(this.type === "output") {
				str = "Upload an image to see the image\n after encryption displayed here.";
			}
			text(str, this.topLeft.x + 0.5 * this.dimensions.width, this.topLeft.y + 0.5 * this.dimensions.height);
		}
	} else {
		// show PODASTImage
		let reader = new FileReader();
		
	}
};