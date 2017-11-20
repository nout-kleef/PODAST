function PODASTPixel(value) {
	this.value = value.slice(0, 3); // opacity is not needed
	this.binaryData = null;
	this.binaryPointer = null;
}

PODASTPixel.prototype.isAltered = () => this.binaryData && this.binaryPointer;

PODASTPixel.prototype.getSignificanceArray = function() {
	const r = addLeadingZeroes(decimalToBinary(this.value[0]), 8);
	const g = addLeadingZeroes(decimalToBinary(this.value[1]), 8);
	const b = addLeadingZeroes(decimalToBinary(this.value[2]), 8);
	if(DEBUGGING >= 3) {
		console.log(r,g,b);
	}
	let responseString = "";
	for(var i = 0; i < 8; i++) {
		responseString += r.charAt(i) + g.charAt(i) + b.charAt(i);
	}
	return responseString;
};