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
	this.bytePixels; // Uint8Array holding pixel values after build
	this.imageData;
}

PODASTImage.prototype.updateCustomImage = function() {
	// create array of pixel.value arrays
	const valuesArray = this.pixels.map(a => a.value);
	// join the pixels into a Uint8Array for a speed-up
	this.bytePixels = Uint8Array.from([].concat.apply([], valuesArray));
	this.imageData = ctx.getImageData(this.topLeft.x, this.topLeft.y, this.dimensions.width, this.dimensions.height);
	this.imageData.data.set(this.bytePixels);
}

PODASTImage.prototype.encrypt = function(plaintext, i, p, d) {
	// copy self to new, to be encrypted image
	let newImage = new PODASTImage();
	Object.assign(newImage, this);
	// divide the plaintext binary into small portions, ready to be divided over the to be altered pixels
	let dataPortions = plaintext.match(new RegExp("[01]{1," + d + "}", "g")); // "0111001" --> ["01", "11", "00", "1"] (example I)
	// add bits indicator
	dataPortions.push(addLeadingZeroes(decimalToBinary(dataPortions[dataPortions.length - 1].length), d));
	if(DEBUGGING >= 3) {
		console.log("data portions: ", dataPortions);
	}
	// hide each portion in a different pixel
	let pixelIndex = i;
	let previousPixel;
	const pixelsRange = Math.pow(2, p); // look for pixels 0 to pixelsRange pixels from current
	// NOTE we are altering newImage, not this
	for(var m = 0; m < dataPortions.length - 1; m++) {
		const currentPixel = newImage.pixels[pixelIndex];
		const currentData = dataPortions[m];
		const nextData = dataPortions[m + 1];
		const currentPointer = 0;
		// update data for current pixel
		currentPixel.binaryData = currentData;
		const relativeNextPixelIndex = newImage.getNextPixelIndex(nextData, pixelIndex, pixelsRange, p, d);
		if(relativeNextPixelIndex === false) {
			if(DEBUGGING >= 1) {
				console.warn("PODAST was unable to complete the encryption process with the following \n" +
					"parameters: i=" + i + ", p=" + p + ", d=" + d + ", because it couldn't find any unaltered \n" +
					"pixels within " + pixelsRange + " pixels from the current pixel.\n" +
					"Please retry with different parameters, different text or a different image.");
			}
			return false;
		} else {
			// update pointer for current pixel
			currentPixel.binaryPointer = addLeadingZeroes(decimalToBinary(relativeNextPixelIndex), p);
			if(m === dataPortions.length - 2) {
				// possible bug: should be modularized or not?
				const nextPixelIndex = pixelIndex + relativeNextPixelIndex;
				let nextPixel = newImage.pixels[nextPixelIndex];
				// update data in advance
				nextPixel.binaryData = nextData;
				// because that pixel will be the last, we can safely set the pointer to 0-terminator
				nextPixel.binaryPointer = addLeadingZeroes(0, p);
				// done!
				if(DEBUGGING >= 1) {
					console.info("Success! PODAST successfully encrypted your data with the following parameters: \n" +
						"i=" + i + ", p=" + p + ", d=" + d + ". Want to share your encrypted image? First, download your \n" +
						"encrypted image, and send it to the receiver. Make sure you also share your decryption key: \n" +
						"%c" + generatePrivateKey(i, p, d) + "%c , or else the receiver won't be able to read your message.", "font-weight: 900", "font-weight: initial");
				}
				break;
			}
		}
		pixelIndex += relativeNextPixelIndex;
	}
	return newImage;
};

// for debugging purposes
PODASTImage.prototype.inspectPixels = function() {
	for(var i = 0; i < this.pixels.length; i++) {
		if(this.pixels[i].isAltered()) console.log("Altered pixel at (" + i + "): ", this.pixels[i]);
	}
};

PODASTImage.prototype.getNextPixelIndex = function(data, index, lookahead, p, d) {
	let response = false;
	for(var i = index + 1 /* current is bound to be altered */; i < index + lookahead; i++) {
		// TODO optimize?
		const actualIndex = i % this.pixels.length;
		if(this.pixels[actualIndex].isAltered()) {
			// can't alter it twice, would corrupt existing data
			if(DEBUGGING >= 3) {
				console.log("pixel at (" + actualIndex + ") is altered.");
			}
			continue;
		} else {
			const authenticPixelData = this.pixels[actualIndex].getSignificanceArray().slice(-p-d, -p).join("");
			if(authenticPixelData === data) {
				response = actualIndex - index;
				break;
			} else if(actualIndex === index + lookahead - 1 && DEBUGGING >= 2) {
				console.info("Unable to find pixel that already contained the data we're trying to hide, using last pixel in range instead.");
				response = actualIndex - index;
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
	for(var i = 0; i < originalRgbaPixels.length - 3; i += 4) {
		this.pixels.push(new PODASTPixel(originalRgbaPixels.slice(i, i + 4)));
	}
	this.updateCustomImage();
};

PODASTImage.prototype.show = function() {
	if(typeof this.bytePixels === 'undefined') {
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
	} else {
		// show PODASTImage
		putImageData(ctx, this.imageData, this.topLeft.x, this.topLeft.y);
	}
};


// TODO: optimize with base64 data instead of changing fillstyle every pixel
// currently takes ~60ms to run for a 172x256 png!
function putImageData(ctx, imageData, dx, dy) {
  const data = imageData.data;
  const height = imageData.height;
  const width = imageData.width;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      const pos = (y * width + x) * 4;
      ctx.fillStyle = 'rgb(' + data[pos] + ',' + data[pos + 1] + ',' + data[pos + 2] + ')';
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}