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

PODASTImage.prototype.lastAction = "";

PODASTImage.prototype.updateCustomImage = function(bytePixels) {
	// create array of pixel.value arrays
	const valuesArray = typeof bytePixels === "undefined" ? this.pixels.map(a => a.value) : bytePixels;
	// join the pixels into a Uint8Array for a speed-up
	this.bytePixels = Uint8Array.from([].concat.apply([], valuesArray));
	this.imageData = ctx.getImageData(this.topLeft.x, this.topLeft.y, this.dimensions.width, this.dimensions.height);
	this.imageData.data.set(this.bytePixels);
};

PODASTImage.prototype.download = function() {
	let oldCanvas = document.getElementById("defaultCanvas0");
	let newCanvas = document.createElement("canvas");
	const w = this.dimensions.width;
	const h = this.dimensions.height;
	newCanvas.width = w;
	newCanvas.height = h;
	newCanvas.id = "downloadCanvas0";
	let newContext = newCanvas.getContext("2d");
	newContext.mozImageSmoothingEnabled = false;
	newContext.webkitImageSmoothingEnabled = false;
	newContext.msImageSmoothingEnabled = false;
	newContext.imageSmoothingEnabled = false;
	newContext.drawImage(oldCanvas, 2 * this.topLeft.x,  2 * this.topLeft.y, 2 * w, 2 * h, 0, 0, w, h);
	let newImage = document.createElement("img");
	// newImage.mozImageSmoothingEnabled = false;
	// newImage.webkitImageSmoothingEnabled = false;
	// newImage.msImageSmoothingEnabled = false;
	// newImage.imageSmoothingEnabled = false;
	newImage.src = newCanvas.toDataURL();
	console.log(newImage);
	const name = this.type + "_" + parseInt(this.dimensions.width, 10) + "X" + parseInt(this.dimensions.height, 10) + "P#i" + firstPixelIndex + "#p" + pointerBits + "#d" + dataBits;
	downloadImage(name, clearUrl(newCanvas.toDataURL()), "png");
};

const clearUrl = url => url.replace(/^data:image\/\w+;base64,/, '');

const downloadImage = (name, content, type) => {
  var link = document.createElement('a');
  link.style = 'position: fixed; left -10000px;';
  link.href = `data:application/octet-stream;base64,${encodeURIComponent(content)}`;
  link.download = /\.\w+/.test(name) ? name : `${name}.${type}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

PODASTImage.prototype.encrypt = function(plaintext, i, p, d) {
	if(arguments.length < 4) {
		if(DEBUGGING >= 2) {
			console.warn("Not enough parameters specified.");
		}
		return false;
	}
	if(typeof this.pixels === "undefined") {
		if(this.build() === false) {
			if(DEBUGGING >= 1) {
				console.info("Please select an image before encrypting data.");
			}
		}
		return false;
	}
	// copy img data
	outputImage.img = this.img;
	// prepare pixels
	outputImage.build();
	// Object.assign(outputImage, this);
	// divide the plaintext binary into small portions, ready to be divided over the to be altered pixels
	let dataPortions = plaintext.match(new RegExp("[01]{1," + d + "}", "g")); // "0111001" --> ["01", "11", "00", "1"] (example I)
	// add bits indicator
	try {
		dataPortions.push(addLeadingZeroes(decimalToBinary(dataPortions[dataPortions.length - 1].length), d));
	} catch(e) {
		// invalid binary data
		if(DEBUGGING >= 2) {
			console.warn("Invalid or empty binary data specified.");
		}
		dataPortions = [];
	}
	if(DEBUGGING >= 3) {
		console.log("data portions: ", dataPortions);
	}
	// hide each portion in a different pixel
	let pixelIndex = i;
	let previousPixel;
	const pixelsRange = Math.pow(2, p); // look for pixels 0 to pixelsRange pixels from current
	// NOTE we are altering outputImage, not this
	for(var m = 0; m < dataPortions.length - 1; m++) {
		const currentPixel = outputImage.pixels[pixelIndex];
		const currentData = dataPortions[m];
		const nextData = dataPortions[m + 1];
		const currentPointer = 0;
		// update data for current pixel
		currentPixel.insertData(currentData.split(""), p);
		const relativeNextPixelIndex = outputImage.getNextPixelIndex(nextData, pixelIndex, pixelsRange, p, d);
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
			currentPixel.insertPointer(addLeadingZeroes(decimalToBinary(relativeNextPixelIndex), p).split(""));
			if(m === dataPortions.length - 2) {
				// possible bug: should be modularized or not?
				const nextPixelIndex = pixelIndex + relativeNextPixelIndex;
				let nextPixel = outputImage.pixels[nextPixelIndex];
				// update data in advance
				nextPixel.insertData(nextData.split(""), p);
				// because that pixel will be the last, we can safely set the pointer to 0-terminator
				nextPixel.insertPointer(addLeadingZeroes(0, p).split(""));
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
	outputImage.updateCustomImage();
	PODASTImage.prototype.lastAction = "encrypt";
	return generatePrivateKey(i, p, d);
};

PODASTImage.prototype.decrypt = function() {
	let i;
	let d;
	let p;
	if(arguments.length === 0) {
		// invalid
		if(DEBUGGING >= 1) {
			console.warn("Not enough arguments specified.");
		}
		return false;
	} else if(arguments.length === 1) {
		// private key?
		let matches;
		try {
			matches = arguments[0].match(validatePrivateKeyRegEx);
		} catch(exception) {
			matches = null;
		}
		if(matches === null) {
			if(DEBUGGING >= 1) {
				console.warn("Invalid private key format specified.");
			}
			return false;
		}
		i = parseInt(matches[1], 10);
		d = parseInt(matches[2], 10);
		p = parseInt(matches[3], 10);
	} else if(arguments.length === 3) {
		i = arguments[0];
		d = arguments[1];
		p = arguments[2];
	}
	// using the pixels array would be cheating,
	// we have to assume that all we have is the Uint8Array,
	// because that is practically the picture a receiver would decrypt.

	// create new pixels array (local scope)
	const temporaryPixels = quickBuild(this.bytePixels);
	// currentPixel is temporaryPixels[i]
	let currentIndex = i;
	let currentPixel = temporaryPixels[currentIndex];
	let currentSignificanceArray = currentPixel.getSignificanceArray();
	let currentDecimalPointer = parseInt(currentSignificanceArray.slice(-p).join(""), 2);
	let binaryDataString = currentDecimalPointer === 0 ? "" /* may be stupid, but data wasn't intended to be read */ : currentSignificanceArray.slice(-d-p, -p).join("");
	// while not terminated (0-terminator in pointer)
	while(currentDecimalPointer !== 0) {
		currentIndex = (currentIndex + currentDecimalPointer) % temporaryPixels.length;
		currentPixel = temporaryPixels[currentIndex];
		currentSignificanceArray = currentPixel.getSignificanceArray();
		currentDecimalPointer = parseInt(currentSignificanceArray.slice(-p).join(""), 2);
		// remember, 0-terminator means that this piece of data tells us how many digits are meaningful.
		// it's not actual data.
		let currentDataPiece = currentSignificanceArray.slice(-d-p, -p).join("");
		if(currentDecimalPointer === 0) {
			const currentDataDecimalValue = parseInt(currentDataPiece, 2);
			// get previous data
			const previousDataPiece = binaryDataString.slice(-d);
			// get necessary part
			const previousActualData = previousDataPiece.slice(-currentDataDecimalValue);
			// cut out unnecessary digits and add necessary
			binaryDataString = binaryDataString.slice(0, -d) + previousActualData;
		} else {
			binaryDataString += currentDataPiece;
		}
	}
	PODASTImage.prototype.lastAction = "decrypt";
	return binaryDataString;
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
			} else if(actualIndex === index + lookahead - 1) {
				if(DEBUGGING >= 2) {
					console.info("Unable to find pixel that already contained the data we're trying to hide, using last pixel in range instead.");
				}
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
		if(PODASTImage.prototype.lastAction === "encrypt" && this.type === "input") {
			stroke(0, 0, 255, 170);
			strokeWeight(1);
			noFill();
			rect(this.topLeft.x - imageMargin * 0.25, this.topLeft.y - imageMargin * 0.25, this.dimensions.width + imageMargin * 0.5 - 1, this.dimensions.height + imageMargin * 0.5 - 1);
		} else if(PODASTImage.prototype.lastAction === "decrypt" && this.type === "output") {
			stroke(0, 0, 255, 170);
			strokeWeight(1);
			noFill();
			rect(this.topLeft.x - imageMargin * 0.25, this.topLeft.y - imageMargin * 0.25, this.dimensions.width + imageMargin * 0.5 - 1, this.dimensions.height + imageMargin * 0.5 - 1);
		}
	}
};


// TODO: optimize with base64 data instead of changing fillstyle every pixel
// currently takes ~60ms to run for a 172x256 png!
function putImageData(ctx, imageData, dx, dy) {
  const data = imageData.data;
  const height = imageData.height;
  const width = imageData.width;
  noStroke();
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      const pos = (y * width + x) * 4;
      ctx.fillStyle = 'rgb(' + data[pos] + ',' + data[pos + 1] + ',' + data[pos + 2] + ')';
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
}

function quickBuild(imageData) {
	let pixels = [];
	let originalRgbaPixels = Array.from(imageData);
	for(var i = 0; i < originalRgbaPixels.length - 3; i += 4) {
		pixels.push(new PODASTPixel(originalRgbaPixels.slice(i, i + 4)));
	}
	return pixels;
}