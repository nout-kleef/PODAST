function PODASTPixel(value) {
	this.value = value;
	this.binaryData = null;
	this.binaryPointer = null;
}

PODASTPixel.prototype.insertPointer = function(binaryPointerArray) {
	let tempSignificanceArray = this.getSignificanceArray();
	// replace ending with new pointer
	Array.prototype.splice.apply(tempSignificanceArray, [-binaryPointerArray.length, binaryPointerArray.length].concat(binaryPointerArray));
	// insert
	this.updateValueFromSignificanceArray(tempSignificanceArray);
	// for debugging & to check if altered during encryption process
	this.binaryPointer = binaryPointerArray.join("");
};

PODASTPixel.prototype.insertData = function(binaryDataArray, p) {
	let tempSignificanceArray = this.getSignificanceArray();
	// replace with new data
	Array.prototype.splice.apply(tempSignificanceArray, [-binaryDataArray.length - p, binaryDataArray.length].concat(binaryDataArray));
	// insert
	this.updateValueFromSignificanceArray(tempSignificanceArray);
	// for debugging & to check if altered during encryption process
	this.binaryData = binaryDataArray.join("");
};

PODASTPixel.prototype.isAltered = function() {
	return !!(this.binaryData || this.binaryPointer);
}

PODASTPixel.prototype.getSignificanceArray = function() {
	const r = addLeadingZeroes(decimalToBinary(this.value[0]), 8);
	const g = addLeadingZeroes(decimalToBinary(this.value[1]), 8);
	const b = addLeadingZeroes(decimalToBinary(this.value[2]), 8);
	// const a = addLeadingZeroes(decimalToBinary(this.value[3]), 8);
	let responseString = "";
	for(var i = 0; i < 8; i++) {
		responseString += r.charAt(i) + g.charAt(i) + b.charAt(i);
	}
	return responseString.split("");
};

// NOTE: assumes rgb, not rgba
PODASTPixel.prototype.updateValueFromSignificanceArray = function(significanceArray) {
	let r = [];
	let g = [];
	let b = [];
	for(var i = 0; i < significanceArray.length - 2; i += 3) {
		r.push(significanceArray[i]);
		g.push(significanceArray[i + 1]);
		b.push(significanceArray[i + 2]);
	}
	this.value[0] = binaryToDecimal(r.join(""));
	this.value[1] = binaryToDecimal(g.join(""));
	this.value[2] = binaryToDecimal(b.join(""));

}